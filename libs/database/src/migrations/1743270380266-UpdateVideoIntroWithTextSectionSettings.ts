import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVideoIntroWithTextSectionSettings1743270380266 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cập nhật cấu trúc dữ liệu cho section có type là 'video-intro-with-text'
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{videos}',
                '[
                    {
                        "id": 1,
                        "title": "Cáp treo Núi Sam",
                        "description": "Trải nghiệm tham quan Núi Sam từ trên cao",
                        "videoUrl": "https://www.youtube.com/watch?v=example1",
                        "thumbnailUrl": "https://example.com/thumbnail1.jpg",
                        "isActive": true,
                        "order": 1
                    },
                    {
                        "id": 2,
                        "title": "Toàn cảnh Núi Sam",
                        "description": "Chiêm ngưỡng toàn cảnh thành phố Châu Đốc",
                        "videoUrl": "https://www.youtube.com/watch?v=example2",
                        "thumbnailUrl": "https://example.com/thumbnail2.jpg",
                        "isActive": true,
                        "order": 2
                    },
                    {
                        "id": 3,
                        "title": "Công trình tâm linh",
                        "description": "Tham quan các công trình tâm linh nổi tiếng",
                        "videoUrl": "https://www.youtube.com/watch?v=example3",
                        "thumbnailUrl": "https://example.com/thumbnail3.jpg",
                        "isActive": true,
                        "order": 3
                    }
                ]'::jsonb
            )
            WHERE type = 'video-intro-with-text';
        `);

        // Cập nhật cấu trúc dữ liệu mặc định cho section mới có type là 'video-intro-with-text'
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{videos}',
                '[
                    {
                        "id": 1,
                        "title": "Cáp treo Núi Sam",
                        "description": "Trải nghiệm tham quan Núi Sam từ trên cao",
                        "videoUrl": "https://www.youtube.com/watch?v=example1",
                        "thumbnailUrl": "https://example.com/thumbnail1.jpg",
                        "isActive": true,
                        "order": 1
                    },
                    {
                        "id": 2,
                        "title": "Toàn cảnh Núi Sam",
                        "description": "Chiêm ngưỡng toàn cảnh thành phố Châu Đốc",
                        "videoUrl": "https://www.youtube.com/watch?v=example2",
                        "thumbnailUrl": "https://example.com/thumbnail2.jpg",
                        "isActive": true,
                        "order": 2
                    },
                    {
                        "id": 3,
                        "title": "Công trình tâm linh",
                        "description": "Tham quan các công trình tâm linh nổi tiếng",
                        "videoUrl": "https://www.youtube.com/watch?v=example3",
                        "thumbnailUrl": "https://example.com/thumbnail3.jpg",
                        "isActive": true,
                        "order": 3
                    }
                ]'::jsonb
            )
            WHERE type = 'video-intro-with-text' AND settings->'videos' IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Khôi phục lại cấu trúc dữ liệu cũ
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{videos}',
                'null'::jsonb
            )
            WHERE type = 'video-intro-with-text';
        `);
    }
} 