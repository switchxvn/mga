import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserProfileAddressToJson1743270380247 implements MigrationInterface {
    name = 'UpdateUserProfileAddressToJson1743270380247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, create a temporary column to store the JSON data
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "address_json" jsonb`);

        // Convert existing string data to JSON format if any exists
        await queryRunner.query(`
            UPDATE "user_profiles"
            SET "address_json" = jsonb_build_object(
                'street', null,
                'city', null,
                'state', null,
                'country', null,
                'zipCode', null
            )
            WHERE "address" IS NULL;
        `);

        await queryRunner.query(`
            UPDATE "user_profiles"
            SET "address_json" = jsonb_build_object(
                'street', "address",
                'city', null,
                'state', null,
                'country', null,
                'zipCode', null
            )
            WHERE "address" IS NOT NULL;
        `);

        // Drop the old column
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "address"`);

        // Rename the new column to the original name
        await queryRunner.query(`ALTER TABLE "user_profiles" RENAME COLUMN "address_json" TO "address"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create a temporary column for the string data
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "address_str" character varying`);

        // Convert JSON data back to string (taking only the street field)
        await queryRunner.query(`
            UPDATE "user_profiles"
            SET "address_str" = "address"->>'street'
            WHERE "address" IS NOT NULL;
        `);

        // Drop the JSON column
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "address"`);

        // Rename the string column back to the original name
        await queryRunner.query(`ALTER TABLE "user_profiles" RENAME COLUMN "address_str" TO "address"`);
    }
} 