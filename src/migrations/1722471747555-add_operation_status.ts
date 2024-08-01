import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOperationStatus1722471747555 implements MigrationInterface {
    name = 'AddOperationStatus1722471747555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operations" ADD "finished_at" TIMESTAMP`);
        await queryRunner.query(`CREATE TYPE "public"."operations_status_enum" AS ENUM('queued', 'in_progress', 'success', 'fail')`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "status" "public"."operations_status_enum" NOT NULL DEFAULT 'queued'`);
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "PK_7b62d84d6f9912b975987165856"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "PK_7b62d84d6f9912b975987165856"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."operations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "finished_at"`);
    }

}
