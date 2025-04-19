declare module 'mailgun.js' {
  import FormData from 'form-data';

  interface MailgunClientOptions {
    username: string;
    key: string;
    url?: string;
    public_key?: string;
    timeout?: number;
  }

  interface MailgunClient {
    messages: {
      create(domain: string, data: any): Promise<{ id: string }>;
    };
    domains: {
      get(domain: string): Promise<any>;
    };
  }

  class Mailgun {
    constructor(formData: typeof FormData);
    client(options: MailgunClientOptions): MailgunClient;
  }

  export default Mailgun;
} 