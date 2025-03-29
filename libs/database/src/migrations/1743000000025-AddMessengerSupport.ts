import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessengerSupport1743000000025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO settings (key, value, is_public, description, "group")
      VALUES (
        'messenger_support',
        'https://m.me/your-page-id',
        true,
        'Facebook Messenger support link',
        'social'
      )
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          is_public = EXCLUDED.is_public,
          description = EXCLUDED.description,
          "group" = EXCLUDED."group";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM settings
      WHERE key = 'messenger_support';
    `);
  }
} 