import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedThemeData1741613731176 implements MigrationInterface {
    name = 'SeedThemeData1741613731176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO themes (
                name,
                colors,
                homepage_layout,
                slider_config,
                is_active
            ) VALUES (
                'Default Theme',
                '{
                    "primary": "hsl(var(--primary))",
                    "secondary": "hsl(var(--secondary))",
                    "accent": "hsl(var(--accent))",
                    "background": "hsl(var(--background))",
                    "text": "hsl(var(--foreground))"
                }',
                '{
                    "sections": [
                        {
                            "type": "slider",
                            "title": "Hero Section",
                            "order": 1,
                            "config": {
                                "autoplay": true,
                                "delay": 5000
                            }
                        },
                        {
                            "type": "featured_products",
                            "title": "Featured Products",
                            "order": 2,
                            "config": {
                                "limit": 8,
                                "slidesPerView": {
                                    "desktop": 4,
                                    "tablet": 2,
                                    "mobile": 1
                                }
                            }
                        },
                        {
                            "type": "category_products",
                            "title": "Shop by Category",
                            "order": 3,
                            "config": {
                                "categories": [],
                                "productsPerCategory": 4
                            }
                        },
                        {
                            "type": "news",
                            "title": "Latest Posts",
                            "order": 4,
                            "config": {
                                "limit": 20,
                                "slidesPerView": {
                                    "desktop": 4,
                                    "tablet": 2,
                                    "mobile": 1
                                },
                                "autoplay": true,
                                "delay": 5000
                            }
                        }
                    ]
                }',
                '{
                    "items": [
                        {
                            "image_url": "/images/hero/slide1.jpg",
                            "title": "New Collection",
                            "description": "Discover our latest arrivals",
                            "link": "/products",
                            "order": 1
                        },
                        {
                            "image_url": "/images/hero/slide2.jpg",
                            "title": "Special Offers",
                            "description": "Up to 50% off on selected items",
                            "link": "/products/sale",
                            "order": 2
                        },
                        {
                            "image_url": "/images/hero/slide3.jpg",
                            "title": "Premium Quality",
                            "description": "Handcrafted with premium materials",
                            "link": "/about",
                            "order": 3
                        }
                    ]
                }',
                true
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM themes WHERE name = 'Default Theme'`);
    }
} 