import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionPeriodTime1722382761281 implements MigrationInterface {
  name = 'AddQuestionPeriodTime1722382761281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "period_time" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "REL_2a5694b2ad9651a81ef685b5ca"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "REL_2a5694b2ad9651a81ef685b5ca" UNIQUE ("field_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "period_time"`,
    );
  }
}
