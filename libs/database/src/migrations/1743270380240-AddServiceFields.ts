import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceFields1743270380240 implements MigrationInterface {
    name = 'AddServiceFields1743270380240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to services table
        await queryRunner.query(`ALTER TABLE "services" ADD "is_featured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "services" ADD "is_new" boolean NOT NULL DEFAULT false`);

        // Create service_categories table if not exists
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service_categories" (
                "service_id" integer NOT NULL,
                "category_id" integer NOT NULL,
                CONSTRAINT "PK_service_categories" PRIMARY KEY ("service_id", "category_id")
            )
        `);

        // Add foreign key constraints if they don't exist
        const foreignKeys = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'service_categories' 
            AND constraint_type = 'FOREIGN KEY'
        `);

        if (!foreignKeys.find(fk => fk.constraint_name === 'FK_service_categories_service')) {
            await queryRunner.query(`
                ALTER TABLE "service_categories"
                ADD CONSTRAINT "FK_service_categories_service"
                FOREIGN KEY ("service_id")
                REFERENCES "services"("id")
                ON DELETE CASCADE
                ON UPDATE NO ACTION
            `);
        }

        if (!foreignKeys.find(fk => fk.constraint_name === 'FK_service_categories_category')) {
            await queryRunner.query(`
                ALTER TABLE "service_categories"
                ADD CONSTRAINT "FK_service_categories_category"
                FOREIGN KEY ("category_id")
                REFERENCES "categories"("id")
                ON DELETE CASCADE
                ON UPDATE NO ACTION
            `);
        }

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_service_categories_service_id"
            ON "service_categories" ("service_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_service_categories_category_id"
            ON "service_categories" ("category_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_categories_category_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_categories_service_id"`);

        // Drop foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "service_categories" 
            DROP CONSTRAINT IF EXISTS "FK_service_categories_category"
        `);
        await queryRunner.query(`
            ALTER TABLE "service_categories" 
            DROP CONSTRAINT IF EXISTS "FK_service_categories_service"
        `);

        // Drop service_categories table
        await queryRunner.query(`DROP TABLE IF EXISTS "service_categories"`);

        // Drop columns from services table
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "is_new"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "is_featured"`);
    }
} 