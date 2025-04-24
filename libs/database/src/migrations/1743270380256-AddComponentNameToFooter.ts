import { MigrationInterface, QueryRunner } from "typeorm";

export class AddComponentNameToFooter1743270380256 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "footers" 
            ADD COLUMN "component_name" varchar NOT NULL DEFAULT 'Footer'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "footers" 
            DROP COLUMN "component_name"
        `);
    }
} 