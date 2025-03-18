import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductCardStyleConfig1742307975145 implements MigrationInterface {
    name = 'AddProductCardStyleConfig1742307975145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First ensure we have a theme
        const themeResult = await queryRunner.query(`
            SELECT id FROM themes WHERE is_active = true LIMIT 1
        `);
        
        let themeId;
        if (themeResult.length > 0) {
            themeId = themeResult[0].id;
        } else {
            // Insert a default theme if none exists
            const insertResult = await queryRunner.query(`
                INSERT INTO themes (name, is_active, created_at, updated_at)
                VALUES ('Default Theme', true, NOW(), NOW())
                RETURNING id
            `);
            themeId = insertResult[0].id;
        }

        // Insert product card style config
        await queryRunner.query(`
            INSERT INTO component_style_configs (
                theme_id,
                type,
                title,
                settings,
                is_active,
                created_at,
                updated_at
            )
            VALUES (
                ${themeId},
                'product-card',
                'Product Card Style Configuration',
                '{
                    "imageHeight": 192,
                    "showLabels": {
                        "featured": true,
                        "new": true,
                        "sale": true,
                        "discount": true
                    },
                    "labelStyles": {
                        "featured": {
                            "backgroundColor": "#f59e0b",
                            "textColor": "#ffffff"
                        },
                        "new": {
                            "backgroundColor": "#3b82f6",
                            "textColor": "#ffffff"
                        },
                        "sale": {
                            "backgroundColor": "#ef4444",
                            "textColor": "#ffffff"
                        },
                        "discount": {
                            "backgroundColor": "#ef4444",
                            "textColor": "#ffffff"
                        }
                    }
                }'::jsonb,
                true,
                NOW(),
                NOW()
            )
            ON CONFLICT (theme_id, type) DO UPDATE
            SET settings = EXCLUDED.settings,
                updated_at = NOW()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM component_style_configs
            WHERE type = 'product-card'
        `);
    }
} 