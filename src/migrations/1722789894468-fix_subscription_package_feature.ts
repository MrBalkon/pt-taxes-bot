import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSubscriptionPackageFeature1722789894468 implements MigrationInterface {
    name = 'FixSubscriptionPackageFeature1722789894468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_package_features" DROP CONSTRAINT "FK_49e7737d61e3b242afcdf6c6d89"`);;
        await queryRunner.query(`ALTER TABLE "subscription_package_features" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "subscription_package_features" ADD CONSTRAINT "FK_ff9b857fdff4500b118df6b2871" FOREIGN KEY ("subscription_package_id") REFERENCES "subscription_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_package_features" DROP CONSTRAINT "FK_ff9b857fdff4500b118df6b2871"`);
        await queryRunner.query(`ALTER TABLE "subscription_package_features" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "subscription_package_features" ADD CONSTRAINT "FK_49e7737d61e3b242afcdf6c6d89" FOREIGN KEY ("user_id") REFERENCES "subscription_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
