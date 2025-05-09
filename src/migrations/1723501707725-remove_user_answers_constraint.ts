import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserAnswersConstraint1723501707725
  implements MigrationInterface
{
  name = 'RemoveUserAnswersConstraint1723501707725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" DROP CONSTRAINT "UQ_df6982d2dbbda27d2cce0e2cdf5"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user-answers" ADD CONSTRAINT "UQ_df6982d2dbbda27d2cce0e2cdf5" UNIQUE ("field_id", "year", "month", "user_id")`,
    );
  }
}
