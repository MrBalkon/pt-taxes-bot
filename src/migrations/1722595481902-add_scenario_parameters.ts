import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScenarioParameters1722595481902 implements MigrationInterface {
  name = 'AddScenarioParameters1722595481902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "execution_scenarios" ADD "error_produce" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "execution_scenarios" ADD "parameters" jsonb NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "execution_scenarios" DROP COLUMN "parameters"`,
    );
    await queryRunner.query(
      `ALTER TABLE "execution_scenarios" DROP COLUMN "error_produce"`,
    );
  }
}
