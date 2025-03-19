import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateServicesIconsAndAddConsulting1742369957835 implements MigrationInterface {
    name = 'UpdateServicesIconsAndAddConsulting1742369957835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update existing icons to use proper format
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:forklift' 
            WHERE icon = 'i-mdi-forklift'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:truck-delivery' 
            WHERE icon = 'i-mdi-truck-delivery'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:tools' 
            WHERE icon = 'i-mdi-tools'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:cog-transfer' 
            WHERE icon = 'i-mdi-cog-transfer'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:account-hard-hat' 
            WHERE icon = 'i-mdi-account-hard-hat'
        `);

        // Add new consulting service
        const result = await queryRunner.query(
            `INSERT INTO "services" (icon, "order", is_active) VALUES ($1, $2, $3) RETURNING id`,
            ['mdi:handshake', 6, true]
        );
        const serviceId = result[0].id;

        // Add translations for consulting service
        await queryRunner.query(
            `INSERT INTO "service_translations" (
                service_id, 
                locale, 
                title, 
                description,
                short_description,
                meta_title,
                meta_description,
                meta_keywords,
                og_title,
                og_description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                serviceId,
                'en',
                'Consulting Services',
                'Expert consulting services for forklift fleet management, warehouse optimization, and safety compliance. Get professional advice to maximize your operational efficiency.',
                'Professional forklift and warehouse consulting',
                'Forklift Consulting Services | Fleet Management & Optimization',
                'Expert consulting for forklift fleet management, warehouse optimization, and safety compliance. Improve efficiency and reduce costs.',
                'forklift consulting, warehouse optimization, fleet management, safety compliance, efficiency improvement',
                'Forklift Consulting Services - Expert Solutions',
                'Professional consulting services for forklift operations. Optimize your fleet management and warehouse efficiency.'
            ]
        );

        await queryRunner.query(
            `INSERT INTO "service_translations" (
                service_id, 
                locale, 
                title, 
                description,
                short_description,
                meta_title,
                meta_description,
                meta_keywords,
                og_title,
                og_description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                serviceId,
                'vi',
                'Tư Vấn Chuyên Nghiệp',
                'Dịch vụ tư vấn chuyên nghiệp về quản lý đội xe nâng, tối ưu hóa kho bãi và tuân thủ an toàn. Nhận tư vấn chuyên môn để tối đa hóa hiệu quả hoạt động.',
                'Tư vấn chuyên nghiệp về xe nâng và kho bãi',
                'Dịch Vụ Tư Vấn Xe Nâng | Quản Lý & Tối Ưu Hóa',
                'Tư vấn chuyên nghiệp về quản lý đội xe nâng, tối ưu hóa kho bãi và tuân thủ an toàn. Cải thiện hiệu quả và giảm chi phí.',
                'tư vấn xe nâng, tối ưu hóa kho bãi, quản lý đội xe, tuân thủ an toàn, cải thiện hiệu quả',
                'Dịch Vụ Tư Vấn Xe Nâng - Giải Pháp Chuyên Nghiệp',
                'Dịch vụ tư vấn chuyên nghiệp cho hoạt động xe nâng. Tối ưu hóa quản lý đội xe và hiệu quả kho bãi.'
            ]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert icon format changes
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'i-mdi-forklift' 
            WHERE icon = 'mdi:forklift'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'i-mdi-truck-delivery' 
            WHERE icon = 'mdi:truck-delivery'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'i-mdi-tools' 
            WHERE icon = 'mdi:tools'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'i-mdi-cog-transfer' 
            WHERE icon = 'mdi:cog-transfer'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'i-mdi-account-hard-hat' 
            WHERE icon = 'mdi:account-hard-hat'
        `);

        // Delete consulting service
        await queryRunner.query(`
            DELETE FROM "services"
            WHERE icon = 'mdi:handshake'
        `);
    }
} 