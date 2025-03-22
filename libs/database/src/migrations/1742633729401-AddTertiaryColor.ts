import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTertiaryColor1742633729401 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find the active theme
        const activeTheme = await queryRunner.query(
            `SELECT * FROM themes WHERE is_active = true LIMIT 1`
        );

        if (activeTheme.length === 0) {
            return;
        }

        const theme = activeTheme[0];
        const colors = theme.colors;

        // Add tertiary color shades for both light and dark modes
        const tertiaryShades = {
            '50': '#e6f3f7',
            '100': '#cce7ef',
            '200': '#99cfe0',
            '300': '#66b7d0',
            '400': '#339fc1',
            '500': '#017399', // Base color
            '600': '#01668a',
            '700': '#01587a',
            '800': '#014b6b',
            '900': '#013d5c'
        };

        // Update colors for both light and dark modes
        colors.light.tertiary = tertiaryShades;
        colors.dark.tertiary = tertiaryShades;

        // Update the theme with new colors
        await queryRunner.query(
            `UPDATE themes 
             SET colors = $1 
             WHERE id = $2`,
            [colors, theme.id]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Find the active theme
        const activeTheme = await queryRunner.query(
            `SELECT * FROM themes WHERE is_active = true LIMIT 1`
        );

        if (activeTheme.length === 0) {
            return;
        }

        const theme = activeTheme[0];
        const colors = theme.colors;

        // Remove tertiary colors from both light and dark modes
        delete colors.light.tertiary;
        delete colors.dark.tertiary;

        // Update the theme without tertiary colors
        await queryRunner.query(
            `UPDATE themes 
             SET colors = $1 
             WHERE id = $2`,
            [colors, theme.id]
        );
    }

}
