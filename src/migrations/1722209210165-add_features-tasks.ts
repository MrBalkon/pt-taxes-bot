import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturesTasks1722209210165 implements MigrationInterface {
    name = 'AddFeaturesTasks1722209210165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac692"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d42"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4"`);
        await queryRunner.query(`CREATE TABLE "features-tasks" ("id" SERIAL NOT NULL, "feature_id" integer NOT NULL, "task_id" integer NOT NULL, CONSTRAINT "PK_1160f4753f9064cc340552d200b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "features-tasks" ADD CONSTRAINT "FK_cbde35bd5d407d780790605ad03" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "features-tasks" ADD CONSTRAINT "FK_0b9be2be3d9556f9de49c717a21" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4" FOREIGN KEY ("field_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69" FOREIGN KEY ("task_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d46" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac696" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac696"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d46"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4"`);
        await queryRunner.query(`ALTER TABLE "features-tasks" DROP CONSTRAINT "FK_0b9be2be3d9556f9de49c717a21"`);
        await queryRunner.query(`ALTER TABLE "features-tasks" DROP CONSTRAINT "FK_cbde35bd5d407d780790605ad03"`);
        await queryRunner.query(`DROP TABLE "features-tasks"`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4" FOREIGN KEY ("field_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69" FOREIGN KEY ("task_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d42" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac692" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
