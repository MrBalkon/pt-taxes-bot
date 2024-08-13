import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureAcceses21722190088120 implements MigrationInterface {
  name = 'AddFeatureAcceses21722190088120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "metadata" TO "created_at"`,
    );
    await queryRunner.query(
      `CREATE TABLE "features-access" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "feature_id" integer NOT NULL, CONSTRAINT "PK_a62ece7bff0889cc23a2e7c46df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "features" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_5c1e336df2f4a7051e5bf08a941" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "system_name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user-fields" ("id" SERIAL NOT NULL, "field_name" character varying NOT NULL, "system_name" character varying NOT NULL, "field_life_span_type" character varying NOT NULL, "fields_value_type" character varying NOT NULL, "options" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_70a96c189a4256e0de240d3711c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user-answers" ("id" SERIAL NOT NULL, "field_id" integer NOT NULL, "user_id" character varying NOT NULL, "field_value" character varying NOT NULL, "year" integer, "month" integer, "error" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5f39530461156df435ee6be4638" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" SERIAL NOT NULL, "question" character varying NOT NULL, "field_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_2a5694b2ad9651a81ef685b5ca" UNIQUE ("field_id"), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks_fields" ("field_id" integer NOT NULL, "task_id" integer NOT NULL, CONSTRAINT "PK_a834db09d3a2302df47af197914" PRIMARY KEY ("field_id", "task_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_021e6ee18b7d5638cd8a9b785d" ON "tasks_fields" ("field_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d106c9ae00f835435ab7e42ac6" ON "tasks_fields" ("task_id") `,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "features-access" ADD CONSTRAINT "FK_9b90ea3efcf2f60b4759c040877" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "features-access" ADD CONSTRAINT "FK_71c8e7fb63fa039b6907a902b6c" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD CONSTRAINT "FK_96f9fce1cb549980161df0f200c" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_2a5694b2ad9651a81ef685b5ca0" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4" FOREIGN KEY ("field_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69" FOREIGN KEY ("task_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d42" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac692" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac692"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_2a5694b2ad9651a81ef685b5ca0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP CONSTRAINT "FK_96f9fce1cb549980161df0f200c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "features-access" DROP CONSTRAINT "FK_71c8e7fb63fa039b6907a902b6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "features-access" DROP CONSTRAINT "FK_9b90ea3efcf2f60b4759c040877"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "created_at" bytea`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d106c9ae00f835435ab7e42ac6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_021e6ee18b7d5638cd8a9b785d"`,
    );
    await queryRunner.query(`DROP TABLE "tasks_fields"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TABLE "user-answers"`);
    await queryRunner.query(`DROP TABLE "user-fields"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "features"`);
    await queryRunner.query(`DROP TABLE "features-access"`);
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "created_at" TO "metadata"`,
    );
  }
}
