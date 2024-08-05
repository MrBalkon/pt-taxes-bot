import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExecutionType1722871571699 implements MigrationInterface {
    name = 'AddExecutionType1722871571699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_execution_type_enum" AS ENUM('none', 'invoke_manager')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "execution_type" "public"."tasks_execution_type_enum" NOT NULL DEFAULT 'none'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "execution_type"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_execution_type_enum"`);
    }

}
