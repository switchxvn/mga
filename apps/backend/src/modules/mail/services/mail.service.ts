import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailServiceInterface } from '../interfaces/mail.interface';
import { TemplateMailOptions, MailResponse } from '../types/mail.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailConfig } from '../entities/mail-config.entity';
import { MailTemplate } from '../entities/mail-template.entity';
import * as Handlebars from 'handlebars';
import { MAIL_SERVICE } from '../mail.constants';

@Injectable()
export class MailService implements MailServiceInterface {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>,
    @Inject(MAIL_SERVICE) private readonly mailProvider: MailServiceInterface
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

        const result = await this.mailProvider.sendMail(options);
        
        if (result.success) {
          this.logger.log('Email sent successfully:', {
            messageId: result.messageId,
            to: options.to
          });
          return result;
        }

        throw new Error(result.error || 'Unknown error occurred');
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
      error: 'Max retries exceeded',
    };
  }

  async verifyConfiguration(): Promise<boolean> {
    return this.mailProvider.verifyConfiguration();
  }

  async sendOrderConfirmation(email: string, orderDetails: any): Promise<void> {
    return this.mailProvider.sendOrderConfirmation(email, orderDetails);
  }
} 