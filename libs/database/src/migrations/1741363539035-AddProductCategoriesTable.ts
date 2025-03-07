import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddProductCategoriesTable1741363539035 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng product_categories
        await queryRunner.createTable(
            new Table({
                name: "product_categories",
                columns: [
                    {
                        name: "product_id",
                        type: "int",
                        isPrimary: true,
                    },
                    {
                        name: "category_id",
                        type: "int",
                        isPrimary: true,
                    }
                ]
            }),
            true
        );

        // Tạo foreign key cho product_id
        await queryRunner.createForeignKey(
            "product_categories",
            new TableForeignKey({
                columnNames: ["product_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            })
        );

        // Tạo foreign key cho category_id
        await queryRunner.createForeignKey(
            "product_categories",
            new TableForeignKey({
                columnNames: ["category_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "categories",
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa các foreign key trước
        const table = await queryRunner.getTable("product_categories");
        if (table) {
            const foreignKeys = table.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("product_categories", foreignKey);
            }
        }
        
        // Xóa bảng
        await queryRunner.dropTable("product_categories");
    }

}
