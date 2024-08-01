import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExecutionEntities1722545542441 implements MigrationInterface {
    name = 'AddExecutionEntities1722545542441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "execution_commands" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "execution_source" character varying NOT NULL, "execution_method" character varying NOT NULL, CONSTRAINT "PK_34b5620db11df0bf9bcdd01afad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "execution_steps" ("execution_step_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "execution_command_id" integer NOT NULL, "execution_arguments" jsonb NOT NULL, CONSTRAINT "PK_70c0e09bf9927bd5df337dd872d" PRIMARY KEY ("execution_step_id"))`);
        await queryRunner.query(`CREATE TABLE "execution_scenarios_steps" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "execution_step_id" integer NOT NULL, "execution_scenario_id" integer NOT NULL, CONSTRAINT "PK_c2513a6dd3e4bffbb27d31562e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "execution_scenarios" ("execution_scenarion_id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_c1d6a412775c49cf13ebdc257a9" PRIMARY KEY ("execution_scenarion_id"))`);
        await queryRunner.query(`CREATE TABLE "execution_scenarios_tasks" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "task_id" integer NOT NULL, "execution_scenario_id" integer NOT NULL, CONSTRAINT "PK_36514bcd033c2db912263f51145" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "is_dynamic" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "execution_steps" ADD CONSTRAINT "FK_82f647df02d5cb24df0ba965165" FOREIGN KEY ("execution_command_id") REFERENCES "execution_commands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_steps" ADD CONSTRAINT "FK_5b14007b488cdb56d7db93b8d48" FOREIGN KEY ("execution_step_id") REFERENCES "execution_steps"("execution_step_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_steps" ADD CONSTRAINT "FK_96d4161aff73b69bd72acca5f39" FOREIGN KEY ("execution_scenario_id") REFERENCES "execution_scenarios"("execution_scenarion_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" ADD CONSTRAINT "FK_c89e3e4fb6c87af5e00313fe40c" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" ADD CONSTRAINT "FK_4c09e547e5a93eaf5f79a2bfa87" FOREIGN KEY ("execution_scenario_id") REFERENCES "execution_scenarios"("execution_scenarion_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" DROP CONSTRAINT "FK_4c09e547e5a93eaf5f79a2bfa87"`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_tasks" DROP CONSTRAINT "FK_c89e3e4fb6c87af5e00313fe40c"`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_steps" DROP CONSTRAINT "FK_96d4161aff73b69bd72acca5f39"`);
        await queryRunner.query(`ALTER TABLE "execution_scenarios_steps" DROP CONSTRAINT "FK_5b14007b488cdb56d7db93b8d48"`);
        await queryRunner.query(`ALTER TABLE "execution_steps" DROP CONSTRAINT "FK_82f647df02d5cb24df0ba965165"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "is_dynamic"`);
        await queryRunner.query(`DROP TABLE "execution_scenarios_tasks"`);
        await queryRunner.query(`DROP TABLE "execution_scenarios"`);
        await queryRunner.query(`DROP TABLE "execution_scenarios_steps"`);
        await queryRunner.query(`DROP TABLE "execution_steps"`);
        await queryRunner.query(`DROP TABLE "execution_commands"`);
    }

}
