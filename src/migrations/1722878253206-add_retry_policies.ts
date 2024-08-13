import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRetryPolicies1722878253206 implements MigrationInterface {
  name = 'AddRetryPolicies1722878253206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_retry_policy_operation_error_type_enum" AS ENUM('resource_unavailable', 'system_error')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_retry_policy_retry_policy_enum" AS ENUM('no_retry', 'retry_after_hours', 'retry_immediately_times', 'retry_after_days', 'retry_after_weeks')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks_retry_policy" ("id" SERIAL NOT NULL, "operation_error_type" "public"."tasks_retry_policy_operation_error_type_enum" NOT NULL, "retry_policy" "public"."tasks_retry_policy_retry_policy_enum" NOT NULL DEFAULT 'no_retry', "value" character varying NOT NULL, "task_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_73aa4f51338c4aadde376e4aab7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "operations" ADD "payload" jsonb`);
    await queryRunner.query(
      `CREATE TYPE "public"."operations_error_type_enum" AS ENUM('resource_unavailable', 'system_error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ADD "error_type" "public"."operations_error_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_retry_policy" ADD CONSTRAINT "FK_c0ed9d95d9acf7aed100bb58669" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_retry_policy" DROP CONSTRAINT "FK_c0ed9d95d9acf7aed100bb58669"`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" DROP COLUMN "error_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."operations_error_type_enum"`);
    await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "payload"`);
    await queryRunner.query(`DROP TABLE "tasks_retry_policy"`);
    await queryRunner.query(
      `DROP TYPE "public"."tasks_retry_policy_retry_policy_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tasks_retry_policy_operation_error_type_enum"`,
    );
  }
}
