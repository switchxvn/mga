import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailConfig } from './entities/mail-config.entity';
import { MailLog } from './entities/mail-log.entity';
import { MailTemplate } from './entities/mail-template.entity';
import { MailtrapService } from './mailtrap/mailtrap.service';
import { MailService } from './services/mail.service';
import { MAIL_SERVICE } from './mail.constants';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([MailConfig, MailLog, MailTemplate]),
  ],
  providers: [
    {
      provide: MAIL_SERVICE,
      useClass: MailtrapService,
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {} 