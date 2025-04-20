import { Injectable, Logger } from '@nestjs/common';
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
export class MailService implements MailServiceInterface {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>
  ) {}

  async sendMail(options: TemplateMailOptions): Promise<MailResponse> {
    const maxRetries = 3;
    let currentTry = 0;

    while (currentTry < maxRetries) {
      try {
        const mailConfig = await this.mailConfigRepository.findOne({
          where: { code: 'MAILTRAP', isActive: true }
        });

        if (!mailConfig) {
          this.logger.warn('No active mail configuration found. Skipping email send.');
          return {
            success: false,
            error: 'Mail service not configured',
          };
        }

        // Initialize transporter if not already initialized
        if (!this.transporter) {
          this.transporter = nodemailer.createTransport({
            host: mailConfig.config.host,
            port: mailConfig.config.port,
            secure: mailConfig.config.secure || false,
            auth: {
              user: mailConfig.config.auth?.user,
              pass: mailConfig.config.auth?.pass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
          });
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
        
        // Reset transporter on error to force re-initialization on next try
        this.transporter = null;
        
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
    try {
      const mailConfig = await this.mailConfigRepository.findOne({
        where: { code: 'MAILTRAP', isActive: true }
      });

      if (!mailConfig) {
        return false;
      }

      const tempTransporter = nodemailer.createTransport({
        host: mailConfig.config.host,
        port: mailConfig.config.port,
        secure: mailConfig.config.secure || false,
        auth: {
          user: mailConfig.config.auth?.user,
          pass: mailConfig.config.auth?.pass,
        }
      });

      await tempTransporter.verify();
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