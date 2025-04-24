import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTimestampsToGalleryTranslations1743270380254 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("gallery_translations", [
            new TableColumn({
                name: "created_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP"
            }),
            new TableColumn({
                name: "updated_at",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP"
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("gallery_translations", [
            "created_at",
            "updated_at"
        ]);
    }
} 