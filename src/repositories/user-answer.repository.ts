import { Injectable } from "@nestjs/common";
import { UserAnswer } from "src/entities/user-answer.entity";
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

	async updateAnswer(id: number, data: DeepPartial<UserAnswer>) {
		const { userValues, parameters } = this.prepareAnswerSaveData(data);

		return this.createQueryBuilder()
		  .update(UserAnswer)
		  .set(userValues)
		  .where('id = :id', { id })
		  .setParameters(parameters)
		  .execute();
	}

	async getAnswersByUserIdAndTaskId(userId: number, systemName: string) {
		return this.defaultSelector()
		  .leftJoin('field.taskFields', 'tf')
		  .where('answer.userId = :userId', { userId })
		  .andWhere('tf.system_name = :systemName', { systemName })
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
		const userValues: Record<string, any> = {
			...data,
			fieldValue: () => `PGP_SYM_ENCRYPT(:fieldValue,:encryptKey)`,
		}

		const parameters: Record<string, any> = {
			encryptKey: this.encryptKey,
			fieldValue: data.fieldValue,
		}

		return { userValues, parameters };
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