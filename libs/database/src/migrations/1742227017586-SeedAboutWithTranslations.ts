import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAboutWithTranslations1742227017586 implements MigrationInterface {
    name = 'SeedAboutWithTranslations1742227017586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert about page
        await queryRunner.query(`
            INSERT INTO "about_page" (title, subtitle, meta_title, meta_description, is_active)
            VALUES (
                'About Our Company',
                'Discover our journey, mission, and the team behind our success',
                'About Us - Leading E-commerce Solution',
                'Learn about our company history, mission, values, and meet our dedicated team of professionals.',
                true
            )
            RETURNING id
        `);

        // Get the inserted about_page id
        const aboutPageResult = await queryRunner.query(`SELECT id FROM "about_page" ORDER BY id DESC LIMIT 1`);
        const aboutPageId = aboutPageResult[0].id;

        // Insert about page translations
        await queryRunner.query(`
            INSERT INTO "about_page_translations" (about_page_id, language_code, title, subtitle, meta_title, meta_description)
            VALUES
            (${aboutPageId}, 'en', 'About Our Company', 'Discover our journey, mission, and the team behind our success', 'About Us - Leading E-commerce Solution', 'Learn about our company history, mission, values, and meet our dedicated team of professionals.'),
            (${aboutPageId}, 'vi', 'Về Chúng Tôi', 'Khám phá hành trình, sứ mệnh và đội ngũ đằng sau thành công của chúng tôi', 'Về Chúng Tôi - Giải Pháp Thương Mại Điện Tử Hàng Đầu', 'Tìm hiểu về lịch sử công ty, sứ mệnh, giá trị và gặp gỡ đội ngũ chuyên nghiệp của chúng tôi.')
        `);

        // Insert about sections
        await queryRunner.query(`
            INSERT INTO "about_sections" (about_page_id, title, content, section_type, "order", is_active)
            VALUES
            (${aboutPageId}, 'Our Mission', 'To provide innovative e-commerce solutions that empower businesses to thrive in the digital marketplace.', 'text', 1, true),
            (${aboutPageId}, 'Our Vision', 'To become the global leader in e-commerce solutions, recognized for our innovation, reliability, and commitment to customer success.', 'text', 2, true),
            (${aboutPageId}, 'Our Values', 'Innovation, Integrity, Excellence, Customer Focus, Collaboration', 'text', 3, true)
            RETURNING id
        `);

        // Get the inserted section ids
        const sectionIds = await queryRunner.query(`
            SELECT id, title FROM "about_sections" 
            WHERE about_page_id = ${aboutPageId} 
            ORDER BY "order" ASC
        `);

        // Insert section translations
        for (const section of sectionIds) {
            if (section.title === 'Our Mission') {
                await queryRunner.query(`
                    INSERT INTO "about_section_translations" (about_section_id, language_code, title, content)
                    VALUES
                    (${section.id}, 'en', 'Our Mission', 'To provide innovative e-commerce solutions that empower businesses to thrive in the digital marketplace.'),
                    (${section.id}, 'vi', 'Sứ Mệnh', 'Cung cấp giải pháp thương mại điện tử sáng tạo giúp doanh nghiệp phát triển mạnh mẽ trong thị trường số.')
                `);
            } else if (section.title === 'Our Vision') {
                await queryRunner.query(`
                    INSERT INTO "about_section_translations" (about_section_id, language_code, title, content)
                    VALUES
                    (${section.id}, 'en', 'Our Vision', 'To become the global leader in e-commerce solutions, recognized for our innovation, reliability, and commitment to customer success.'),
                    (${section.id}, 'vi', 'Tầm Nhìn', 'Trở thành đơn vị dẫn đầu toàn cầu về giải pháp thương mại điện tử, được công nhận về sự đổi mới, đáng tin cậy và cam kết với sự thành công của khách hàng.')
                `);
            } else if (section.title === 'Our Values') {
                await queryRunner.query(`
                    INSERT INTO "about_section_translations" (about_section_id, language_code, title, content)
                    VALUES
                    (${section.id}, 'en', 'Our Values', 'Innovation, Integrity, Excellence, Customer Focus, Collaboration'),
                    (${section.id}, 'vi', 'Giá Trị Cốt Lõi', 'Đổi mới, Chính trực, Xuất sắc, Tập trung vào khách hàng, Hợp tác')
                `);
            }
        }

        // Insert team members
        await queryRunner.query(`
            INSERT INTO "about_team_members" (about_page_id, name, position, bio, image_url, email, social_links, "order", is_active)
            VALUES
            (${aboutPageId}, 'John Smith', 'CEO & Founder', 'With over 15 years of experience in e-commerce and technology.', '/images/team/john-smith.jpg', 'john@example.com', '{"linkedin":"https://linkedin.com/in/john-smith","twitter":"https://twitter.com/johnsmith"}', 1, true),
            (${aboutPageId}, 'Sarah Johnson', 'CTO', 'Leading our development team with 12 years of technical expertise.', '/images/team/sarah-johnson.jpg', 'sarah@example.com', '{"linkedin":"https://linkedin.com/in/sarah-johnson","github":"https://github.com/sarahj"}', 2, true)
            RETURNING id, name
        `);

        // Get the inserted team member ids
        const teamMemberIds = await queryRunner.query(`
            SELECT id, name FROM "about_team_members" 
            WHERE about_page_id = ${aboutPageId}
            ORDER BY "order" ASC
        `);

        // Insert team member translations
        for (const member of teamMemberIds) {
            if (member.name === 'John Smith') {
                await queryRunner.query(`
                    INSERT INTO "about_team_member_translations" (about_team_member_id, language_code, name, position, bio)
                    VALUES
                    (${member.id}, 'en', 'John Smith', 'CEO & Founder', 'With over 15 years of experience in e-commerce and technology.'),
                    (${member.id}, 'vi', 'John Smith', 'Giám Đốc Điều Hành & Nhà Sáng Lập', 'Với hơn 15 năm kinh nghiệm trong lĩnh vực thương mại điện tử và công nghệ.')
                `);
            } else if (member.name === 'Sarah Johnson') {
                await queryRunner.query(`
                    INSERT INTO "about_team_member_translations" (about_team_member_id, language_code, name, position, bio)
                    VALUES
                    (${member.id}, 'en', 'Sarah Johnson', 'CTO', 'Leading our development team with 12 years of technical expertise.'),
                    (${member.id}, 'vi', 'Sarah Johnson', 'Giám Đốc Công Nghệ', 'Dẫn dắt đội ngũ phát triển với 12 năm chuyên môn kỹ thuật.')
                `);
            }
        }

        // Insert milestones
        await queryRunner.query(`
            INSERT INTO "about_milestones" (about_page_id, year, title, description, image_url, "order", is_active)
            VALUES
            (${aboutPageId}, '2018', 'Company Founded', 'Our journey began with a vision to revolutionize e-commerce solutions.', '/images/milestones/founding.jpg', 1, true),
            (${aboutPageId}, '2020', 'International Expansion', 'Expanded our operations to serve clients across Asia and Europe.', '/images/milestones/expansion.jpg', 2, true),
            (${aboutPageId}, '2023', 'Global Recognition', 'Named as one of the top 10 e-commerce solution providers globally.', '/images/milestones/recognition.jpg', 3, true)
            RETURNING id, title
        `);

        // Get the inserted milestone ids
        const milestoneIds = await queryRunner.query(`
            SELECT id, title FROM "about_milestones" 
            WHERE about_page_id = ${aboutPageId}
            ORDER BY "order" ASC
        `);

        // Insert milestone translations
        for (const milestone of milestoneIds) {
            if (milestone.title === 'Company Founded') {
                await queryRunner.query(`
                    INSERT INTO "about_milestone_translations" (about_milestone_id, language_code, title, description)
                    VALUES
                    (${milestone.id}, 'en', 'Company Founded', 'Our journey began with a vision to revolutionize e-commerce solutions.'),
                    (${milestone.id}, 'vi', 'Thành Lập Công Ty', 'Hành trình của chúng tôi bắt đầu với tầm nhìn cách mạng hóa giải pháp thương mại điện tử.')
                `);
            } else if (milestone.title === 'International Expansion') {
                await queryRunner.query(`
                    INSERT INTO "about_milestone_translations" (about_milestone_id, language_code, title, description)
                    VALUES
                    (${milestone.id}, 'en', 'International Expansion', 'Expanded our operations to serve clients across Asia and Europe.'),
                    (${milestone.id}, 'vi', 'Mở Rộng Quốc Tế', 'Mở rộng hoạt động để phục vụ khách hàng trên khắp Châu Á và Châu Âu.')
                `);
            } else if (milestone.title === 'Global Recognition') {
                await queryRunner.query(`
                    INSERT INTO "about_milestone_translations" (about_milestone_id, language_code, title, description)
                    VALUES
                    (${milestone.id}, 'en', 'Global Recognition', 'Named as one of the top 10 e-commerce solution providers globally.'),
                    (${milestone.id}, 'vi', 'Công Nhận Toàn Cầu', 'Được vinh danh là một trong 10 nhà cung cấp giải pháp thương mại điện tử hàng đầu toàn cầu.')
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete all data in reverse order to avoid foreign key constraints
        await queryRunner.query(`DELETE FROM "about_milestone_translations"`);
        await queryRunner.query(`DELETE FROM "about_team_member_translations"`);
        await queryRunner.query(`DELETE FROM "about_section_translations"`);
        await queryRunner.query(`DELETE FROM "about_page_translations"`);
        await queryRunner.query(`DELETE FROM "about_milestones"`);
        await queryRunner.query(`DELETE FROM "about_team_members"`);
        await queryRunner.query(`DELETE FROM "about_sections"`);
        await queryRunner.query(`DELETE FROM "about_page"`);
    }
} 