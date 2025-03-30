import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMGAAboutPageData1743270380246 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert About Page and get the ID
        const aboutPageResult = await queryRunner.query(`
            INSERT INTO about_page (title, subtitle, meta_title, meta_description, is_active)
            VALUES (
                'Về MGA',
                'Nhà phân phối xe nâng hàng đầu Việt Nam',
                'MGA - Nhà phân phối xe nâng hàng đầu Việt Nam',
                'MGA là nhà phân phối xe nâng hàng đầu tại Việt Nam, cung cấp các dòng xe nâng điện, xe nâng dầu với chất lượng và dịch vụ tốt nhất.',
                true
            ) RETURNING id;
        `);

        const aboutPageId = aboutPageResult[0].id;

        // Insert About Sections
        await queryRunner.query(`
            INSERT INTO about_sections (about_page_id, title, content, section_type, "order", is_active)
            VALUES 
            (${aboutPageId}, 'Giới thiệu', 'MGA là nhà phân phối xe nâng hàng đầu tại Việt Nam. Chúng tôi tự hào cung cấp các dòng xe nâng chất lượng cao từ các thương hiệu uy tín trên thế giới. Với hơn 10 năm kinh nghiệm trong ngành, chúng tôi cam kết mang đến giải pháp tối ưu cho doanh nghiệp của bạn.', 'text', 1, true),
            (${aboutPageId}, 'Tầm nhìn', 'Trở thành đơn vị cung cấp giải pháp xe nâng và thiết bị công nghiệp hàng đầu tại Việt Nam, mang đến giá trị bền vững cho khách hàng và đối tác.', 'text', 2, true),
            (${aboutPageId}, 'Sứ mệnh', 'Cung cấp sản phẩm và dịch vụ chất lượng cao, đáp ứng nhu cầu đa dạng của khách hàng. Xây dựng môi trường làm việc chuyên nghiệp và phát triển đội ngũ nhân viên giàu kinh nghiệm.', 'text', 3, true);
        `);

        // Insert Milestones
        await queryRunner.query(`
            INSERT INTO about_milestones (about_page_id, year, title, description, "order", is_active)
            VALUES 
            (${aboutPageId}, '2013', 'Thành lập công ty', 'MGA được thành lập với sứ mệnh cung cấp giải pháp xe nâng chất lượng cao cho thị trường Việt Nam.', 1, true),
            (${aboutPageId}, '2015', 'Mở rộng thị trường', 'Trở thành đối tác chính thức của nhiều thương hiệu xe nâng uy tín trên thế giới.', 2, true),
            (${aboutPageId}, '2018', 'Phát triển dịch vụ', 'Ra mắt trung tâm bảo trì và sửa chữa xe nâng chuyên nghiệp.', 3, true),
            (${aboutPageId}, '2020', 'Mở rộng chi nhánh', 'Mở thêm chi nhánh tại các tỉnh thành lớn để phục vụ khách hàng tốt hơn.', 4, true),
            (${aboutPageId}, '2023', 'Phát triển bền vững', 'Đầu tư vào công nghệ và đào tạo nhân sự, hướng tới phát triển bền vững.', 5, true);
        `);

        // Insert translations for English
        await queryRunner.query(`
            INSERT INTO about_page_translations (about_page_id, language_code, title, subtitle, meta_title, meta_description)
            VALUES (
                ${aboutPageId},
                'en',
                'About MGA',
                'Leading Forklift Distributor in Vietnam',
                'MGA - Leading Forklift Distributor in Vietnam',
                'MGA is the leading forklift distributor in Vietnam, providing electric and diesel forklifts with the best quality and service.'
            );
        `);

        // Get section IDs
        const sectionsResult = await queryRunner.query(`
            SELECT id FROM about_sections WHERE about_page_id = ${aboutPageId} ORDER BY "order";
        `);

        // Insert section translations
        await queryRunner.query(`
            INSERT INTO about_section_translations (about_section_id, language_code, title, content)
            VALUES 
            (${sectionsResult[0].id}, 'en', 'Introduction', 'MGA is the leading forklift distributor in Vietnam. We proudly provide high-quality forklifts from reputable global brands. With over 10 years of industry experience, we are committed to delivering optimal solutions for your business.'),
            (${sectionsResult[1].id}, 'en', 'Vision', 'To become the leading provider of forklift solutions and industrial equipment in Vietnam, delivering sustainable value to customers and partners.'),
            (${sectionsResult[2].id}, 'en', 'Mission', 'Provide high-quality products and services that meet diverse customer needs. Build a professional working environment and develop an experienced team.');
        `);

        // Get milestone IDs
        const milestonesResult = await queryRunner.query(`
            SELECT id FROM about_milestones WHERE about_page_id = ${aboutPageId} ORDER BY "order";
        `);

        // Insert milestone translations
        await queryRunner.query(`
            INSERT INTO about_milestone_translations (about_milestone_id, language_code, title, description)
            VALUES 
            (${milestonesResult[0].id}, 'en', 'Company Establishment', 'MGA was established with the mission of providing high-quality forklift solutions to the Vietnamese market.'),
            (${milestonesResult[1].id}, 'en', 'Market Expansion', 'Became an official partner of many reputable forklift brands worldwide.'),
            (${milestonesResult[2].id}, 'en', 'Service Development', 'Launched professional forklift maintenance and repair center.'),
            (${milestonesResult[3].id}, 'en', 'Branch Expansion', 'Opened more branches in major cities to better serve customers.'),
            (${milestonesResult[4].id}, 'en', 'Sustainable Development', 'Investing in technology and personnel training, aiming for sustainable development.');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Get the about page ID first
        const aboutPageResult = await queryRunner.query(`
            SELECT id FROM about_page WHERE title = 'Về MGA' LIMIT 1;
        `);
        const aboutPageId = aboutPageResult[0].id;

        // Remove translations
        await queryRunner.query(`DELETE FROM about_milestone_translations WHERE about_milestone_id IN (SELECT id FROM about_milestones WHERE about_page_id = ${aboutPageId})`);
        await queryRunner.query(`DELETE FROM about_section_translations WHERE about_section_id IN (SELECT id FROM about_sections WHERE about_page_id = ${aboutPageId})`);
        await queryRunner.query(`DELETE FROM about_page_translations WHERE about_page_id = ${aboutPageId}`);

        // Remove data
        await queryRunner.query(`DELETE FROM about_milestones WHERE about_page_id = ${aboutPageId}`);
        await queryRunner.query(`DELETE FROM about_sections WHERE about_page_id = ${aboutPageId}`);
        await queryRunner.query(`DELETE FROM about_page WHERE id = ${aboutPageId}`);
    }
}