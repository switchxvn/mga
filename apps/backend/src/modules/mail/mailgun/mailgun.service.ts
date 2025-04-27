import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { MailConfig } from '../entities/mail-config.entity';
import { MailLog } from '../entities/mail-log.entity';
import { MailServiceInterface } from '../interfaces/mail.interface';
import { MailResponse, TemplateMailOptions } from '../types/mail.types';
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

  private getEmailString(email: any): string {
    if (Array.isArray(email)) {
      return email.map(e => typeof e === 'string' ? e : e.address).join(', ');
    }
    return typeof email === 'string' ? email : email.address;
  }

  private getContentString(content: any): string {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Buffer.isBuffer(content)) return content.toString('utf-8');
    return String(content);
  }

  private async initializeMailgun(): Promise<void> {
    try {
      const mailgunConfig = await this.mailConfigRepository.findOne({
        where: { code: 'MAILGUN', isActive: true }
      });

      if (!mailgunConfig || !mailgunConfig.config) {
        throw new Error('Mailgun configuration not found or inactive');
      }

      const { apiKey, domain, host, from } = mailgunConfig.config;

      if (!apiKey || !domain) {
        throw new Error('Invalid Mailgun configuration');
      }

      const mg = new Mailgun(FormData as any);
      this.mailgun = mg.client({ username: 'api', key: apiKey, url: host });
      this.domain = domain;
      this.defaultFrom = from || `noreply@${domain}`;

      this.logger.debug('Mailgun initialized with config:', {
        domain: this.domain,
        from: this.defaultFrom,
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
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify Mailgun configuration: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendMail(options: TemplateMailOptions): Promise<MailResponse> {
    let currentMailLog: MailLog | null = null;
    try {
      if (!this.mailgun) {
        await this.initializeMailgun();
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

      currentMailLog = await this.mailLogRepository.save(
        this.mailLogRepository.create(mailLogData)
      );

      const mailData = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        ...(options.text && { text: options.text }),
        ...(options.html && { html: options.html }),
        ...(options.attachments && { attachment: options.attachments }),
      };

      const response = await this.mailgun.messages.create(this.domain, mailData);

      await this.mailLogRepository.update(currentMailLog.id, {
        status: MailStatus.SENT,
        providerMessageId: response.id,
      });

      return {
        success: true,
        messageId: response.id,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      if (currentMailLog) {
        await this.mailLogRepository.update(currentMailLog.id, {
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
    await this.sendMail({
      to: email,
      template: { id: 'order-confirmation', data: orderDetails },
      subject: 'Xác nhận đơn hàng'
    });
  }

  async sendRefundRequestNotification(data: {
    to: string;
    orderCode: string;
    refundCode: string;
    customerName: string;
    refundType: string;
    refundAmount?: number;
  }): Promise<MailResponse> {
    const templateData = {
      customerName: data.customerName,
      orderCode: data.orderCode,
      refundCode: data.refundCode,
      refundType: data.refundType,
      refundAmount: data.refundAmount
    };
    
    return this.sendMail({
      to: data.to,
      template: { id: 'refund-request', data: templateData },
      subject: `Xác nhận yêu cầu hoàn trả #${data.refundCode}`
    });
  }
} 