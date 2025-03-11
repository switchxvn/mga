import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostTranslations1741665484856 implements MigrationInterface {
    name = 'AddPostTranslations1741665484856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create post_translations table
        await queryRunner.query(`CREATE TABLE "post_translations" (
            "id" SERIAL NOT NULL, 
            "title" character varying NOT NULL,
            "content" text,
            "locale" character varying(2) NOT NULL,
            "post_id" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_post_translations" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_post_translation_locale" UNIQUE ("post_id", "locale")
        )`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "post_translations" 
            ADD CONSTRAINT "FK_post_translations_post" 
            FOREIGN KEY ("post_id") 
            REFERENCES "posts"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION`);

        // Add sample data
        // First, create a sample post
        await queryRunner.query(`INSERT INTO "users" (email, username, password) 
            VALUES ('admin@example.com', 'admin', '$2b$10$YuX5GpmUISvqZXZX8.8Qj.RPrqpgJ9R3HXzH3pLuMTyQ0YmRGD4Hy') 
            RETURNING id`);
        
        const userResult = await queryRunner.query(`SELECT id FROM "users" WHERE email = 'admin@example.com'`);
        const userId = userResult[0].id;

        await queryRunner.query(`INSERT INTO "posts" (title, content, published, author_id) 
            VALUES ('Sample Post', 'Sample Content', true, $1) 
            RETURNING id`, [userId]);

        const postResult = await queryRunner.query(`SELECT id FROM "posts" ORDER BY id DESC LIMIT 1`);
        const postId = postResult[0].id;

        // Add translations for the sample post
        await queryRunner.query(`INSERT INTO "post_translations" (title, content, locale, post_id) VALUES
            ($1, $2, 'en', $3),
            ($4, $5, 'vi', $6)
        `, [
            'Sample Post in English', 'This is a sample post content in English', postId,
            'Bài viết mẫu tiếng Việt', 'Đây là nội dung bài viết mẫu bằng tiếng Việt', postId
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove sample data first
        await queryRunner.query(`DELETE FROM "posts" WHERE title = 'Sample Post'`);
        await queryRunner.query(`DELETE FROM "users" WHERE email = 'admin@example.com'`);
        
        // Remove foreign key and table
        await queryRunner.query(`ALTER TABLE "post_translations" DROP CONSTRAINT "FK_post_translations_post"`);
        await queryRunner.query(`DROP TABLE "post_translations"`);
    }
} 