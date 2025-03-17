import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAboutData1742223537109 implements MigrationInterface {
    name = 'SeedAboutData1742223537109'

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

        // Insert about sections
        await queryRunner.query(`
            INSERT INTO "about_sections" (about_page_id, title, content, section_type, "order", is_active)
            VALUES
            (${aboutPageId}, 'Our Mission', 'To provide innovative e-commerce solutions that empower businesses to thrive in the digital marketplace. We are committed to delivering exceptional value through cutting-edge technology and outstanding customer service.', 'text', 1, true),
            (${aboutPageId}, 'Our Vision', 'To become the global leader in e-commerce solutions, recognized for our innovation, reliability, and commitment to customer success.', 'text', 2, true),
            (${aboutPageId}, 'Our Values', '
- Innovation: Constantly pushing boundaries and embracing new technologies
- Integrity: Operating with honesty and transparency in all our dealings
- Excellence: Striving for the highest quality in everything we do
- Customer Focus: Putting our customers'' success at the heart of our business
- Collaboration: Working together to achieve exceptional results
            ', 'text', 3, true)
        `);

        // Insert team members
        await queryRunner.query(`
            INSERT INTO "about_team_members" (about_page_id, name, position, bio, image_url, email, social_links, "order", is_active)
            VALUES
            (${aboutPageId}, 'John Smith', 'CEO & Founder', 'With over 15 years of experience in e-commerce and technology, John leads our company with vision and innovation.', '/images/team/john-smith.jpg', 'john@example.com', '{"linkedin": "https://linkedin.com/in/john-smith", "twitter": "https://twitter.com/johnsmith"}', 1, true),
            (${aboutPageId}, 'Sarah Johnson', 'CTO', 'Sarah brings 12 years of technical expertise and leads our development team in creating cutting-edge solutions.', '/images/team/sarah-johnson.jpg', 'sarah@example.com', '{"linkedin": "https://linkedin.com/in/sarah-johnson", "github": "https://github.com/sarahj"}', 2, true),
            (${aboutPageId}, 'Michael Chen', 'Head of Design', 'Michael is passionate about creating beautiful and intuitive user experiences that delight our customers.', '/images/team/michael-chen.jpg', 'michael@example.com', '{"linkedin": "https://linkedin.com/in/michael-chen", "dribbble": "https://dribbble.com/michaelc"}', 3, true)
        `);

        // Insert milestones
        await queryRunner.query(`
            INSERT INTO "about_milestones" (about_page_id, year, title, description, image_url, "order", is_active)
            VALUES
            (${aboutPageId}, '2018', 'Company Founded', 'Our journey began with a vision to revolutionize e-commerce solutions.', '/images/milestones/founding.jpg', 1, true),
            (${aboutPageId}, '2019', 'First Major Client', 'Secured our first enterprise client and successfully launched their e-commerce platform.', '/images/milestones/first-client.jpg', 2, true),
            (${aboutPageId}, '2020', 'International Expansion', 'Expanded our operations to serve clients across Asia and Europe.', '/images/milestones/expansion.jpg', 3, true),
            (${aboutPageId}, '2021', 'Innovation Award', 'Received the Technology Innovation Award for our AI-powered e-commerce solutions.', '/images/milestones/award.jpg', 4, true),
            (${aboutPageId}, '2022', 'Cloud Platform Launch', 'Launched our cloud-based e-commerce platform, serving over 1000 businesses.', '/images/milestones/platform-launch.jpg', 5, true),
            (${aboutPageId}, '2023', 'Global Recognition', 'Named as one of the top 10 e-commerce solution providers globally.', '/images/milestones/recognition.jpg', 6, true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete all data in reverse order to avoid foreign key constraints
        await queryRunner.query(`DELETE FROM "about_milestones"`);
        await queryRunner.query(`DELETE FROM "about_team_members"`);
        await queryRunner.query(`DELETE FROM "about_sections"`);
        await queryRunner.query(`DELETE FROM "about_page"`);
    }
} 