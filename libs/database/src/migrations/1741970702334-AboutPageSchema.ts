import { MigrationInterface, QueryRunner } from "typeorm";

export class AboutPageSchema1741970702334 implements MigrationInterface {
    name = 'AboutPageSchema1741970702334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng about_page để lưu thông tin chung về trang giới thiệu
        await queryRunner.query(`CREATE TABLE "about_page" (
            "id" SERIAL NOT NULL, 
            "title" character varying NOT NULL, 
            "subtitle" character varying, 
            "meta_title" character varying, 
            "meta_description" character varying, 
            "is_active" boolean NOT NULL DEFAULT true, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_about_page" PRIMARY KEY ("id")
        )`);

        // Tạo bảng about_sections để lưu các phần nội dung của trang giới thiệu
        await queryRunner.query(`CREATE TABLE "about_sections" (
            "id" SERIAL NOT NULL, 
            "about_page_id" integer NOT NULL,
            "title" character varying NOT NULL, 
            "content" text, 
            "image_url" character varying, 
            "video_url" character varying,
            "order" integer NOT NULL DEFAULT 0,
            "section_type" character varying NOT NULL DEFAULT 'text',
            "is_active" boolean NOT NULL DEFAULT true, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_about_sections" PRIMARY KEY ("id")
        )`);

        // Tạo bảng about_team_members để lưu thông tin về đội ngũ
        await queryRunner.query(`CREATE TABLE "about_team_members" (
            "id" SERIAL NOT NULL, 
            "about_page_id" integer NOT NULL,
            "name" character varying NOT NULL, 
            "position" character varying NOT NULL, 
            "bio" text, 
            "image_url" character varying,
            "email" character varying,
            "social_links" jsonb,
            "order" integer NOT NULL DEFAULT 0,
            "is_active" boolean NOT NULL DEFAULT true, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_about_team_members" PRIMARY KEY ("id")
        )`);

        // Tạo bảng about_milestones để lưu các cột mốc phát triển
        await queryRunner.query(`CREATE TABLE "about_milestones" (
            "id" SERIAL NOT NULL, 
            "about_page_id" integer NOT NULL,
            "year" character varying NOT NULL, 
            "title" character varying NOT NULL, 
            "description" text, 
            "image_url" character varying,
            "order" integer NOT NULL DEFAULT 0,
            "is_active" boolean NOT NULL DEFAULT true, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_about_milestones" PRIMARY KEY ("id")
        )`);

        // Tạo các ràng buộc khóa ngoại
        await queryRunner.query(`ALTER TABLE "about_sections" ADD CONSTRAINT "FK_about_sections_about_page" FOREIGN KEY ("about_page_id") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "about_team_members" ADD CONSTRAINT "FK_about_team_members_about_page" FOREIGN KEY ("about_page_id") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "about_milestones" ADD CONSTRAINT "FK_about_milestones_about_page" FOREIGN KEY ("about_page_id") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa các ràng buộc khóa ngoại
        await queryRunner.query(`ALTER TABLE "about_milestones" DROP CONSTRAINT "FK_about_milestones_about_page"`);
        await queryRunner.query(`ALTER TABLE "about_team_members" DROP CONSTRAINT "FK_about_team_members_about_page"`);
        await queryRunner.query(`ALTER TABLE "about_sections" DROP CONSTRAINT "FK_about_sections_about_page"`);
        
        // Xóa các bảng
        await queryRunner.query(`DROP TABLE "about_milestones"`);
        await queryRunner.query(`DROP TABLE "about_team_members"`);
        await queryRunner.query(`DROP TABLE "about_sections"`);
        await queryRunner.query(`DROP TABLE "about_page"`);
    }
} 