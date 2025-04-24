import { TemplateMailOptions, MailResponse } from '../types/mail.types';

export interface MailServiceInterface {
  sendMail(options: TemplateMailOptions): Promise<MailResponse>;
  verifyConfiguration(): Promise<boolean>;
  sendOrderConfirmation(email: string, orderDetails: any): Promise<void>;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  host?: string;
  from?: string;
  region?: string;
} 