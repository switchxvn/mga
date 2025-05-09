import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTravelDateToOrderItem1745000000012 implements MigrationInterface {
  name = 'AddTravelDateToOrderItem1745000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order_items',
      new TableColumn({
        name: 'travel_date',
        type: 'timestamp',
        isNullable: true,
        comment: 'Ngày đi dành cho vé tham quan'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('order_items', 'travel_date');
  }
} 