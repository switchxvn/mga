import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSimpleNavbarSectionSettings1743270380306 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update settings for simple_navbar sections
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{topMenu}',
                '{
                    "leftColumn": {
                        "items": [
                            {
                                "type": "component",
                                "component": "CurrentDateTime",
                                "settings": {}
                            },
                            {
                                "type": "link",
                                "href": "/recruitment",
                                "label": "recruitment",
                                "textColor": "#4B5563",
                                "hoverColor": "#2563EB",
                                "isTranslated": true
                            }
                        ],
                        "width": "30%",
                        "alignment": "start"
                    },
                    "centerColumn": {
                        "items": [
                            {
                                "type": "text",
                                "content": "Giờ hoạt động 24/24",
                                "textColor": "#ffffff"
                            },
                            {
                                "type": "link",
                                "href": "tel:0869519678",
                                "label": "Hotline: 0869.519.678",
                                "textColor": "#ffffff",
                                "hoverColor": "#ffffff"
                            },
                            {
                                "type": "link",
                                "href": "tel:0869519679",
                                "label": "0869.519.679",
                                "textColor": "#ffffff",
                                "hoverColor": "#ffffff"
                            }
                        ],
                        "width": "40%",
                        "alignment": "center"
                    },
                    "rightColumn": {
                        "items": [
                            {
                                "type": "component",
                                "component": "LanguageSwitcher",
                                "settings": {}
                            },
                            {
                                "type": "component",
                                "component": "ThemeToggle",
                                "settings": {
                                    "mode": "full"
                                }
                            }
                        ],
                        "width": "30%",
                        "alignment": "end"
                    }
                }'::jsonb
            )
            WHERE type = 'simple_navbar'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to old structure
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{topMenu}',
                '{
                    "links": [
                        {
                            "href": "/recruitment",
                            "label": "recruitment",
                            "textColor": "#4B5563",
                            "hoverColor": "#2563EB",
                            "isTranslated": true
                        },
                        {
                            "href": "/contact",
                            "label": "contact",
                            "textColor": "#4B5563",
                            "hoverColor": "#2563EB",
                            "isTranslated": true
                        }
                    ],
                    "actions": [
                        {
                            "href": "/",
                            "label": "Trang chủ",
                            "textColor": "#ffffff",
                            "hoverColor": "#ffffff",
                            "isTranslated": false
                        },
                        {
                            "href": "#",
                            "label": "Giờ hoạt động 24/24",
                            "textColor": "#ffffff",
                            "hoverColor": "#ffffff",
                            "isTranslated": false
                        }
                    ]
                }'::jsonb
            )
            WHERE type = 'simple_navbar'
        `);
    }
} 