import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionDescription1722209697003 implements MigrationInterface {
  name = 'AddQuestionDescription1722209697003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "description" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "description"`,
    );
  }
}
