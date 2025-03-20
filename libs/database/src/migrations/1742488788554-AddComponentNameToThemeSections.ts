import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddComponentNameToThemeSections1742488788554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'theme_sections',
      new TableColumn({
        name: 'component_name',
        type: 'varchar',
        length: '100',
        isNullable: true,
        default: null,
      }),
    );

    // Update existing hero sections with default component
    await queryRunner.query(`
      UPDATE theme_sections 
      SET component_name = 
        CASE 
          WHEN type = 'hero' THEN 'HeroSection'
          WHEN type = 'featured_products' THEN 'FeaturedProducts'
          WHEN type = 'product_categories' THEN 'ProductCategoriesSection'
          WHEN type = 'services' THEN 'ServicesList'
          WHEN type = 'news' THEN 'NewsSection'
          WHEN type = 'company_intro' THEN 'CompanyIntroSection'
          ELSE NULL
        END
      WHERE component_name IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('theme_sections', 'component_name');
  }
} 