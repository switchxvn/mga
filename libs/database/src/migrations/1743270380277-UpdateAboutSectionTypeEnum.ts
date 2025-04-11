import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAboutSectionTypeEnum1743270380277 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE about_section_type_enum ADD VALUE IF NOT EXISTS 'features';
      ALTER TYPE about_section_type_enum ADD VALUE IF NOT EXISTS 'cultural';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing values from enums
    // We can only create a new enum type without the value and update the column to use it
    // For simplicity and safety, we'll leave the enum value in place during rollback
  }
} 