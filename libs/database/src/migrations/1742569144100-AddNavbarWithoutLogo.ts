import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddNavbarWithoutLogo1742569144100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme?.length) {
      throw new Error('No active theme found');
    }

    const activeThemeId = activeTheme[0].id;

    await queryRunner.query(`
      INSERT INTO theme_sections (
        theme_id,
        type,
        component_name,
        title,
        "order",
        page_type,
        settings,
        is_active
      ) VALUES (
        ${activeThemeId},
        'navbar_without_logo',
        'NavbarWithoutLogo',
        'Navbar Without Logo',
        0,
        'common',
        '{
          "layout": "default",
          "backgroundColor": "",
          "textColor": "",
          "borderColor": "",
          "menuAlignment": "center",
          "showLanguageSwitcher": true,
          "showThemeToggle": true,
          "showCart": true,
          "showHotline": true,
          "hotlineNumber": "0917 001 254",
          "mobileMenuBreakpoint": "md"
        }',
        true
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'navbar_without_logo';
    `);
  }
}