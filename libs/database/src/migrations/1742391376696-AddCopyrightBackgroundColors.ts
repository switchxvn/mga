import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCopyrightBackgroundColors1742391376696 implements MigrationInterface {
    name = 'AddCopyrightBackgroundColors1742391376696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add temporary columns for the migration if they don't exist
        await queryRunner.query(`DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footers' AND column_name = 'copyright_background_light_color') THEN 
                    ALTER TABLE "footers" ADD "copyright_background_light_color" character varying DEFAULT '#FFFFFF';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footers' AND column_name = 'copyright_background_dark_color') THEN 
                    ALTER TABLE "footers" ADD "copyright_background_dark_color" character varying DEFAULT '#1F2937';
                END IF;
            END $$;
        `);

        // Add new copyright_style column if it doesn't exist
        await queryRunner.query(`DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footers' AND column_name = 'copyright_style') THEN 
                    ALTER TABLE "footers" ADD "copyright_style" jsonb NOT NULL DEFAULT '{"text":"","light":{"backgroundColor":"#FFFFFF","textColor":"#374151"},"dark":{"backgroundColor":"#1F2937","textColor":"#F3F4F6"}}';
                END IF;
            END $$;
        `);
        
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
        // Add back old columns if they don't exist
        await queryRunner.query(`DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footers' AND column_name = 'copyright') THEN 
                    ALTER TABLE "footers" ADD "copyright" character varying;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footers' AND column_name = 'copyright_background_light_color') THEN 
                    ALTER TABLE "footers" ADD "copyright_background_light_color" character varying DEFAULT '#FFFFFF';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footers' AND column_name = 'copyright_background_dark_color') THEN 
                    ALTER TABLE "footers" ADD "copyright_background_dark_color" character varying DEFAULT '#1F2937';
                END IF;
            END $$;
        `);

        // Migrate data back
        await queryRunner.query(`
            UPDATE "footers" 
            SET 
                "copyright" = ("copyright_style"->>'text')::text,
                "copyright_background_light_color" = ("copyright_style"->'light'->>'backgroundColor')::text,
                "copyright_background_dark_color" = ("copyright_style"->'dark'->>'backgroundColor')::text
        `);

        // Drop new column
        await queryRunner.query(`ALTER TABLE "footers" DROP COLUMN IF EXISTS "copyright_style"`);
    }
} 