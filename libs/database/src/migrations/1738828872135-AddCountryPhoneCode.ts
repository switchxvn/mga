import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryPhoneCode1738828872135 implements MigrationInterface {
    name = 'AddCountryPhoneCode1738828872135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "country_phone_codes" ("id" SERIAL NOT NULL, "country_code" character varying(2) NOT NULL, "phone_code" character varying(5) NOT NULL, "country_name" character varying NOT NULL, "flag_emoji" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fa214a8c2221b3aa2d71c4e6dbb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "phone_number" character varying`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "country_phone_code_id" integer`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_2c4bd281debce28697e0479ef85" FOREIGN KEY ("country_phone_code_id") REFERENCES "country_phone_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_2c4bd281debce28697e0479ef85"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "country_phone_code_id"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "phone" character varying`);
        await queryRunner.query(`DROP TABLE "country_phone_codes"`);
    }

}
