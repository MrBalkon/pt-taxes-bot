import { MigrationInterface, QueryRunner } from 'typeorm';

export class SwitchQuestionConditionsToFieldId1722772850315
  implements MigrationInterface
{
  name = 'SwitchQuestionConditionsToFieldId1722772850315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions-conditions" RENAME COLUMN "compare_question_id" TO "compare_field_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions-conditions" RENAME COLUMN "compare_field_id" TO "compare_question_id"`,
    );
  }
}
