import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAboutTables1743270380275 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop translations tables first due to foreign key constraints
        await queryRunner.query(`DROP TABLE IF EXISTS "about_milestone_translations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "about_team_member_translations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "about_section_translations"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "about_page_translations"`);

        // Drop main tables
        await queryRunner.query(`DROP TABLE IF EXISTS "about_milestones"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "about_team_members"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "about_sections"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "about_pages"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: This is a destructive migration, we won't implement down migration
        // as it would require recreating all tables with their original structure
        console.log('This is a destructive migration, down migration is not implemented');
    }
} 