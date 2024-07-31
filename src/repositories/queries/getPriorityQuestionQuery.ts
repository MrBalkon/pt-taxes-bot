import { QuestionPeriodTime, QuestionType } from "src/entities/question.entity";
import { FieldOption } from "src/entities/user-field.entity";

export interface FindQuestionResult {
	question: string;
	description: string;
	fieldId: number;
	options?: FieldOption[];
	type: QuestionType
	periodTime?: QuestionPeriodTime | null
}

export const GET_QUESTIONS_QUERY_BASE = `
WITH questions AS (
    SELECT * FROM questions
), questions_data AS (
    SELECT
        q.id,
        q.question,
        q.description,
        uf.options,
        q.field_id AS "fieldId",
        ua.field_value,
        ua.id AS "answerId",
        ua."year",
        ua."month",
        q."rank",
        q.period_time AS "periodTime",
        uf.fields_value_type AS "type",
        uf.field_life_span_type
    FROM questions q
    JOIN "user-fields" uf ON q.field_id = uf.id
    JOIN tasks_fields tf ON q.field_id = tf.field_id 
    JOIN "features-tasks" ft ON ft.task_id = tf.task_id
    JOIN "features-access" fa ON fa.feature_id = ft.feature_id
    LEFT JOIN "user-answers" ua ON ua.field_id = q.field_id 
    WHERE fa.user_id = $1
    ORDER BY "month"
), question_conditions AS (
    SELECT 
        qd.id,
        qd.question,
        qd.description,
        qd.options,
        qd."fieldId",
        qd.field_value,
        qd."answerId",
        qd."year",
        qd."month",
        qd."rank",
        qd."periodTime",
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
        qd."answerId",
        qd."year",
        qd."month",
        qd."rank",
        qd."periodTime",
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
        qd."answerId",
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
    GROUP BY
        qd.id,
        qd."answerId"
), filtered_conditioned_questions AS (
    SELECT 
        qwc.id,
        qwc.question,
        qwc.description,
        qwc.options,
        qwc."fieldId",
        qwc.field_value,
        qwc."answerId",
        qwc."year",
        qwc."month",
        qwc."rank",
        qwc."periodTime",
        qwc."type",
        qwc.field_life_span_type,
        0 AS conditions_count
    FROM questions_with_conditions qwc
    LEFT JOIN resolved_conditions rc ON rc.id = qwc.id OR rc."answerId" = qwc."answerId"
    WHERE conditions_count = count_resolved
), union_result AS (
    SELECT * FROM questions_without_conditions UNION SELECT * FROM filtered_conditioned_questions
), group_periodic_results AS (
    SELECT 
        ur.id,
        ur.question,
        ur.description,
        ur.options,
        ur."fieldId",
        array_agg(ur."answerId") FILTER (where ur."answerId" is not null) AS "answerIds",
        ur."year",
        array_agg(ur."month") AS "months",
        ur."rank",
        ur."periodTime",
        ur."type",
        ur.field_life_span_type
    FROM union_result ur
    GROUP BY
        ur.id,
        ur.question,
        ur.description,
        ur.options,
        ur."fieldId",
        ur."year",
        ur."rank",
        ur."periodTime",
        ur."type",
        ur.field_life_span_type
    HAVING
        (
            CASE
                WHEN ur."periodTime" = 'previous_quarter' THEN NOT array_agg(ur."month") @> $4::integer[] 
                ELSE TRUE
            END
        )
), unanswered_questions AS (
    SELECT
        *
    FROM group_periodic_results q
    WHERE (
        COALESCE (array_length(q."answerIds", 1), 0) = 0 OR q."periodTime" IS NOT NULL
    )
    AND (q."year" = $3 OR q."year" IS NULL)
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