import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddProductSnapshotToOrderItem1743270380301 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'order_items',
            new TableColumn({
                name: 'product_snapshot',
                type: 'jsonb',
                isNullable: true,
                comment: 'Snapshot of product data including variant and translations at the time of order'
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order_items', 'product_snapshot');
    }
} 