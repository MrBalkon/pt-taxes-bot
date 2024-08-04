import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOperationParentId1722728446264 implements MigrationInterface {
    name = 'AddOperationParentId1722728446264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operations" ADD "parent_operation_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "parent_operation_id"`);
    }

}
