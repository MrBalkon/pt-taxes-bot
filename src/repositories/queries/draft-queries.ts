// WITH questions AS (
//     SELECT
//         q.id,
//         q.question,
//         q.description,
//         uf.options,
//         q.field_id AS "fieldId",
//         ua.field_value,
//         ua.id AS "answer_id",
//         q."rank",
//         uf.fields_value_type AS "type",
//         uf.field_life_span_type
//     FROM questions q
//     JOIN "user-fields" uf ON q.field_id = uf.id
//     JOIN tasks_fields tf ON q.field_id = tf.field_id
//     JOIN "features-tasks" ft ON ft.task_id = tf.task_id
//     JOIN "features-access" fa ON fa.feature_id = ft.feature_id
//     LEFT JOIN "user-answers" ua ON ua.field_id = q.field_id
//     WHERE fa.user_id = $1
// ), filtered_condition_questions AS (
//     SELECT
//         q.id,
//         q.question,
//         q.description,
//         q.options,
//         q."fieldId",
//         q.field_value,
//         q.id AS "answer_id",
//         q."rank",
//         q."type",
//         q.field_life_span_type
//     FROM "questions-conditions" qc
//     JOIN questions q ON q.id = qc.compare_question_id
//     WHERE
//         (
//             CASE
//                 WHEN qc."condition" = '=' THEN qc.compare_value = PGP_SYM_DECRYPT(field_value, $2)
//             END
//         )
// ), all_questions AS (
//     SELECT * FROM questions q
//     UNION (SELECT * FROM filtered_condition_questions)
// ), unanswered_questions AS (
//     SELECT * FROM all_questions q
//     WHERE q.answer_id IS NULL
// )
// SELECT * FROM filtered_condition_questions
// --ORDER BY RANK ASC
// --LIMIT 1
