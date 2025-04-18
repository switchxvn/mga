import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailConfig } from './entities/mail-config.entity';
import { MailLog } from './entities/mail-log.entity';
import { MailgunService } from './mailgun/mailgun.service';
import { MailtrapService } from './mailtrap/mailtrap.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailConfig, MailLog]),
  ],
  providers: [
    MailgunService,
    MailtrapService,
    {
      provide: 'MAIL_SERVICE',
      useFactory: async (mailgunService: MailgunService, mailtrapService: MailtrapService) => {
        // Try Mailtrap first (for development)
        try {
          const isMailtrapValid = await mailtrapService.verifyConfiguration();
          if (isMailtrapValid) {
            return mailtrapService;
          }
        } catch (error) {
          console.log('Mailtrap configuration failed, trying Mailgun...');
        }

        // Try Mailgun as fallback
        try {
          const isMailgunValid = await mailgunService.verifyConfiguration();
          if (isMailgunValid) {
            return mailgunService;
          }
        } catch (error) {
          console.log('Mailgun configuration failed');
        }

        // Default to Mailtrap even if verification failed
        return mailtrapService;
      },
      inject: [MailgunService, MailtrapService],
    },
  ],
  exports: ['MAIL_SERVICE'],
})
export class MailModule {} 