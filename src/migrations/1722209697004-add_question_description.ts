import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionDescription1722209697004 implements MigrationInterface {
  name = 'AddQuestionDescription1722209697004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
