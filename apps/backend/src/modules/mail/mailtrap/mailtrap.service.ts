import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { MailConfig } from '../entities/mail-config.entity';
import { MailLog } from '../entities/mail-log.entity';
import { MailResponse, MailServiceInterface, SendMailOptions } from '../interfaces/mail.interface';
import { MailStatus } from '../entities/mail-log.entity';

@Injectable()
export class MailtrapService implements MailServiceInterface {
  private transporter: any;
  private defaultFrom: string;
  private readonly logger = new Logger(MailtrapService.name);

  constructor(
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
    @InjectRepository(MailLog)
    private readonly mailLogRepository: Repository<MailLog>,
  ) {}

  private async initializeMailtrap(): Promise<void> {
    try {
      const mailtrapConfig = await this.mailConfigRepository.findOne({
        where: { code: 'MAILTRAP', isActive: true }
      });

      if (!mailtrapConfig || !mailtrapConfig.config) {
        throw new Error('Mailtrap configuration not found or inactive');
      }

      const { host, port, auth, from } = mailtrapConfig.config;

      if (!host || !port || !auth) {
        throw new Error('Invalid Mailtrap configuration');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth,
        secure: false,
      });

      this.defaultFrom = from || 'noreply@yourdomain.com';

      this.logger.debug('Mailtrap initialized with config:', {
        host,
        port,
        from: this.defaultFrom,
      });
    } catch (error) {
      this.logger.error(`Failed to initialize Mailtrap: ${error.message}`, error.stack);
      throw new Error('Failed to initialize mail service');
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeMailtrap();
      }
      
      // Verify SMTP connection configuration
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify Mailtrap configuration: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendMail(options: SendMailOptions): Promise<MailResponse> {
    let mailLog;
    try {
      if (!this.transporter) {
        await this.initializeMailtrap();
      }

      // Create mail log entry
      mailLog = this.mailLogRepository.create({
        fromEmail: options.from || this.defaultFrom,
        toEmail: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        body: options.html || options.text || '',
        templateId: options.template?.id,
        templateData: options.template?.data,
        status: MailStatus.PENDING,
      });

      await this.mailLogRepository.save(mailLog);

      // Prepare email data
      const mailData = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        ...(options.text && { text: options.text }),
        ...(options.html && { html: options.html }),
        ...(options.attachments && { attachments: options.attachments }),
      };

      // Send email using Nodemailer
      const response = await this.transporter.sendMail(mailData);

      // Update mail log with success status
      await this.mailLogRepository.update(mailLog.id, {
        status: MailStatus.SENT,
        providerMessageId: response.messageId,
      });

      return {
        success: true,
        messageId: response.messageId,
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