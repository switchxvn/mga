import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMailtrapConfig1743270380309 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing Mailtrap config to new API structure
    await queryRunner.query(`
      UPDATE mail_config 
      SET config = jsonb_set(
        config,
        '{apiToken}',
        to_jsonb(config->'auth'->>'pass'),
        true
      )
      WHERE code = 'MAILTRAP';
    `);

    // Remove old SMTP fields
    await queryRunner.query(`
      UPDATE mail_config 
      SET config = config - 'auth' - 'port' - 'secure' - 'host'
      WHERE code = 'MAILTRAP';
    `);

    // Add new fields
    await queryRunner.query(`
      UPDATE mail_config 
      SET config = jsonb_set(
        config,
        '{fromName}',
        '"Ecommerce Web"',
        true
      )
      WHERE code = 'MAILTRAP';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore old SMTP structure
    await queryRunner.query(`
      UPDATE mail_config 
      SET config = jsonb_build_object(
        'host', 'sandbox.smtp.mailtrap.io',
        'port', 2525,
        'auth', jsonb_build_object(
          'user', config->>'apiToken',
          'pass', config->>'apiToken'
        ),
        'secure', false,
        'from', config->>'from'
      )
      WHERE code = 'MAILTRAP';
    `);
  }
} 