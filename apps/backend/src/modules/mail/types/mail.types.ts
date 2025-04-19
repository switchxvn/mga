import { SendMailOptions as NodemailerOptions } from 'nodemailer';

export interface MailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TemplateMailOptions extends NodemailerOptions {
  template?: {
    id: string;
    data: Record<string, any>;
  };
} 