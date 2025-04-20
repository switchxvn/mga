import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailLog, MailStatus } from '../entities/mail-log.entity';
import { MailConfig } from '../entities/mail-config.entity';
import { MailServiceInterface } from '../interfaces/mail.interface';
import { MailResponse, TemplateMailOptions } from '../types/mail.types';
import { Address as NodemailerAddress } from 'nodemailer/lib/mailer';

interface MailtrapConfig {
  apiToken: string;
  from: string;
  fromName: string;
}

interface MailtrapRecipient {
  email: string;
  name?: string;
}

interface MailtrapSendOptions {
  from: {
    email: string;
    name?: string;
  };
  to: MailtrapRecipient[];
  subject: string;
  text?: string;
  html?: string;
  category?: string;
}

interface ExtendedTemplateMailOptions extends TemplateMailOptions {
  category?: string;
}

@Injectable()
export class MailtrapService implements MailServiceInterface, OnModuleInit {
  private readonly apiEndpoint = 'https://send.api.mailtrap.io/api/send';
  private config: MailtrapConfig;

  constructor(
    private configService: ConfigService,
    @InjectRepository(MailLog)
    private mailLogRepository: Repository<MailLog>,
    @InjectRepository(MailConfig)
    private mailConfigRepository: Repository<MailConfig>,
  ) {}

  async onModuleInit() {
    const mailConfig = await this.mailConfigRepository.findOne({
      where: { code: 'MAILTRAP', isActive: true },
    });

    if (!mailConfig) {
      throw new Error('Mailtrap configuration not found or not active');
    }

    this.config = {
      apiToken: mailConfig.config.apiToken as string,
      from: mailConfig.config.from as string,
      fromName: mailConfig.config.fromName as string,
    };
  }

  private convertToMailtrapRecipient(recipient: string | NodemailerAddress): MailtrapRecipient {
    if (typeof recipient === 'string') {
      return { email: recipient };
    }
    return {
      email: recipient.address,
      name: recipient.name,
    };
  }

  async sendMail(options: ExtendedTemplateMailOptions): Promise<MailResponse> {
    try {
      const mailtrapOptions: MailtrapSendOptions = {
        from: {
          email: this.config.from,
          name: this.config.fromName,
        },
        to: Array.isArray(options.to)
          ? options.to.map(recipient => this.convertToMailtrapRecipient(recipient))
          : [this.convertToMailtrapRecipient(options.to)],
        subject: options.subject,
        text: options.text?.toString(),
        html: options.html?.toString(),
        category: options.category,
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailtrapOptions),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.message_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendOrderConfirmation(email: string, orderDetails: any): Promise<void> {
    const mailLogData = {
      fromEmail: this.config.from,
      toEmail: email,
      subject: 'Order Confirmation',
      body: `Thank you for your order! Order details: ${JSON.stringify(orderDetails)}`,
      status: MailStatus.PENDING,
    };
    
    const mailLog = await this.mailLogRepository.save(
      this.mailLogRepository.create(mailLogData)
    );

    const mailOptions: ExtendedTemplateMailOptions = {
      to: mailLog.toEmail,
      subject: mailLog.subject,
      text: mailLog.body,
      category: 'Order Confirmation',
    };

    try {
      const result = await this.sendMail(mailOptions);
      await this.mailLogRepository.update(mailLog.id, {
        status: MailStatus.SENT,
        providerMessageId: result.messageId,
      });
    } catch (error) {
      await this.mailLogRepository.update(mailLog.id, {
        status: MailStatus.FAILED,
        error: error.message,
      });
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    return !!this.config?.apiToken;
  }
} 