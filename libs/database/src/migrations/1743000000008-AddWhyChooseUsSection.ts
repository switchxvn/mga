import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhyChooseUsSection1743000000008 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get active theme id
        const activeTheme = await queryRunner.query(`
            SELECT id FROM themes WHERE is_active = true LIMIT 1
        `);

        if (!activeTheme?.length) {
            throw new Error('No active theme found');
        }

        const themeId = activeTheme[0].id;

        // Insert Why Choose Us section
        await queryRunner.query(`
            INSERT INTO theme_sections (
                theme_id,
                type,
                title,
                "order",
                page_type,
                component_name,
                settings,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                ${themeId},
                'why_choose_us',
                'Why Choose Us',
                8,
                'home_page',
                'WhyChooseUsSection',
                '{
                    "title": "Why Choose Us",
                    "description": "",
                    "layout": "grid",
                    "columns": 5,
                    "items": [
                        {
                            "icon": "ShieldCheck",
                            "title": "Quality Assurance",
                            "description": "We ensure the highest quality standards in all our products and services."
                        },
                        {
                            "icon": "Clock",
                            "title": "24/7 Support",
                            "description": "Our dedicated team is always available to assist you with any queries."
                        },
                        {
                            "icon": "Truck",
                            "title": "Fast Delivery",
                            "description": "Quick and reliable delivery services across all locations."
                        },
                        {
                            "icon": "Award",
                            "title": "Expert Team",
                            "description": "Our experienced professionals provide the best solutions."
                        },
                        {
                            "icon": "HeartHandshake",
                            "title": "Customer Satisfaction",
                            "description": "Your satisfaction is our top priority."
                        }
                    ],
                    "gap": "2rem",
                    "background": {
                        "light": "#FFFFFF",
                        "dark": "#1a1a1a"
                    },
                    "border": {
                        "light": "#FFFFFF",
                        "dark": "#FFFFFF"
                    },
                    "padding": {
                        "top": "2rem",
                        "bottom": "2rem"
                    },
                    "cardStyle": {
                        "height": "auto",
                        "padding": "2rem 1.5rem",
                        "textAlign": "center",
                        "background": {
                            "dark": "transparent",
                            "light": "transparent"
                        },
                        "transition": "all 0.3s ease"
                    },
                    "headerStyle": {
                        "background": {
                            "light": "bg-primary-600",
                            "dark": "dark:bg-primary-500"
                        },
                        "title": {
                            "fontSize": "text-2xl sm:text-3xl",
                            "useUppercase": true,
                            "color": {
                                "light": "text-white",
                                "dark": "text-white"
                            }
                        }
                    },
                    "iconStyle": {
                        "size": "4rem",
                        "padding": "1rem",
                        "color": {
                            "light": "#017399",
                            "dark": "#FFFFFF"
                        },
                        "margin": "0 auto 1.5rem auto",
                        "hexagon": {
                            "size": "6rem",
                            "background": {
                                "light": "#FFFFFF",
                                "dark": "#1a1a1a"
                            },
                            "border": {
                                "width": "2px",
                                "gradient": {
                                    "from": "#FFB800",
                                    "to": "#FF8A00"
                                }
                            }
                        }
                    },
                    "titleStyle": {
                        "size": "xl",
                        "weight": "bold",
                        "fontWeight": "700",
                        "color": {
                            "light": "#111827",
                            "dark": "#F9FAFB"
                        },
                        "margin": "0 0 1rem 0",
                        "textTransform": "uppercase"
                    },
                    "descriptionStyle": {
                        "size": "base",
                        "color": {
                            "light": "#333333",
                            "dark": "#FFFFFF"
                        },
                        "margin": "0",
                        "maxWidth": "100%",
                        "padding": "0",
                        "border": {
                            "width": "0",
                            "style": "none",
                            "color": {
                                "light": "transparent",
                                "dark": "transparent"
                            },
                            "radius": "0"
                        }
                    }
                }',
                true,
                NOW(),
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM theme_sections 
            WHERE type = 'why_choose_us' 
            AND component_name = 'WhyChooseUsSection'
        `);
    }
}