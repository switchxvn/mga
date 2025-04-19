import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailConfig } from './entities/mail-config.entity';
import { MailLog } from './entities/mail-log.entity';
import { MailTemplate } from './entities/mail-template.entity';
import { MailgunService } from './mailgun/mailgun.service';
import { MailtrapService } from './mailtrap/mailtrap.service';
import { MailService } from './services/mail.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([MailConfig, MailLog, MailTemplate]),
  ],
  providers: [
    MailgunService,
    MailtrapService,
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {} 