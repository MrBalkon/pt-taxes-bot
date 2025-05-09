import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskSchedules1722463142228 implements MigrationInterface {
  name = 'AddTaskSchedules1722463142228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task-schedule" ("id" SERIAL NOT NULL, "cron_experssion" character varying NOT NULL, "task_payload" jsonb NOT NULL, "task_id" integer NOT NULL, "user_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_abe6a19bb6fbe48d8aa38c8bace" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "operations" ("id" SERIAL NOT NULL, "task_id" integer NOT NULL, "user_id" integer, "error" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" ADD CONSTRAINT "FK_517f245a06f246bbe4e34a76c65" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" ADD CONSTRAINT "FK_09f4dc4139e3b3c32bd4fd244a0" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ADD CONSTRAINT "FK_140d3d8fe7db297a0ca81ca7949" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ADD CONSTRAINT "FK_7d416e8bb958cabd9256e9a8e5e" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "operations" DROP CONSTRAINT "FK_7d416e8bb958cabd9256e9a8e5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" DROP CONSTRAINT "FK_140d3d8fe7db297a0ca81ca7949"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" DROP CONSTRAINT "FK_09f4dc4139e3b3c32bd4fd244a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" DROP CONSTRAINT "FK_517f245a06f246bbe4e34a76c65"`,
    );
    await queryRunner.query(`DROP TABLE "operations"`);
    await queryRunner.query(`DROP TABLE "task-schedule"`);
  }
}
