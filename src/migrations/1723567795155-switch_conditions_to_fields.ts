import { MigrationInterface, QueryRunner } from "typeorm";

export class SwitchConditionsToFields1723567795155 implements MigrationInterface {
    name = 'SwitchConditionsToFields1723567795155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions-conditions" DROP CONSTRAINT "FK_b5c7517f3de2e96f0a7552d3412"`);
        await queryRunner.query(`DROP TABLE "questions-conditions"`);
        await queryRunner.query(`CREATE TABLE "fields-conditions" ("id" SERIAL NOT NULL, "source_field_id" integer NOT NULL, "condition" character varying NOT NULL, "compare_field_id" integer, "compare_value" character varying, CONSTRAINT "PK_e50b517e13f7d7ecb85afbecef3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fields-conditions" ADD CONSTRAINT "FK_ea0693b75945bbd76e6fb0bea44" FOREIGN KEY ("source_field_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fields-conditions" ADD CONSTRAINT "FK_18e872271cb0271fd3bf685633e" FOREIGN KEY ("compare_field_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fields-conditions" DROP CONSTRAINT "FK_18e872271cb0271fd3bf685633e"`);
        await queryRunner.query(`ALTER TABLE "fields-conditions" DROP CONSTRAINT "FK_ea0693b75945bbd76e6fb0bea44"`);
        await queryRunner.query(`DROP TABLE "fields-conditions"`);
        await queryRunner.query(`CREATE TABLE "questions-conditions" ("id" SERIAL NOT NULL, "source_question_id" integer NOT NULL, "condition" character varying NOT NULL, "compare_question_id" integer, "compare_value" character varying, CONSTRAINT "PK_bf0c1f03297a810cff35ca47e26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "questions-conditions" ADD CONSTRAINT "FK_b5c7517f3de2e96f0a7552d3412" FOREIGN KEY ("source_question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
