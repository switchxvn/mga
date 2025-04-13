import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateContactMapSectionSettings1743270380283 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Lấy tất cả các contact sections có type là 'map'
        const mapSections = await queryRunner.query(`
            SELECT id, settings FROM contact_sections 
            WHERE type = 'map'
        `);

        // Cập nhật cấu trúc settings cho từng section
        for (const section of mapSections) {
            const currentSettings = section.settings || {};
            
            // Tạo cấu trúc settings mới
            const newSettings = {
                mapHeight: currentSettings.mapHeight || '450px',
                mapUrl: currentSettings.mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.634577287642!2d105.07654807592712!3d10.685446160863476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a215d98a63f69%3A0xc8274e4e878f281!2zQ8OhcCB0cmVvIE7DumkgU2Ft!5e0!3m2!1svi!2s!4v1744503351826!5m2!1svi!2s',
                backgroundColor: currentSettings.backgroundColor || 'bg-gray-50 dark:bg-gray-900',
                textColor: currentSettings.textColor || 'text-gray-900 dark:text-white',
                padding: currentSettings.padding || '4rem 0'
            };

            // Cập nhật settings trong database
            await queryRunner.query(`
                UPDATE contact_sections 
                SET settings = $1 
                WHERE id = $2
            `, [newSettings, section.id]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Không cần revert vì chúng ta chỉ đang cập nhật cấu trúc dữ liệu
        // và không thay đổi schema
    }
} 