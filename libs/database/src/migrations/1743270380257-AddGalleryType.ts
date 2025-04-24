import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddGalleryType1743270380257 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'galleries',
            new TableColumn({
                name: 'type',
                type: 'varchar',
                length: '50',
                default: "'common'",
                isNullable: false,
            })
        );

        // Update existing records to have type = 'common'
        await queryRunner.query(`
            UPDATE galleries 
            SET type = 'common' 
            WHERE type IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('galleries', 'type');
    }
} 