import { TemplateMailOptions, MailResponse } from '../types/mail.types';

export interface MailServiceInterface {
  sendMail(options: TemplateMailOptions): Promise<MailResponse>;
  verifyConfiguration(): Promise<boolean>;
  sendOrderConfirmation(email: string, orderDetails: any): Promise<void>;
  sendRefundRequestNotification(data: {
    to: string;
    orderCode: string;
    refundCode: string;
    customerName: string;
    refundType: string;
    refundAmount?: number;
    items?: Array<{
      productName: string;
      variantName?: string;
      quantity: number;
      oldDate?: string;
      newDate?: string;
    }>;
  }): Promise<MailResponse>;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  host?: string;
  from?: string;
  region?: string;
} 