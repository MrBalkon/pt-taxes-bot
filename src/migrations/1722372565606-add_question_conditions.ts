import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionConditions1722372565606 implements MigrationInterface {
    name = 'AddQuestionConditions1722372565606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questions-conditions" ("id" SERIAL NOT NULL, "source_question_id" integer NOT NULL, "condition" character varying NOT NULL, "compare_question_id" integer, "compare_value" character varying, CONSTRAINT "PK_bf0c1f03297a810cff35ca47e26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "questions-conditions" ADD CONSTRAINT "FK_b5c7517f3de2e96f0a7552d3412" FOREIGN KEY ("source_question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions-conditions" DROP CONSTRAINT "FK_b5c7517f3de2e96f0a7552d3412"`);
        await queryRunner.query(`DROP TABLE "questions-conditions"`);
    }

}
