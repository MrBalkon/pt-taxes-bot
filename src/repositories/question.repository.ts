import { Injectable } from "@nestjs/common";
import { Question, QuestionType } from "src/entities/question.entity";
import { Feature, Repository } from "typeorm";
import { FeaturesRepository } from "./features.repository";
import { FieldOption } from "src/entities/user-field.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionCondition } from "src/entities/question-condition.entity";
import { FindQuestionResult, GET_PRIORITY_QUESTIONS_QUERY, GET_QUESTIONS_QUERY } from "./queries/getPriorityQuestionQuery";
import { ConfigService } from "src/modules/config/config.service";
import { getCurrentQuarter, getCurrentYear, getPreviousQuarter, getPreviousQuarterYear, getQuarterMonths } from "src/utils/date";

@Injectable()
export class QuestionRepository {
	private encryptKey = null;
	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(Question)
		private repository: Repository<Question>
	) {
		this.encryptKey = this.configService.get('DB_ENCRYPT_KEY');
	}

	async getPriorityQuestion(userId: number) {
		const currentYear = getPreviousQuarterYear();
		const previousQuarter = getPreviousQuarter();
		const previousQuarterMonths = getQuarterMonths(previousQuarter);
		const response = await this.repository.query(
			GET_PRIORITY_QUESTIONS_QUERY,
			[
				userId,
				currentYear,
				previousQuarterMonths,
				previousQuarter,
			]
		) as FindQuestionResult[];

		if (!response.length) {
			return null;
		}

		return response[0] as FindQuestionResult;
	}

	async getQuestionByUserIdAndFieldId(userId: number, fieldId: number) {
		const response = await this.repository.query(`
			SELECT
				q.question,
				q.description,
				q.field_id AS "fieldId",
				uf.OPTIONS,
				q."rank",
				q.period_time as "periodTime",
				uf.fields_value_type AS "type"
			FROM questions q
			JOIN "user-fields" uf ON q.field_id = uf.id
			JOIN tasks_fields tf ON q.field_id = tf.field_id 
			JOIN "features-tasks" ft ON ft.task_id = tf.task_id
			JOIN "features-access" fa ON fa.feature_id = ft.feature_id
			WHERE fa.user_id = $1 AND uf.id = $2
		`, [userId, fieldId]) as FindQuestionResult[];

		if (!response.length) {
			return null;
		}

		return response[0] as FindQuestionResult;
	}
}