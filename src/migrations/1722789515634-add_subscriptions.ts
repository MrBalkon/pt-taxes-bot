import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptions1722789515634 implements MigrationInterface {
  name = 'AddSubscriptions1722789515634';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription_package_features" ("id" SERIAL NOT NULL, "subscription_package_id" integer NOT NULL, "feature_id" integer NOT NULL, "user_id" integer, CONSTRAINT "PK_1794073580ce37f8ddce466c865" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_packages_period_type_enum" AS ENUM('month', 'quarter', 'year', 'forever')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_packages" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "payment_system_id" character varying, "period_type" "public"."subscription_packages_period_type_enum" NOT NULL, "price" integer, CONSTRAINT "PK_1f6f3a0eb04062c80a9acf24a8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_subscriptions" ("id" SERIAL NOT NULL, "subscription_package_id" integer NOT NULL, "user_id" integer NOT NULL, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP, CONSTRAINT "PK_9e928b0954e51705ab44988812c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_package_features" ADD CONSTRAINT "FK_49e7737d61e3b242afcdf6c6d89" FOREIGN KEY ("user_id") REFERENCES "subscription_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_package_features" ADD CONSTRAINT "FK_910b832906e5d874d7d63b348a0" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_96f112f2ddf05013433156d56e7" FOREIGN KEY ("subscription_package_id") REFERENCES "subscription_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_0641da02314913e28f6131310eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_0641da02314913e28f6131310eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_96f112f2ddf05013433156d56e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_package_features" DROP CONSTRAINT "FK_910b832906e5d874d7d63b348a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_package_features" DROP CONSTRAINT "FK_49e7737d61e3b242afcdf6c6d89"`,
    );
    await queryRunner.query(`DROP TABLE "user_subscriptions"`);
    await queryRunner.query(`DROP TABLE "subscription_packages"`);
    await queryRunner.query(
      `DROP TYPE "public"."subscription_packages_period_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "subscription_package_features"`);
  }
}
