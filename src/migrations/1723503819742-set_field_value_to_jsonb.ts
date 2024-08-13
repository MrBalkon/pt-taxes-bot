import { MigrationInterface, QueryRunner } from "typeorm";

export class SetFieldValueToJsonb1723503819742 implements MigrationInterface {
    name = 'SetFieldValueToJsonb1723503819742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user-answers" DROP COLUMN "field_value"`);
        await queryRunner.query(`ALTER TABLE "user-answers" ADD "field_value" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user-answers" DROP COLUMN "field_value"`);
        await queryRunner.query(`ALTER TABLE "user-answers" ADD "field_value" character varying`);
    }

}
