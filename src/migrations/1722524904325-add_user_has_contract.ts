import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserHasContract1722524904325 implements MigrationInterface {
    name = 'AddUserHasContract1722524904325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "has_contract" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_contract"`);
    }

}
