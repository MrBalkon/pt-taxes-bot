import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAnswers1722210565656 implements MigrationInterface {
  name = 'FixAnswers1722210565656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user-answers" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD "user_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD CONSTRAINT "FK_291fed93c500c37ce3c90e6bc88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP CONSTRAINT "FK_291fed93c500c37ce3c90e6bc88"`,
    );
    await queryRunner.query(`ALTER TABLE "user-answers" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD "user_id" character varying NOT NULL`,
    );
  }
}
