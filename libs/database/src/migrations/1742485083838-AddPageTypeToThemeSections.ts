import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPageTypeToThemeSections1742485083838 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'theme_sections',
      new TableColumn({
        name: 'page_type',
        type: 'enum',
        enum: ['home_page', 'news_page', 'product_page', 'about_page', 'service_page'],
        default: "'home_page'",
        isNullable: false,
      }),
    );

    // Update existing records to have home_page as default
    await queryRunner.query(`
      UPDATE theme_sections 
      SET page_type = 'home_page' 
      WHERE page_type IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('theme_sections', 'page_type');
  }
} 