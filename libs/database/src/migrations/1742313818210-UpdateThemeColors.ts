import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateThemeColors1742313818210 implements MigrationInterface {
    name = 'UpdateThemeColors1742313818210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing colors column
        await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "colors"`);
        
        // Add new colors structure with light and dark mode
        await queryRunner.query(`ALTER TABLE "themes" ADD COLUMN "colors" jsonb DEFAULT '{
            "light": {
                "primary": {
                    "50": "#fff7e6",
                    "100": "#ffe9b3",
                    "200": "#ffdb80",
                    "300": "#ffcd4d",
                    "400": "#fec02a",
                    "500": "#feb914",
                    "600": "#e6a912",
                    "700": "#cc960f",
                    "800": "#b3840d",
                    "900": "#99710b"
                },
                "secondary": {
                    "50": "#f5f5f5",
                    "100": "#e9e9e9",
                    "200": "#d9d9d9",
                    "300": "#c4c4c4",
                    "400": "#9d9d9d",
                    "500": "#7b7b7b",
                    "600": "#555555",
                    "700": "#434343",
                    "800": "#262626",
                    "900": "#000000"
                }
            },
            "dark": {
                "primary": {
                    "50": "#fff7e6",
                    "100": "#ffe9b3",
                    "200": "#ffdb80",
                    "300": "#ffcd4d",
                    "400": "#fec02a",
                    "500": "#cc960f",
                    "600": "#b3840d",
                    "700": "#997109",
                    "800": "#805f08",
                    "900": "#664c06"
                },
                "secondary": {
                    "50": "#f9fafb",
                    "100": "#f3f4f6",
                    "200": "#e5e7eb",
                    "300": "#d1d5db",
                    "400": "#9ca3af",
                    "500": "#6b7280",
                    "600": "#4b5563",
                    "700": "#374151",
                    "800": "#1f2937",
                    "900": "#111827"
                }
            }
        }'::jsonb NOT NULL`);

        // Update Default Theme with new color scheme
        await queryRunner.query(`
            UPDATE "themes" 
            SET "colors" = '{
                "light": {
                    "primary": {
                        "50": "#fff7e6",
                        "100": "#ffe9b3",
                        "200": "#ffdb80",
                        "300": "#ffcd4d",
                        "400": "#fec02a",
                        "500": "#feb914",
                        "600": "#e6a912",
                        "700": "#cc960f",
                        "800": "#b3840d",
                        "900": "#99710b"
                    },
                    "secondary": {
                        "50": "#f5f5f5",
                        "100": "#e9e9e9",
                        "200": "#d9d9d9",
                        "300": "#c4c4c4",
                        "400": "#9d9d9d",
                        "500": "#7b7b7b",
                        "600": "#555555",
                        "700": "#434343",
                        "800": "#262626",
                        "900": "#000000"
                    }
                },
                "dark": {
                    "primary": {
                        "50": "#fff7e6",
                        "100": "#ffe9b3",
                        "200": "#ffdb80",
                        "300": "#ffcd4d",
                        "400": "#fec02a",
                        "500": "#cc960f",
                        "600": "#b3840d",
                        "700": "#997109",
                        "800": "#805f08",
                        "900": "#664c06"
                    },
                    "secondary": {
                        "50": "#f9fafb",
                        "100": "#f3f4f6",
                        "200": "#e5e7eb",
                        "300": "#d1d5db",
                        "400": "#9ca3af",
                        "500": "#6b7280",
                        "600": "#4b5563",
                        "700": "#374151",
                        "800": "#1f2937",
                        "900": "#111827"
                    }
                }
            }'::jsonb
            WHERE name = 'Default Theme'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the colors column to its original structure
        await queryRunner.query(`ALTER TABLE "themes" DROP COLUMN "colors"`);
        await queryRunner.query(`ALTER TABLE "themes" ADD COLUMN "colors" jsonb`);
    }
} 