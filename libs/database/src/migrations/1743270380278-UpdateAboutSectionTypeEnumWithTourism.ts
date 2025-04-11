import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAboutSectionTypeEnumWithTourism1743270380278 implements MigrationInterface {
    name = 'UpdateAboutSectionTypeEnumWithTourism1743270380278';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE about_section_type_enum ADD VALUE IF NOT EXISTS 'tourism_hero';
            ALTER TYPE about_section_type_enum ADD VALUE IF NOT EXISTS 'tourism_features';
            ALTER TYPE about_section_type_enum ADD VALUE IF NOT EXISTS 'tourism_cultural';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing values from enums
        // We can only create a new enum type without the value and update the column to use it
        // For simplicity and safety, we'll leave the enum values in place during rollback
    }
} 