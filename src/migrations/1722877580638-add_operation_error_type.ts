import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOperationErrorType1722877580638 implements MigrationInterface {
    name = 'AddOperationErrorType1722877580638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."operations_error_type_enum" AS ENUM('resource_unavailable', 'system_error')`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "error_type" "public"."operations_error_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "error_type"`);
        await queryRunner.query(`DROP TYPE "public"."operations_error_type_enum"`);
    }

}
