import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskTypes1722864533512 implements MigrationInterface {
    name = 'AddTaskTypes1722864533512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_task_type_enum" AS ENUM('action', 'data_extraction')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "task_type" "public"."tasks_task_type_enum" NOT NULL DEFAULT 'data_extraction'`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_lifespan_type_enum" AS ENUM('periodic', 'on_demand')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "lifespan_type" "public"."tasks_lifespan_type_enum" NOT NULL DEFAULT 'on_demand'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "lifespan_type"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_lifespan_type_enum"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "task_type"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_task_type_enum"`);
    }

}
