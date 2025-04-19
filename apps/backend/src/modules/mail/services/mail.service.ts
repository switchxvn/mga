import { Injectable, OnModuleInit } from '@nestjs/common';
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
  private transporter: nodemailer.Transporter;

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
    const mailConfig = await this.mailConfigRepository.findOne({
      where: { code: 'GMAIL', isActive: true }
    });

    if (!mailConfig) {
      throw new Error('Gmail configuration not found or not active');
    }

    this.transporter = nodemailer.createTransport({
      host: mailConfig.config.host,
      port: mailConfig.config.port,
      secure: mailConfig.config.secure,
      auth: {
        user: mailConfig.config.auth?.user,
        pass: mailConfig.config.auth?.pass,
      },
    });
  }

  async sendMail(options: TemplateMailOptions): Promise<MailResponse> {
    try {
      const mailConfig = await this.mailConfigRepository.findOne({
        where: { code: 'GMAIL', isActive: true }
      });

      if (!mailConfig) {
        throw new Error('Gmail configuration not found or not active');
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

        console.log('Compiled email template:', {
          subject: options.subject,
          data: options.template.data
        });
      }

      const info = await this.transporter.sendMail(options);
      console.log('Email sent successfully:', info);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
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