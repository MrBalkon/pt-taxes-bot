import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTasksOutputFields1722815011134 implements MigrationInterface {
  name = 'AddTasksOutputFields1722815011134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tasks_output_fields" ("id" SERIAL NOT NULL, "task_id" integer NOT NULL, "field_id" integer NOT NULL, CONSTRAINT "PK_b6e03ab9c94e919ade95884f305" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_output_fields" ADD CONSTRAINT "FK_a8881c8a8daa178048aa1a06c61" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_output_fields" ADD CONSTRAINT "FK_68ff100e77b7c199ac9dc15afbc" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_output_fields" DROP CONSTRAINT "FK_68ff100e77b7c199ac9dc15afbc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_output_fields" DROP CONSTRAINT "FK_a8881c8a8daa178048aa1a06c61"`,
    );
    await queryRunner.query(`DROP TABLE "tasks_output_fields"`);
  }
}
