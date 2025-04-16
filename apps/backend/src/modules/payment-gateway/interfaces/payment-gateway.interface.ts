export interface CreatePaymentRequest {
  order_id: string;
  amount: number;
  description?: string;
  return_url: string;
  cancel_url: string;
}

export interface PaymentResponse {
  payment_url?: string;
  qr_code?: string;
  metadata?: Record<string, any>;
}

export interface PayOSWebhookData {
  data: {
    payment: {
      status: string;
      orderCode: string;
      amount: string;
      description?: string;
      createdAt: string;
    };
  };
}

export interface PayOSPaymentLinkResponse {
  code: number;
  desc: string;
  data: {
    checkoutUrl: string;
    qrCode: string;
    orderCode: string;
    status: string;
    amount: string;
    description: string;
  };
}

export interface PaymentGatewayInterface {
  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  verifyPayment(webhookData: any, signature: string): Promise<boolean>;
} 