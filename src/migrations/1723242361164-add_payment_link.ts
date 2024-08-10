import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentLink1723242361164 implements MigrationInterface {
    name = 'AddPaymentLink1723242361164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD "link" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "link"`);
    }

}
