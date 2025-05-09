import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserFieldsUniqueContraint1722644842107
  implements MigrationInterface
{
  name = 'AddUserFieldsUniqueContraint1722644842107';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD CONSTRAINT "UQ_df6982d2dbbda27d2cce0e2cdf5" UNIQUE ("field_id", "user_id", "year", "month")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP CONSTRAINT "UQ_df6982d2dbbda27d2cce0e2cdf5"`,
    );
  }
}
