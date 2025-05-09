import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandOperationErrorType1722878593083
  implements MigrationInterface
{
  name = 'ExpandOperationErrorType1722878593083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."operations_error_type_enum" RENAME TO "operations_error_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."operations_error_type_enum" AS ENUM('resource_unavailable', 'system_error', 'exception')`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "error_type" TYPE "public"."operations_error_type_enum" USING "error_type"::"text"::"public"."operations_error_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."operations_error_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_retry_policy_operation_error_type_enum" RENAME TO "tasks_retry_policy_operation_error_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_retry_policy_operation_error_type_enum" AS ENUM('resource_unavailable', 'system_error', 'exception')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_retry_policy" ALTER COLUMN "operation_error_type" TYPE "public"."tasks_retry_policy_operation_error_type_enum" USING "operation_error_type"::"text"::"public"."tasks_retry_policy_operation_error_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tasks_retry_policy_operation_error_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_retry_policy_operation_error_type_enum_old" AS ENUM('resource_unavailable', 'system_error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_retry_policy" ALTER COLUMN "operation_error_type" TYPE "public"."tasks_retry_policy_operation_error_type_enum_old" USING "operation_error_type"::"text"::"public"."tasks_retry_policy_operation_error_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tasks_retry_policy_operation_error_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_retry_policy_operation_error_type_enum_old" RENAME TO "tasks_retry_policy_operation_error_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."operations_error_type_enum_old" AS ENUM('resource_unavailable', 'system_error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "operations" ALTER COLUMN "error_type" TYPE "public"."operations_error_type_enum_old" USING "error_type"::"text"::"public"."operations_error_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."operations_error_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."operations_error_type_enum_old" RENAME TO "operations_error_type_enum"`,
    );
  }
}
