import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsTimeRangeType1722817411112 implements MigrationInterface {
    name = 'AddFieldsTimeRangeType1722817411112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user-fields" RENAME COLUMN "field_life_span_type" TO "period_type"`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_fields_time_range_type_enum" AS ENUM('previous_quarter', 'previous_month', 'previous_year')`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD "time_range_type" "public"."tasks_fields_time_range_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_output_fields_time_range_type_enum" AS ENUM('previous_quarter', 'previous_month', 'previous_year')`);
        await queryRunner.query(`ALTER TABLE "tasks_output_fields" ADD "time_range_type" "public"."tasks_output_fields_time_range_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user-fields" DROP COLUMN "period_type"`);
        await queryRunner.query(`CREATE TYPE "public"."user-fields_period_type_enum" AS ENUM('permanent', 'monthly', 'quarterly', 'yearly')`);
        await queryRunner.query(`ALTER TABLE "user-fields" ADD "period_type" "public"."user-fields_period_type_enum" NOT NULL DEFAULT 'permanent'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user-fields" DROP COLUMN "period_type"`);
        await queryRunner.query(`DROP TYPE "public"."user-fields_period_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user-fields" ADD "period_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks_output_fields" DROP COLUMN "time_range_type"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_output_fields_time_range_type_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP COLUMN "time_range_type"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_fields_time_range_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user-fields" RENAME COLUMN "period_type" TO "field_life_span_type"`);
    }

}
