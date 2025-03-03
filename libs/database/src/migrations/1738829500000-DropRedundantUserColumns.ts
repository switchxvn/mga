import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropRedundantUserColumns1738829500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'name');
    await queryRunner.dropColumn('users', 'bio');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'bio',
        type: 'text',
        isNullable: true,
      })
    );
  }
} 