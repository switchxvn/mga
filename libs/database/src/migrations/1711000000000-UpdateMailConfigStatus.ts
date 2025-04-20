import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMailConfigStatus1711000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Disable Gmail
    await queryRunner.query(`
      UPDATE mail_config 
      SET is_active = false 
      WHERE code = 'GMAIL'
    `);

    // Enable Mailtrap
    await queryRunner.query(`
      UPDATE mail_config 
      SET is_active = true 
      WHERE code = 'MAILTRAP'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
    await queryRunner.query(`
      UPDATE mail_config 
      SET is_active = true 
      WHERE code = 'GMAIL'
    `);

    await queryRunner.query(`
      UPDATE mail_config 
      SET is_active = false 
      WHERE code = 'MAILTRAP'
    `);
  }
} 