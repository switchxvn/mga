import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCombinedNavbarSettings1742571593301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the current settings
    const result = await queryRunner.query(
      `SELECT id, settings FROM theme_sections WHERE type = 'combined_navbar' LIMIT 1`
    );

    if (result && result[0]) {
      const currentSettings = result[0].settings;
      
      // Create new settings object without logo and with separate background colors
      const newSettings = {
        // Header section settings
        headerBackgroundColor: "#ffffff", // Default white for header
        slogan: currentSettings.slogan,
        hotlines: currentSettings.hotlines,
        
        // Menu section settings
        menuBackgroundColor: currentSettings.backgroundColor || "#ffffff", // Use current background color for menu
        textColor: currentSettings.textColor,
        borderColor: currentSettings.borderColor,
        menuAlignment: currentSettings.menuAlignment,
        
        // Global settings
        showCart: currentSettings.showCart,
        showThemeToggle: currentSettings.showThemeToggle,
        showLanguageSwitcher: currentSettings.showLanguageSwitcher,
      };

      // Update the settings
      await queryRunner.query(
        `UPDATE theme_sections 
         SET settings = $1,
             updated_at = NOW()
         WHERE type = 'combined_navbar'`,
        [JSON.stringify(newSettings)]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the current settings
    const result = await queryRunner.query(
      `SELECT id, settings FROM theme_sections WHERE type = 'combined_navbar' LIMIT 1`
    );

    if (result && result[0]) {
      const currentSettings = result[0].settings;
      
      // Restore old settings structure
      const oldSettings = {
        logo: {
          src: "/images/logo.png",
          alt: "Logo",
          width: 120,
          height: 60,
          darkModeSrc: "/images/logo-dark.png"
        },
        backgroundColor: currentSettings.menuBackgroundColor,
        textColor: currentSettings.textColor,
        borderColor: currentSettings.borderColor,
        menuAlignment: currentSettings.menuAlignment,
        showLanguageSwitcher: currentSettings.showLanguageSwitcher,
        showThemeToggle: currentSettings.showThemeToggle,
        showCart: currentSettings.showCart,
        slogan: currentSettings.slogan,
        hotlines: currentSettings.hotlines
      };

      // Update back to old structure
      await queryRunner.query(
        `UPDATE theme_sections 
         SET settings = $1,
             updated_at = NOW()
         WHERE type = 'combined_navbar'`,
        [JSON.stringify(oldSettings)]
      );
    }
  }
} 