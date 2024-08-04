import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewEntities1722804851424 implements MigrationInterface {
    name = 'AddNewEntities1722804851424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription_requests" ("id" SERIAL NOT NULL, CONSTRAINT "PK_7f97babb1f4d7eeef9d5c2937be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD "service_provided" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TYPE "public"."subscription_packages_period_type_enum" RENAME TO "subscription_packages_period_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_packages_period_type_enum" AS ENUM('month', 'quarter', 'year', 'once', 'forever')`);
        await queryRunner.query(`ALTER TABLE "subscription_packages" ALTER COLUMN "period_type" TYPE "public"."subscription_packages_period_type_enum" USING "period_type"::"text"::"public"."subscription_packages_period_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_packages_period_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscription_packages_period_type_enum_old" AS ENUM('month', 'quarter', 'year', 'forever')`);
        await queryRunner.query(`ALTER TABLE "subscription_packages" ALTER COLUMN "period_type" TYPE "public"."subscription_packages_period_type_enum_old" USING "period_type"::"text"::"public"."subscription_packages_period_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_packages_period_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."subscription_packages_period_type_enum_old" RENAME TO "subscription_packages_period_type_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP COLUMN "service_provided"`);
        await queryRunner.query(`DROP TABLE "subscription_requests"`);
    }

}
