import { QuestionType } from "src/entities/question.entity";
import { FieldOption } from "src/entities/user-field.entity";

export interface FindQuestionResult {
	question: string;
	description: string;
	fieldId: number;
	options?: FieldOption[];
	type: QuestionType
}

export const GET_QUESTIONS_QUERY_BASE = `
	WITH questions_data AS (
		SELECT
			q.id,
			q.question,
			q.description,
			uf.options,
			q.field_id AS "fieldId",
			ua.field_value,
			ua.id AS "answer_id",
			q."rank",
			uf.fields_value_type AS "type",
			uf.field_life_span_type
		FROM questions q
		JOIN "user-fields" uf ON q.field_id = uf.id
		JOIN tasks_fields tf ON q.field_id = tf.field_id 
		JOIN "features-tasks" ft ON ft.task_id = tf.task_id
		JOIN "features-access" fa ON fa.feature_id = ft.feature_id
		LEFT JOIN "user-answers" ua ON ua.field_id = q.field_id 
		WHERE fa.user_id = $1
	), question_conditions AS (
		SELECT 
			qd.id,
			qd.question,
			qd.description,
			qd.options,
			qd."fieldId",
			qd.field_value,
			qd."answer_id",
			qd."rank",
			qd."type",
			qd.field_life_span_type,
			count(qc.id) AS conditions_count
		FROM questions_data qd
		LEFT JOIN "questions-conditions" qc ON qd.id = qc.source_question_id
		GROUP BY 
			qd.id,
			qd.question,
			qd.description,
			qd.options,
			qd."fieldId",
			qd.field_value,
			qd."answer_id",
			qd."rank",
			qd."type",
			qd.field_life_span_type
	), questions_without_conditions AS (
		SELECT * FROM question_conditions
		WHERE conditions_count = 0
	), questions_with_conditions AS (
		SELECT * FROM question_conditions
		WHERE conditions_count > 0
	), resolved_conditions AS (
		SELECT 
			qd.id,
			count(qd.id) AS count_resolved
		FROM questions_with_conditions qd
		JOIN "questions-conditions" qc ON qd.id = qc.source_question_id
		LEFT JOIN questions q_temp ON q_temp.id = qc.compare_question_id
		LEFT JOIN "user-answers" ua_temp ON ua_temp.field_id = q_temp.field_id
		WHERE 
			(
				CASE
					WHEN qc.id IS NULL THEN TRUE
					WHEN qc."condition" = '=' THEN qc.compare_value = PGP_SYM_DECRYPT(ua_temp.field_value, $2)
				END
			)
		GROUP BY qd.id
	), filtered_conditioned_questions AS (
		SELECT 
			qwc.id,
			qwc.question,
			qwc.description,
			qwc.options,
			qwc."fieldId",
			qwc.field_value,
			qwc."answer_id",
			qwc."rank",
			qwc."type",
			qwc.field_life_span_type,
			0 AS conditions_count
		FROM questions_with_conditions qwc
		JOIN resolved_conditions rc ON rc.id = qwc.id
		WHERE conditions_count = count_resolved
	), union_result AS (
		SELECT * FROM questions_without_conditions UNION SELECT * FROM filtered_conditioned_questions
	), unanswered_questions AS (
		SELECT * FROM union_result q
		WHERE q.answer_id IS NULL
	)
`

export const GET_QUESTIONS_QUERY = `
	${GET_QUESTIONS_QUERY_BASE}
	SELECT * FROM unanswered_questions
`

export const GET_QUESTIONS_COUNT = `
	${GET_QUESTIONS_QUERY_BASE}
	select count(id) from unanswered_questions
`

export const GET_PRIORITY_QUESTIONS_QUERY = `
	${GET_QUESTIONS_QUERY}
	ORDER BY rank ASC
	LIMIT 1
`