import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersIdToUuid1742869258274 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop existing foreign key constraints
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`);

        // Create a temporary column with uuid type
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "temp_id" uuid DEFAULT uuid_generate_v4()`);

        // Update the temp_id with new uuid values
        await queryRunner.query(`UPDATE "users" SET "temp_id" = uuid_generate_v4()`);

        // Drop the old id column
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);

        // Rename temp_id to id and make it primary key
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "temp_id" TO "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);

        // Update user_profiles table
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD COLUMN "temp_user_id" uuid`);
        await queryRunner.query(`
            UPDATE "user_profiles" up
            SET "temp_user_id" = u.id
            FROM "users" u
            WHERE u.id::text = up.user_id::text
        `);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" RENAME COLUMN "temp_user_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Update posts table
        await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "temp_author_id" uuid`);
        await queryRunner.query(`
            UPDATE "posts" p
            SET "temp_author_id" = u.id
            FROM "users" u
            WHERE u.id::text = p.author_id::text
        `);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "author_id"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME COLUMN "temp_author_id" TO "author_id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First, drop existing foreign key constraints
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`);

        // Create a temporary column with integer type
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "temp_id" SERIAL`);

        // Update the temp_id with new integer values
        await queryRunner.query(`UPDATE "users" SET "temp_id" = ROW_NUMBER() OVER (ORDER BY "id")`);

        // Drop the old id column
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);

        // Rename temp_id to id and make it primary key
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "temp_id" TO "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);

        // Update user_profiles table
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD COLUMN "temp_user_id" integer`);
        await queryRunner.query(`
            UPDATE "user_profiles" up
            SET "temp_user_id" = u.id
            FROM "users" u
            WHERE u.id = up.user_id::text::integer
        `);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" RENAME COLUMN "temp_user_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Update posts table
        await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "temp_author_id" integer`);
        await queryRunner.query(`
            UPDATE "posts" p
            SET "temp_author_id" = u.id
            FROM "users" u
            WHERE u.id = p.author_id::text::integer
        `);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "author_id"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME COLUMN "temp_author_id" TO "author_id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
} 