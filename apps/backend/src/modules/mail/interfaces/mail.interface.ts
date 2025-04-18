export interface SendMailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  template?: {
    id: string;
    data: Record<string, any>;
  };
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface MailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MailServiceInterface {
  sendMail(options: SendMailOptions): Promise<MailResponse>;
  verifyConfiguration(): Promise<boolean>;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  host?: string;
  from?: string;
  region?: string;
} 