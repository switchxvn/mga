import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Address } from 'nodemailer/lib/mailer';
import { Readable } from 'stream';
import { MailConfig } from '../entities/mail-config.entity';
import { MailLog } from '../entities/mail-log.entity';
import { MailServiceInterface } from '../interfaces/mail.interface';
import { MailResponse, TemplateMailOptions } from '../types/mail.types';
import { MailStatus } from '../entities/mail-log.entity';

@Injectable()
export class GmailService implements MailServiceInterface {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;
  private readonly logger = new Logger(GmailService.name);

  constructor(
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
    @InjectRepository(MailLog)
    private readonly mailLogRepository: Repository<MailLog>,
  ) {}

  private getEmailString(email: string | Address | (string | Address)[]): string {
    if (Array.isArray(email)) {
      return email.map(e => typeof e === 'string' ? e : e.address).join(', ');
    }
    return typeof email === 'string' ? email : email.address;
  }

  private getContentString(content: any): string {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Buffer.isBuffer(content)) return content.toString('utf-8');
    if (content instanceof Readable) return '';
    return String(content);
  }

  private async initializeGmail(): Promise<void> {
    try {
      const gmailConfig = await this.mailConfigRepository.findOne({
        where: { code: 'GMAIL', isActive: true }
      });

      if (!gmailConfig || !gmailConfig.config) {
        throw new Error('Gmail configuration not found or inactive');
      }

      const { host, port, auth, from, secure } = gmailConfig.config;

      if (!host || !port || !auth) {
        throw new Error('Invalid Gmail configuration');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth,
        secure: secure || true,
      });

      this.defaultFrom = from || auth.user;

      this.logger.debug('Gmail SMTP initialized with config:', {
        host,
        port,
        from: this.defaultFrom,
      });
    } catch (error) {
      this.logger.error(`Failed to initialize Gmail SMTP: ${error.message}`, error.stack);
      throw new Error('Failed to initialize mail service');
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeGmail();
      }
      
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify Gmail SMTP configuration: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendMail(options: TemplateMailOptions): Promise<MailResponse> {
    let mailLog;
    try {
      if (!this.transporter) {
        await this.initializeGmail();
      }

      const mailLogData: DeepPartial<MailLog> = {
        fromEmail: this.getEmailString(options.from || this.defaultFrom),
        toEmail: this.getEmailString(options.to),
        subject: options.subject,
        body: this.getContentString(options.html) || this.getContentString(options.text) || '',
        templateId: options.template?.id,
        templateData: options.template?.data,
        status: MailStatus.PENDING,
      };

      mailLog = await this.mailLogRepository.save(
        this.mailLogRepository.create(mailLogData)
      );

      const mailData = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        ...(options.text && { text: options.text }),
        ...(options.html && { html: options.html }),
        ...(options.attachments && { attachments: options.attachments }),
      };

      const response = await this.transporter.sendMail(mailData);

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

  async sendOrderConfirmation(email: string, orderDetails: any): Promise<void> {
    if (!this.transporter) {
      await this.initializeGmail();
    }

    const mailOptions: TemplateMailOptions = {
      to: email,
      subject: 'Order Confirmation',
      text: `Thank you for your order! Order details: ${JSON.stringify(orderDetails)}`,
    };

    await this.sendMail(mailOptions);
  }
} 