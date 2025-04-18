import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailConfig } from '../../../../apps/backend/src/modules/mail/entities/mail-config.entity';

@Injectable()
export class MailConfigSeeder {
  private readonly logger = new Logger(MailConfigSeeder.name);

  constructor(
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting mail configuration seeding...');

    try {
      // Define mail service configurations
      const mailConfigs = [
        {
          name: 'Mailgun',
          code: 'MAILGUN',
          config: {
            apiKey: 'key-xxxxxxxxxxxxxxxxxxxx',
            domain: 'mg.yourdomain.com',
            from: 'noreply@yourdomain.com',
            host: 'https://api.mailgun.net',
            region: 'us'
          },
          is_active: false // Set to false by default
        },
        {
          name: 'Mailtrap',
          code: 'MAILTRAP',
          config: {
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
              user: 'your_mailtrap_user',
              pass: 'your_mailtrap_password'
            },
            from: 'noreply@yourdomain.com',
            secure: false
          },
          is_active: true // Set Mailtrap as default active provider for development
        }
      ];

      for (const config of mailConfigs) {
        // Check if configuration exists
        const existingConfig = await this.mailConfigRepository.findOne({
          where: { code: config.code }
        });

        if (existingConfig) {
          this.logger.log(`Mail configuration for ${config.code} already exists, skipping...`);
          continue;
        }

        // Save the configuration
        const savedConfig = await this.mailConfigRepository.save(config);
        this.logger.log(`Created mail configuration for ${savedConfig.code} with ID: ${savedConfig.id}`);
      }

      this.logger.log('Mail configurations seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding mail configurations: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
} 