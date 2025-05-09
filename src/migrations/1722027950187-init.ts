import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1722027950187 implements MigrationInterface {
  name = 'Init1722027950187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "telegram_id" character varying NOT NULL, "metadata" bytea NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
