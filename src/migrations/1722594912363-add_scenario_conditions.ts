import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScenarioConditions1722594912363 implements MigrationInterface {
    name = 'AddScenarioConditions1722594912363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" ADD "parent_id" integer`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" ADD "condition" jsonb`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" ALTER COLUMN "order" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" ADD CONSTRAINT "FK_4966e81ed515448f3419ca2d6b6" FOREIGN KEY ("parent_id") REFERENCES "execution_scenarios_tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" DROP CONSTRAINT "FK_4966e81ed515448f3419ca2d6b6"`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" ALTER COLUMN "order" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" DROP COLUMN "condition"`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" DROP COLUMN "parent_id"`);
    }

}
