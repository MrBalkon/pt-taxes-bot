import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTaskFieldsOutputRangeType1723324131521
  implements MigrationInterface
{
  name = 'UpdateTaskFieldsOutputRangeType1723324131521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_fields_time_range_type_enum" RENAME TO "tasks_fields_time_range_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_fields_time_range_type_enum" AS ENUM('previous_quarter', 'previous_quarter_months', 'previous_month', 'previous_year', 'year_ago')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ALTER COLUMN "time_range_type" TYPE "public"."tasks_fields_time_range_type_enum" USING "time_range_type"::"text"::"public"."tasks_fields_time_range_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tasks_fields_time_range_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_output_fields_time_range_type_enum" RENAME TO "tasks_output_fields_time_range_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_output_fields_time_range_type_enum" AS ENUM('previous_quarter', 'previous_quarter_months', 'previous_month', 'previous_year', 'year_ago')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_output_fields" ALTER COLUMN "time_range_type" TYPE "public"."tasks_output_fields_time_range_type_enum" USING "time_range_type"::"text"::"public"."tasks_output_fields_time_range_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tasks_output_fields_time_range_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_output_fields_time_range_type_enum_old" AS ENUM('previous_quarter', 'previous_month', 'previous_year', 'year_ago')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_output_fields" ALTER COLUMN "time_range_type" TYPE "public"."tasks_output_fields_time_range_type_enum_old" USING "time_range_type"::"text"::"public"."tasks_output_fields_time_range_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tasks_output_fields_time_range_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_output_fields_time_range_type_enum_old" RENAME TO "tasks_output_fields_time_range_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_fields_time_range_type_enum_old" AS ENUM('previous_quarter', 'previous_month', 'previous_year', 'year_ago')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ALTER COLUMN "time_range_type" TYPE "public"."tasks_fields_time_range_type_enum_old" USING "time_range_type"::"text"::"public"."tasks_fields_time_range_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tasks_fields_time_range_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_fields_time_range_type_enum_old" RENAME TO "tasks_fields_time_range_type_enum"`,
    );
  }
}
