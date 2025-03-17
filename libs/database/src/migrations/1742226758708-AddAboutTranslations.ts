import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAboutTranslations1742226758708 implements MigrationInterface {
    name = 'AddAboutTranslations1742226758708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create about_page_translations table
        await queryRunner.query(`
            CREATE TABLE "about_page_translations" (
                "id" SERIAL NOT NULL,
                "about_page_id" integer NOT NULL,
                "language_code" character varying NOT NULL,
                "title" character varying NOT NULL,
                "subtitle" character varying,
                "meta_title" character varying,
                "meta_description" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_about_page_translations" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_about_page_lang" UNIQUE ("about_page_id", "language_code")
            )
        `);

        // Create about_section_translations table
        await queryRunner.query(`
            CREATE TABLE "about_section_translations" (
                "id" SERIAL NOT NULL,
                "about_section_id" integer NOT NULL,
                "language_code" character varying NOT NULL,
                "title" character varying NOT NULL,
                "content" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_about_section_translations" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_about_section_lang" UNIQUE ("about_section_id", "language_code")
            )
        `);

        // Create about_team_member_translations table
        await queryRunner.query(`
            CREATE TABLE "about_team_member_translations" (
                "id" SERIAL NOT NULL,
                "about_team_member_id" integer NOT NULL,
                "language_code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "position" character varying NOT NULL,
                "bio" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_about_team_member_translations" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_about_team_member_lang" UNIQUE ("about_team_member_id", "language_code")
            )
        `);

        // Create about_milestone_translations table
        await queryRunner.query(`
            CREATE TABLE "about_milestone_translations" (
                "id" SERIAL NOT NULL,
                "about_milestone_id" integer NOT NULL,
                "language_code" character varying NOT NULL,
                "title" character varying NOT NULL,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_about_milestone_translations" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_about_milestone_lang" UNIQUE ("about_milestone_id", "language_code")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "about_page_translations" 
            ADD CONSTRAINT "FK_about_page_translations" 
            FOREIGN KEY ("about_page_id") 
            REFERENCES "about_page"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "about_section_translations" 
            ADD CONSTRAINT "FK_about_section_translations" 
            FOREIGN KEY ("about_section_id") 
            REFERENCES "about_sections"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "about_team_member_translations" 
            ADD CONSTRAINT "FK_about_team_member_translations" 
            FOREIGN KEY ("about_team_member_id") 
            REFERENCES "about_team_members"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "about_milestone_translations" 
            ADD CONSTRAINT "FK_about_milestone_translations" 
            FOREIGN KEY ("about_milestone_id") 
            REFERENCES "about_milestones"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "about_milestone_translations" DROP CONSTRAINT "FK_about_milestone_translations"`);
        await queryRunner.query(`ALTER TABLE "about_team_member_translations" DROP CONSTRAINT "FK_about_team_member_translations"`);
        await queryRunner.query(`ALTER TABLE "about_section_translations" DROP CONSTRAINT "FK_about_section_translations"`);
        await queryRunner.query(`ALTER TABLE "about_page_translations" DROP CONSTRAINT "FK_about_page_translations"`);

        // Drop translation tables
        await queryRunner.query(`DROP TABLE "about_milestone_translations"`);
        await queryRunner.query(`DROP TABLE "about_team_member_translations"`);
        await queryRunner.query(`DROP TABLE "about_section_translations"`);
        await queryRunner.query(`DROP TABLE "about_page_translations"`);
    }
} 