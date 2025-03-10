import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDefaultThemeWithColors1741615987490 implements MigrationInterface {
    name = 'UpdateDefaultThemeWithColors1741615987490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update the default theme with colors and homepage layout
        await queryRunner.query(`
            UPDATE themes 
            SET 
                colors = '{
                    "primary": {
                        "50": "#f8fafc",
                        "100": "#f1f5f9",
                        "200": "#e2e8f0",
                        "300": "#cbd5e1",
                        "400": "#94a3b8",
                        "500": "#64748b",
                        "600": "#475569",
                        "700": "#334155",
                        "800": "#1e293b",
                        "900": "#0f172a",
                        "950": "#020617"
                    },
                    "secondary": {
                        "50": "#fdf4ff",
                        "100": "#fae8ff",
                        "200": "#f5d0fe",
                        "300": "#f0abfc",
                        "400": "#e879f9",
                        "500": "#d946ef",
                        "600": "#c026d3",
                        "700": "#a21caf",
                        "800": "#86198f",
                        "900": "#701a75",
                        "950": "#4a044e"
                    },
                    "success": {
                        "50": "#f0fdf4",
                        "100": "#dcfce7",
                        "200": "#bbf7d0",
                        "300": "#86efac",
                        "400": "#4ade80",
                        "500": "#22c55e",
                        "600": "#16a34a",
                        "700": "#15803d",
                        "800": "#166534",
                        "900": "#14532d",
                        "950": "#052e16"
                    },
                    "error": {
                        "50": "#fef2f2",
                        "100": "#fee2e2",
                        "200": "#fecaca",
                        "300": "#fca5a5",
                        "400": "#f87171",
                        "500": "#ef4444",
                        "600": "#dc2626",
                        "700": "#b91c1c",
                        "800": "#991b1b",
                        "900": "#7f1d1d",
                        "950": "#450a0a"
                    },
                    "warning": {
                        "50": "#fffbeb",
                        "100": "#fef3c7",
                        "200": "#fde68a",
                        "300": "#fcd34d",
                        "400": "#fbbf24",
                        "500": "#f59e0b",
                        "600": "#d97706",
                        "700": "#b45309",
                        "800": "#92400e",
                        "900": "#78350f",
                        "950": "#451a03"
                    },
                    "info": {
                        "50": "#eff6ff",
                        "100": "#dbeafe",
                        "200": "#bfdbfe",
                        "300": "#93c5fd",
                        "400": "#60a5fa",
                        "500": "#3b82f6",
                        "600": "#2563eb",
                        "700": "#1d4ed8",
                        "800": "#1e40af",
                        "900": "#1e3a8a",
                        "950": "#172554"
                    }
                }'::jsonb,
                homepage_layout = '{
                    "sections": [
                        {
                            "id": "hero",
                            "type": "hero",
                            "settings": {
                                "height": "600px",
                                "layout": "split",
                                "sliderPosition": "right",
                                "videoPosition": "left",
                                "sliderWidth": "70%",
                                "videoWidth": "30%",
                                "autoplay": true,
                                "interval": 5000,
                                "showDots": true,
                                "showArrows": true
                            }
                        },
                        {
                            "id": "featured-categories",
                            "type": "categories",
                            "settings": {
                                "title": "Danh Mục Nổi Bật",
                                "layout": "grid",
                                "columns": 4,
                                "showDescription": true,
                                "maxItems": 8
                            }
                        },
                        {
                            "id": "new-products",
                            "type": "products",
                            "settings": {
                                "title": "Sản Phẩm Mới",
                                "layout": "slider",
                                "itemsPerView": 4,
                                "autoplay": true,
                                "interval": 3000,
                                "showPrice": true,
                                "showRating": true,
                                "maxItems": 12
                            }
                        },
                        {
                            "id": "featured-products",
                            "type": "products",
                            "settings": {
                                "title": "Sản Phẩm Nổi Bật",
                                "layout": "grid",
                                "columns": 4,
                                "showPrice": true,
                                "showRating": true,
                                "maxItems": 8
                            }
                        }
                    ]
                }'::jsonb
            WHERE name = 'Default Theme'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reset colors and homepage_layout to null for the default theme
        await queryRunner.query(`
            UPDATE themes 
            SET 
                colors = NULL,
                homepage_layout = NULL
            WHERE name = 'Default Theme'
        `);
    }
} 