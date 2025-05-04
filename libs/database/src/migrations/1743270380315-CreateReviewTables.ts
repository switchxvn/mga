import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateReviewTables1743270380315 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create reviews table
        await queryRunner.createTable(
            new Table({
                name: 'reviews',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'author_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'author_avatar',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'rating',
                        type: 'int',
                        isNullable: false,
                        default: 5,
                    },
                    {
                        name: 'service_type',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                    },
                    {
                        name: 'visit_date',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'featured',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Create reviews_translations table
        await queryRunner.createTable(
            new Table({
                name: 'review_translations',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'review_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'locale',
                        type: 'varchar',
                        length: '5',
                        isNullable: false,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'content',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Add foreign key constraints
        await queryRunner.createForeignKey(
            'review_translations',
            new TableForeignKey({
                columnNames: ['review_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'reviews',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const table = await queryRunner.getTable('review_translations');
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('review_id') !== -1
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey('review_translations', foreignKey);
            }
        }

        // Drop tables
        await queryRunner.dropTable('review_translations');
        await queryRunner.dropTable('reviews');
    }
} 