import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailServiceInterface } from '../interfaces/mail.interface';
import { TemplateMailOptions, MailResponse } from '../types/mail.types';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailConfig } from '../entities/mail-config.entity';
import { MailTemplate } from '../entities/mail-template.entity';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService implements MailServiceInterface, OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>
  ) {}

  async onModuleInit() {
    await this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      const mailConfig = await this.mailConfigRepository.findOne({
        where: { code: 'MAILTRAP', isActive: true }
      });

      if (!mailConfig) {
        this.logger.warn('No active mail configuration found. Email functionality will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: mailConfig.config.host,
        port: mailConfig.config.port,
        secure: mailConfig.config.secure || false,
        auth: {
          user: mailConfig.config.auth?.user,
          pass: mailConfig.config.auth?.pass,
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000, // 10 seconds
        socketTimeout: 10000, // 10 seconds
      });

      try {
        await this.transporter.verify();
        this.logger.log('SMTP connection verified successfully');
      } catch (error) {
        this.logger.warn('SMTP connection verification failed. Email functionality will be disabled:', error);
        this.transporter = null;
      }
    } catch (error) {
      this.logger.warn('Failed to initialize mail transporter. Email functionality will be disabled:', error);
    }
  }

  async sendMail(options: TemplateMailOptions): Promise<MailResponse> {
    if (!this.transporter) {
      this.logger.warn('Mail transporter not initialized. Skipping email send.');
      return {
        success: false,
        error: 'Mail service not configured',
      };
    }

    const maxRetries = 3;
    let currentTry = 0;

    while (currentTry < maxRetries) {
      try {
        const mailConfig = await this.mailConfigRepository.findOne({
          where: { code: 'MAILTRAP', isActive: true }
        });

        if (!mailConfig) {
          throw new Error('Mail configuration not found or not active');
        }

        // Use from address from config if not provided in options
        if (!options.from && mailConfig.config.from) {
          options.from = mailConfig.config.from;
        }

        // Handle template if provided
        if (options.template) {
          const template = await this.mailTemplateRepository.findOne({
            where: { code: options.template.id, is_active: true }
          });

          if (!template) {
            throw new Error(`Email template ${options.template.id} not found or not active`);
          }

          // Compile templates with Handlebars
          const subjectTemplate = Handlebars.compile(template.subject);
          const htmlTemplate = Handlebars.compile(template.html);

          // Apply data to templates
          options.subject = subjectTemplate(options.template.data);
          options.html = htmlTemplate(options.template.data);

          this.logger.debug('Compiled email template:', {
            subject: options.subject,
            templateId: options.template.id
          });
        }

        const info = await this.transporter.sendMail(options);
        this.logger.log('Email sent successfully:', {
          messageId: info.messageId,
          to: options.to
        });

        return {
          success: true,
          messageId: info.messageId,
        };
      } catch (error) {
        currentTry++;
        this.logger.error(`Error sending email (attempt ${currentTry}/${maxRetries}):`, {
          error: error.message,
          to: options.to,
          subject: options.subject
        });
        
        if (currentTry === maxRetries) {
          return {
            success: false,
            error: error.message,
          };
        }
        
        // Wait before retrying (exponential backoff)
        const retryDelay = Math.pow(2, currentTry) * 1000;
        this.logger.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    return {
      success: false,
      error: 'Maximum retry attempts reached',
    };
  }

  async verifyConfiguration(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error('Configuration verification failed:', error);
      return false;
    }
  }

  async sendOrderConfirmation(email: string, orderDetails: any): Promise<void> {
    const mailOptions: TemplateMailOptions = {
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order has been confirmed and is being processed.</p>
        <h2>Order Details:</h2>
        <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
      `,
    };

    await this.sendMail(mailOptions);
  }
} 