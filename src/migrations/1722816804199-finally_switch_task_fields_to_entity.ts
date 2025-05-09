import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinallySwitchTaskFieldsToEntity1722816804199
  implements MigrationInterface
{
  name = 'FinallySwitchTaskFieldsToEntity1722816804199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac696"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d46"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_021e6ee18b7d5638cd8a9b785d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d106c9ae00f835435ab7e42ac6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "PK_a834db09d3a2302df47af197914"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "PK_e595f74db7ea634975360a5de07" PRIMARY KEY ("field_id", "task_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD "is_required" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "PK_e595f74db7ea634975360a5de07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "PK_826289570dc2a5d9a5b682f008d" PRIMARY KEY ("field_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "PK_826289570dc2a5d9a5b682f008d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "PK_e4e938ddcf8dc225fbe2c2fe731" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "FK_d106c9ae00f835435ab7e42ac69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "PK_e4e938ddcf8dc225fbe2c2fe731"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "PK_826289570dc2a5d9a5b682f008d" PRIMARY KEY ("field_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "PK_826289570dc2a5d9a5b682f008d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "PK_e595f74db7ea634975360a5de07" PRIMARY KEY ("field_id", "task_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP COLUMN "is_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" DROP CONSTRAINT "PK_e595f74db7ea634975360a5de07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "PK_a834db09d3a2302df47af197914" PRIMARY KEY ("field_id", "task_id")`,
    );
    await queryRunner.query(`ALTER TABLE "tasks_fields" DROP COLUMN "id"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_d106c9ae00f835435ab7e42ac6" ON "tasks_fields" ("task_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_021e6ee18b7d5638cd8a9b785d" ON "tasks_fields" ("field_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_021e6ee18b7d5638cd8a9b785d46" FOREIGN KEY ("field_id") REFERENCES "user-fields"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_fields" ADD CONSTRAINT "FK_d106c9ae00f835435ab7e42ac696" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
