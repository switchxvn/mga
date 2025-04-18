import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as FormData from 'form-data';
import * as Mailgun from 'mailgun.js';
import { MailConfig } from '../entities/mail-config.entity';
import { MailLog } from '../entities/mail-log.entity';
import { MailResponse, MailServiceInterface, SendMailOptions } from '../interfaces/mail.interface';
import { MailStatus } from '../entities/mail-log.entity';

@Injectable()
export class MailgunService implements MailServiceInterface {
  private mailgun: any;
  private domain: string;
  private defaultFrom: string;
  private readonly logger = new Logger(MailgunService.name);

  constructor(
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
    @InjectRepository(MailLog)
    private readonly mailLogRepository: Repository<MailLog>,
  ) {}

  private async initializeMailgun(): Promise<void> {
    try {
      const mailgunConfig = await this.mailConfigRepository.findOne({
        where: { code: 'MAILGUN', isActive: true }
      });

      if (!mailgunConfig || !mailgunConfig.config) {
        throw new Error('Mailgun configuration not found or inactive');
      }

      const { apiKey, domain, host, from, region } = mailgunConfig.config;

      if (!apiKey || !domain) {
        throw new Error('Invalid Mailgun configuration');
      }

      const mailgun = new Mailgun(FormData);
      this.mailgun = mailgun.client({
        username: 'api',
        key: apiKey,
        url: host || 'https://api.mailgun.net',
        ...(region && { region }),
      });

      this.domain = domain;
      this.defaultFrom = from || `noreply@${domain}`;

      this.logger.debug('Mailgun initialized with config:', {
        domain,
        host: host || 'https://api.mailgun.net',
        region: region || 'default',
      });
    } catch (error) {
      this.logger.error(`Failed to initialize Mailgun: ${error.message}`, error.stack);
      throw new Error('Failed to initialize mail service');
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      if (!this.mailgun) {
        await this.initializeMailgun();
      }
      
      // Try to get domain info as a verification
      await this.mailgun.domains.get(this.domain);
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify Mailgun configuration: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendMail(options: SendMailOptions): Promise<MailResponse> {
    try {
      if (!this.mailgun) {
        await this.initializeMailgun();
      }

      const mailLog = this.mailLogRepository.create({
        fromEmail: options.from || this.defaultFrom,
        toEmail: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        body: options.html || options.text || '',
        templateId: options.template?.id,
        templateData: options.template?.data,
        status: MailStatus.PENDING,
      });

      await this.mailLogRepository.save(mailLog);

      const mailData = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        ...(options.text && { text: options.text }),
        ...(options.html && { html: options.html }),
        ...(options.template && {
          template: options.template.id,
          'h:X-Mailgun-Variables': JSON.stringify(options.template.data),
        }),
      };

      if (options.attachments?.length) {
        mailData['attachment'] = options.attachments.map(attachment => ({
          data: attachment.content,
          filename: attachment.filename,
          contentType: attachment.contentType,
        }));
      }

      const response = await this.mailgun.messages.create(this.domain, mailData);

      // Update mail log with success status
      await this.mailLogRepository.update(mailLog.id, {
        status: MailStatus.SENT,
        providerMessageId: response.id,
      });

      return {
        success: true,
        messageId: response.id,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      // Update mail log with error status
      if (mailLog) {
        await this.mailLogRepository.update(mailLog.id, {
          status: MailStatus.FAILED,
          error: error.message,
        });
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }
} 