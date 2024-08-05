import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameColumn1722825559364 implements MigrationInterface {
    name = 'RenameColumn1722825559364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user-fields" RENAME COLUMN "period_type" TO "field_life_span_type"`);
        await queryRunner.query(`ALTER TYPE "public"."user-fields_period_type_enum" RENAME TO "user-fields_field_life_span_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user-fields_field_life_span_type_enum" RENAME TO "user-fields_period_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user-fields" RENAME COLUMN "field_life_span_type" TO "period_type"`);
    }

}
