import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRank1722212478235 implements MigrationInterface {
    name = 'AddRank1722212478235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ADD "rank" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "rank"`);
    }

}
