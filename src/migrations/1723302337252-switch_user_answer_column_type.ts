import { MigrationInterface, QueryRunner } from 'typeorm';

export class SwitchUserAnswerColumnType1723302337252
  implements MigrationInterface
{
  name = 'SwitchUserAnswerColumnType1723302337252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP COLUMN "field_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD "field_value" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP COLUMN "field_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD "field_value" bytea`,
    );
  }
}
