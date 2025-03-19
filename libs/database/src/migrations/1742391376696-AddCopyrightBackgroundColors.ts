import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCopyrightBackgroundColors1742391376696 implements MigrationInterface {
    name = 'AddCopyrightBackgroundColors1742391376696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new copyright_style column
        await queryRunner.query(`ALTER TABLE "footers" ADD "copyright_style" jsonb NOT NULL DEFAULT '{"text":"","light":{"backgroundColor":"#FFFFFF","textColor":"#374151"},"dark":{"backgroundColor":"#1F2937","textColor":"#F3F4F6"}}'`);
        
        // Migrate existing copyright text to new structure
        await queryRunner.query(`
            UPDATE "footers" 
            SET "copyright_style" = jsonb_set(
                jsonb_set(
                    jsonb_set(
                        '{"text":"","light":{"backgroundColor":"#FFFFFF","textColor":"#374151"},"dark":{"backgroundColor":"#1F2937","textColor":"#F3F4F6"}}'::jsonb,
                        '{text}',
                        to_jsonb(COALESCE(copyright, ''))
                    ),
                    '{light,backgroundColor}',
                    to_jsonb(COALESCE(copyright_background_light_color, '#FFFFFF'))
                ),
                '{dark,backgroundColor}',
                to_jsonb(COALESCE(copyright_background_dark_color, '#1F2937'))
            )
        `);

        // Set is_active to true
        await queryRunner.query(`UPDATE "footers" SET "is_active" = true`);

        // Drop old columns
        await queryRunner.query(`ALTER TABLE "footers" DROP COLUMN IF EXISTS "copyright_background_light_color"`);
        await queryRunner.query(`ALTER TABLE "footers" DROP COLUMN IF EXISTS "copyright_background_dark_color"`);
        await queryRunner.query(`ALTER TABLE "footers" DROP COLUMN IF EXISTS "copyright"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back old columns
        await queryRunner.query(`ALTER TABLE "footers" ADD "copyright" character varying`);
        await queryRunner.query(`ALTER TABLE "footers" ADD "copyright_background_light_color" character varying DEFAULT '#FFFFFF'`);
        await queryRunner.query(`ALTER TABLE "footers" ADD "copyright_background_dark_color" character varying DEFAULT '#1F2937'`);

        // Migrate data back
        await queryRunner.query(`
            UPDATE "footers" 
            SET 
                "copyright" = ("copyright_style"->>'text')::text,
                "copyright_background_light_color" = ("copyright_style"->'light'->>'backgroundColor')::text,
                "copyright_background_dark_color" = ("copyright_style"->'dark'->>'backgroundColor')::text
        `);

        // Drop new column
        await queryRunner.query(`ALTER TABLE "footers" DROP COLUMN "copyright_style"`);
    }
} 