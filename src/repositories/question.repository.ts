import { Injectable } from "@nestjs/common";
import { Question, QuestionType } from "src/entities/question.entity";
import { Feature, Repository } from "typeorm";
import { FeaturesRepository } from "./features.repository";
import { FieldOption } from "src/entities/user-field.entity";
import { InjectRepository } from "@nestjs/typeorm";

export interface FindQuestionResult {
	question: string;
	description: string;
	fieldId: number;
	options?: FieldOption[];
	type: QuestionType
}

@Injectable()
export class QuestionRepository {
	constructor(
		@InjectRepository(Question)
		private repository: Repository<Question>
	) {}

	async getQuestions(userId: number) {
		// return questions available for user's features's tasks
		// add join to return only questions without answers
		const response = await this.repository.query(`
			SELECT
				q.question,
				q.description,
				uf.options,
    			q.field_id AS "fieldId"
			FROM questions q
			JOIN "user-fields" uf ON q.field_id = uf.id
			JOIN tasks_fields tf ON q.field_id = tf.field_id 
			JOIN "features-tasks" ft ON ft.task_id = tf.task_id
			JOIN "features-access" fa ON fa.feature_id = ft.feature_id
			LEFT JOIN "user-answers" ua ON ua.field_id = q.field_id 
			WHERE fa.user_id = $1 AND ua.id IS NULL
		`, [userId])

		return response as FindQuestionResult[];
	}

	async getQuestionsCount(userId: number) {
		// return questions available for user's features's tasks
		// add join to return only questions without answers
		const response = await this.repository.query(`
			SELECT
				count(q.id)
			FROM questions q
			JOIN "user-fields" uf ON q.field_id = uf.id
			JOIN tasks_fields tf ON q.field_id = tf.field_id 
			JOIN "features-tasks" ft ON ft.task_id = tf.task_id
			JOIN "features-access" fa ON fa.feature_id = ft.feature_id
			LEFT JOIN "user-answers" ua ON ua.field_id = q.field_id
			WHERE fa.user_id = $1 AND ua.id IS NULL
		`, [userId]) as { count: number }[];

		return response[0].count;
	}

	async getPriorityQuestion(userId: number) {
		const response = await this.repository.query(`
			SELECT
				q.question,
				q.description,
				q.field_id AS "fieldId",
				uf.OPTIONS,
				q."rank",
				uf.fields_value_type AS "type"
			FROM questions q
			JOIN "user-fields" uf ON q.field_id = uf.id
			JOIN tasks_fields tf ON q.field_id = tf.field_id 
			JOIN "features-tasks" ft ON ft.task_id = tf.task_id
			JOIN "features-access" fa ON fa.feature_id = ft.feature_id
			LEFT JOIN "user-answers" ua ON ua.field_id = q.field_id
			WHERE fa.user_id = $1 AND ua.id IS NULL
			ORDER BY q.RANK ASC
			LIMIT 1
		`, [userId]) as FindQuestionResult[];

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