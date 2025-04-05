import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddGalleryTables1743270380251 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create galleries table
        await queryRunner.createTable(
            new Table({
                name: "galleries",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "image",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "sequence",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create gallery_translations table
        await queryRunner.createTable(
            new Table({
                name: "gallery_translations",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "gallery_id",
                        type: "int",
                    },
                    {
                        name: "locale",
                        type: "varchar",
                        length: "5",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add foreign key
        await queryRunner.createForeignKey(
            "gallery_translations",
            new TableForeignKey({
                columnNames: ["gallery_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "galleries",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("gallery_translations");
        await queryRunner.dropTable("galleries");
    }
} 