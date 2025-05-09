import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeFieldValie1722284677292 implements MigrationInterface {
  name = 'ChangeTypeFieldValie1722284677292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP COLUMN "field_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD "field_value" bytea`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP COLUMN "field_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD "field_value" character varying`,
    );
  }
}
