import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskOneShotSchedules1722468404754
  implements MigrationInterface
{
  name = 'AddTaskOneShotSchedules1722468404754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task-schedule" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" ADD "one_shot_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task-schedule_type_enum" AS ENUM('one_shot', 'recurring')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" ADD "type" "public"."task-schedule_type_enum" NOT NULL DEFAULT 'recurring'`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" ALTER COLUMN "cron_experssion" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task-schedule" ALTER COLUMN "cron_experssion" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "task-schedule" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."task-schedule_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "task-schedule" DROP COLUMN "one_shot_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task-schedule" DROP COLUMN "is_active"`,
    );
  }
}
