import { Injectable } from "@nestjs/common";
import { UserAnswer } from "src/entities/user-answer.entity";
import { UserField } from "src/entities/user-field.entity";
import { ConfigService } from "src/modules/config/config.service";
import { DataSource, DeepPartial, Repository } from "typeorm";

@Injectable()
export class UserAnswerRepository extends Repository<UserAnswer> {
	private encryptKey = null;
    constructor(
		private readonly configService: ConfigService,
		private dataSource: DataSource
	)
    {
        super(UserAnswer, dataSource.createEntityManager());
		this.encryptKey = this.configService.get('DB_ENCRYPT_KEY');
    }

	async saveAnswer(answer: UserAnswer) {
		return this.save(answer);
	}

	async getAnswersByUserId(userId: number) {
		return this.defaultSelector()
		  .where('answer.userId = :userId', { userId })
		  .execute();
	}

	async createAnswer(data: DeepPartial<UserAnswer>) {
		const { userValues, parameters } = this.prepareAnswerSaveData(data);

		return this.createQueryBuilder()
		  .insert()
		  .into(UserAnswer)
		  .values(userValues)
		  .setParameters(parameters)
		  .execute();
	}

	async createOrUpdateAnswerByFieldSystemName(userId: number, systemName: string, data: DeepPartial<UserAnswer>) {
		const field = await this.dataSource.getRepository(UserField).findOneBy({ systemName });

		return this.createOrUpdateAnswerByFieldId(userId, field.id, data);
	}

	async createOrUpdateAnswerByFieldId(userId: number, fieldId: number, data: DeepPartial<UserAnswer>) {
		const answers = await this.defaultSelector()
		  .where('answer.userId = :userId', { userId })
		  .andWhere('field.id = :fieldId', { fieldId })
		  .execute();

		if (answers.length) {
			return this.updateAnswer(answers[0].id, data);
		}

		return this.createAnswer({
			...data,
			userId,
			fieldId,
		});
	}

	async createAnswerBulk(data: DeepPartial<UserAnswer>[]) {
		let baseParameters = this.prepareEncryptKey();
		const values = data.map((answer) => {
			const { userValues, parameters } = this.prepareAnswerSaveData(answer);

			baseParameters = { ...baseParameters, ...parameters };

			return userValues;
		});

		return this.createQueryBuilder()
		  .insert()
		  .into(UserAnswer)
		  .values(values)
		  .setParameters(baseParameters)
		  .execute();
	}

	async updateAnswer(id: number, data: DeepPartial<UserAnswer>) {
		const { userValues, parameters } = this.prepareAnswerSaveData(data);
		parameters.encryptKey = this.encryptKey;

		return this.createQueryBuilder()
		  .update(UserAnswer)
		  .set(userValues)
		  .where('id = :id', { id })
		  .setParameters(parameters)
		  .execute();
	}

	async getAnswersByUserIdAndTaskSystemName(userId: number, systemName: string) {
		return this.defaultSelector()
		  .leftJoin('field.taskFields', 'tf')
		  .where('answer.userId = :userId', { userId })
		  .andWhere('tf.system_name = :systemName', { systemName })
		  .execute();
	}

	async getAnswersByUserIdAndFieldSystemNames(userId: number, fieldsSystemNames: string[]) {
		return this.defaultSelector()
		  .where('answer.userId = :userId', { userId })
		  .andWhere('field.system_name IN (:...fieldsSystemNames)', { fieldsSystemNames })
		  .execute();
	}

	async setAnswerError(userId: number, fieldsSystemName: number, error: string) {
		return this.createQueryBuilder()
		  .update(UserAnswer)
		  .set({ error })
		  .where('userId = :userId', { userId })
		  .andWhere('field.system_name = :fieldsSystemName', { fieldsSystemName })
		  .execute();
	}

	async deleteAnswer(userId: number, fieldsSystemName: string) {
		const answers = await this.defaultSelector()
		  .where('answer.userId = :userId', { userId })
		  .andWhere('field.system_name = :fieldsSystemName', { fieldsSystemName })
		  .execute();

		if (!answers.length) {
			return;
		}

		return this.delete(
			answers[0].id,
		);
	}

	async deleteAnswerBulk(userId: number, fieldsSystemNames: string[]) {
		const answers = await this.defaultSelector()
		  .where('answer.userId = :userId', { userId })
		  .andWhere('field.system_name IN (:...fieldsSystemNames)', { fieldsSystemNames })
		  .execute();

		if (!answers.length) {
			return;
		}

		return this.delete(
			answers.map((answer) => answer.id),
		);
	}

	private prepareAnswerSaveData(data: DeepPartial<UserAnswer>) {
		const valueId = `fieldValue${data.id}`
		const userValues: Record<string, any> = {
			...data,
			fieldValue: () => `PGP_SYM_ENCRYPT(:${valueId},:encryptKey)`,
		}

		const parameters: Record<string, any> = {
			[valueId]: data.fieldValue,
		}

		return { userValues, parameters };
	}

	private prepareEncryptKey() {
		return {
			encryptKey: this.encryptKey,
		}
	}

	private defaultSelector() {
		return this
		  .createQueryBuilder('answer')
		  .leftJoinAndSelect('answer.field', 'field')
		  .select(
			`
				answer.id,
				field.field_name as "fieldName",
				field.system_name as "fieldSystemName",
				field.field_life_span_type as "fieldLifeSpanType",
				answer.field_id as "fieldId",
				answer.user_id as "userId",
				answer.year,
				answer.month,
			  	PGP_SYM_DECRYPT(answer.field_value, :encryptKey) as "fieldValue"
			`,
		  )
		  .setParameter('encryptKey', this.encryptKey);
	}
}