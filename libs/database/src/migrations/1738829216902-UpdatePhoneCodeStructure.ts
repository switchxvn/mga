import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePhoneCodeStructure1738829216902 implements MigrationInterface {
    name = 'UpdatePhoneCodeStructure1738829216902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_2c4bd281debce28697e0479ef85"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" RENAME COLUMN "country_phone_code_id" TO "phone_code"`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" DROP CONSTRAINT "PK_fa214a8c2221b3aa2d71c4e6dbb"`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" DROP COLUMN "phone_code"`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" ADD "phone_code" character varying(4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" ADD CONSTRAINT "PK_611a301216a32664a92a746cdb5" PRIMARY KEY ("phone_code")`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "phone_code"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "phone_code" character varying(4)`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_db8147c7bfe51cd4ba029cb4a0c" FOREIGN KEY ("phone_code") REFERENCES "country_phone_codes"("phone_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_db8147c7bfe51cd4ba029cb4a0c"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "phone_code"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "phone_code" integer`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" DROP CONSTRAINT "PK_611a301216a32664a92a746cdb5"`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" DROP COLUMN "phone_code"`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" ADD "phone_code" character varying(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "country_phone_codes" ADD CONSTRAINT "PK_fa214a8c2221b3aa2d71c4e6dbb" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_profiles" RENAME COLUMN "phone_code" TO "country_phone_code_id"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_2c4bd281debce28697e0479ef85" FOREIGN KEY ("country_phone_code_id") REFERENCES "country_phone_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
