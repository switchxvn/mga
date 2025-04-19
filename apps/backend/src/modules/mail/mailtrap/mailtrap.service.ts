import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailLog, MailStatus } from '../entities/mail-log.entity';
import { MailServiceInterface } from '../interfaces/mail.interface';
import { MailResponse } from '../types/mail.types';
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';

@Injectable()
export class MailtrapService implements MailServiceInterface {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectRepository(MailLog)
    private mailLogRepository: Repository<MailLog>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      auth: {
        user: this.configService.get<string>('MAIL_USERNAME'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<MailResponse> {
    try {
      const info = await this.transporter.sendMail(options);
      return {
        success: true,
        messageId: info.messageId,
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
      fromEmail: this.configService.get<string>('MAIL_FROM_ADDRESS'),
      toEmail: email,
      subject: 'Order Confirmation',
      body: `Thank you for your order! Order details: ${JSON.stringify(orderDetails)}`,
      status: MailStatus.PENDING,
    };
    
    const mailLog = await this.mailLogRepository.save(
      this.mailLogRepository.create(mailLogData)
    );

    const mailOptions: SendMailOptions = {
      from: mailLog.fromEmail,
      to: mailLog.toEmail,
      subject: mailLog.subject,
      text: mailLog.body,
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
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
} 