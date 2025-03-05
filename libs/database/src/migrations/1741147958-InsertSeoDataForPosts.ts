import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertSeoDataForPosts1741147958000 implements MigrationInterface {
    name = 'InsertSeoDataForPosts1741147958000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Lấy tất cả các bài viết hiện có
        const posts = await queryRunner.query(`SELECT id, title FROM posts`);
        
        // Cập nhật dữ liệu SEO cho từng bài viết
        for (const post of posts) {
            const title = post.title;
            const id = post.id;
            
            // Tạo slug từ title
            const slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            
            // Cập nhật các trường SEO
            await queryRunner.query(`
                UPDATE posts 
                SET 
                    slug = $1,
                    meta_title = $2,
                    meta_description = $3,
                    meta_keywords = $4,
                    og_title = $5,
                    og_description = $6
                WHERE id = $7
            `, [slug, title, `${title} - Mô tả chi tiết về bài viết này.`, `${title}, blog, article`, title, `${title} - Mô tả chi tiết về bài viết này cho mạng xã hội.`, id]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Đặt lại các trường SEO về null
        await queryRunner.query(`
            UPDATE posts 
            SET 
                slug = NULL,
                meta_title = NULL,
                meta_description = NULL,
                meta_keywords = NULL,
                og_title = NULL,
                og_description = NULL,
                og_image = NULL,
                canonical_url = NULL
        `);
    }
} 