import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostTranslations1742396735989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get existing posts
    const posts = await queryRunner.query(`
      SELECT id, title, content, short_description FROM posts 
      WHERE title IN (
        'Top 5 Xe Nâng Điện Bán Chạy Nhất 2024',
        'Hướng Dẫn Vận Hành Xe Nâng An Toàn',
        'Lịch Trình Bảo Dưỡng Xe Nâng Định Kỳ',
        '5 Yếu Tố Quan Trọng Khi Chọn Mua Xe Nâng'
      )
    `);

    // Add translations for each post
    for (const post of posts) {
      // Vietnamese translation
      await queryRunner.query(`
        INSERT INTO post_translations (
          post_id, locale, title, content, short_description, slug,
          meta_title, meta_description, meta_keywords, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        post.id,
        'vi',
        post.title,
        post.content,
        post.short_description,
        post.title.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''),
        `${post.title} | Forklift Solutions Blog`,
        `${post.short_description}. Đọc thêm tại Forklift Solutions Blog.`,
        'xe nâng, forklift, logistics'
      ]);

      // English translation
      const translations = {
        'Top 5 Xe Nâng Điện Bán Chạy Nhất 2024': {
          title: 'Top 5 Best-Selling Electric Forklifts in 2024',
          content: `In 2024, the electric forklift market has witnessed strong growth with many impressive models. This article will introduce the top 5 most popular electric forklifts, including MGA models from 1.0 to 3.0 tons. We will analyze in detail the advantages, outstanding features, and why these models are trusted by customers.

Evaluation criteria include:
- Performance and lifting capacity
- Battery life
- Safety features
- Operating costs
- Durability and quality

Notably, the MGA25E model with 2.5-ton capacity is leading the trend with advanced lithium-ion battery technology and smart energy management system.`,
          short_description: 'Discover the best-selling electric forklift models of 2024 and why they are popular',
          slug: 'top-5-best-selling-electric-forklifts-2024',
          meta_keywords: 'electric forklift, best selling forklifts, MGA forklift'
        },
        'Hướng Dẫn Vận Hành Xe Nâng An Toàn': {
          title: 'Safe Forklift Operation Guide',
          content: `Safety is the top priority when operating a forklift. This article provides detailed guidance on:

1. Pre-operation inspection:
   - Oil and fuel check
   - Brake system inspection
   - Tire and fork inspection

2. Standard operating procedures:
   - Starting and moving
   - Load lifting techniques
   - Safe warehouse navigation

3. Emergency handling:
   - Emergency stop procedures
   - Tilt handling
   - First aid procedures

Following these guidelines will ensure operator and workplace safety.`,
          short_description: 'Complete guide on how to operate forklifts safely and efficiently',
          slug: 'safe-forklift-operation-guide',
          meta_keywords: 'forklift safety, operation guide, warehouse safety'
        },
        'Lịch Trình Bảo Dưỡng Xe Nâng Định Kỳ': {
          title: 'Regular Forklift Maintenance Schedule',
          content: `Regular maintenance is key to maintaining performance and extending forklift lifespan. Here's a detailed maintenance schedule:

Daily maintenance:
- Check oil and fuel levels
- Check tire pressure
- Inspect brake system

Weekly maintenance:
- Battery inspection
- Lubricate moving parts
- Check hydraulic system

Monthly maintenance:
- Engine oil change
- Brake check and adjustment
- Cooling system inspection

Quarterly maintenance:
- Filter inspection and replacement
- Engine valve adjustment
- Electrical system check

Following this schedule will help detect potential issues early and reduce major repair costs.`,
          short_description: 'Detailed guide on forklift maintenance schedule for optimal performance',
          slug: 'regular-forklift-maintenance-schedule',
          meta_keywords: 'forklift maintenance, preventive maintenance, service schedule'
        },
        '5 Yếu Tố Quan Trọng Khi Chọn Mua Xe Nâng': {
          title: '5 Key Factors When Choosing a Forklift',
          content: `Choosing the right forklift plays a crucial role in business efficiency. Here are 5 key factors to consider:

1. Usage requirements:
   - Required lifting capacity
   - Working environment
   - Frequency of use

2. Investment costs:
   - Purchase price
   - Operating costs
   - Maintenance costs

3. Fuel type:
   - Electric forklifts
   - Diesel forklifts
   - LPG forklifts

4. Size and maneuverability:
   - Maximum lifting height
   - Turning radius
   - Ability to move in tight spaces

5. After-sales service:
   - Warranty terms
   - Maintenance service
   - Spare parts supply

This article will analyze each factor in detail to help you make the right decision.`,
          short_description: 'Explore the important factors to consider when choosing a forklift for your business',
          slug: '5-key-factors-when-choosing-forklift',
          meta_keywords: 'forklift buying guide, choosing forklift, forklift selection'
        }
      };

      const englishTranslation = translations[post.title];
      await queryRunner.query(`
        INSERT INTO post_translations (
          post_id, locale, title, content, short_description, slug,
          meta_title, meta_description, meta_keywords, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        post.id,
        'en',
        englishTranslation.title,
        englishTranslation.content,
        englishTranslation.short_description,
        englishTranslation.slug,
        `${englishTranslation.title} | Forklift Solutions Blog`,
        `${englishTranslation.short_description}. Read more at Forklift Solutions Blog.`,
        englishTranslation.meta_keywords
      ]);
    }

    // Remove direct content from posts table since we now have translations
    await queryRunner.query(`
      UPDATE posts 
      SET content = NULL, 
          short_description = NULL
      WHERE title IN (
        'Top 5 Xe Nâng Điện Bán Chạy Nhất 2024',
        'Hướng Dẫn Vận Hành Xe Nâng An Toàn',
        'Lịch Trình Bảo Dưỡng Xe Nâng Định Kỳ',
        '5 Yếu Tố Quan Trọng Khi Chọn Mua Xe Nâng'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get post IDs
    const posts = await queryRunner.query(`
      SELECT id FROM posts 
      WHERE title IN (
        'Top 5 Xe Nâng Điện Bán Chạy Nhất 2024',
        'Hướng Dẫn Vận Hành Xe Nâng An Toàn',
        'Lịch Trình Bảo Dưỡng Xe Nâng Định Kỳ',
        '5 Yếu Tố Quan Trọng Khi Chọn Mua Xe Nâng'
      )
    `);

    // Delete translations
    for (const post of posts) {
      await queryRunner.query(`DELETE FROM post_translations WHERE post_id = $1`, [post.id]);
    }

    // Restore original content from Vietnamese translations
    const viTranslations = await queryRunner.query(`
      SELECT post_id, content, short_description 
      FROM post_translations 
      WHERE locale = 'vi' AND post_id IN (${posts.map(p => p.id).join(',')})
    `);

    for (const trans of viTranslations) {
      await queryRunner.query(`
        UPDATE posts 
        SET content = $1, 
            short_description = $2
        WHERE id = $3
      `, [trans.content, trans.short_description, trans.post_id]);
    }
  }
} 