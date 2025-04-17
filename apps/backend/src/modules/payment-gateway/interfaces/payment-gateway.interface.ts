export interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreatePaymentRequest {
  order_id: string;
  amount: number;
  description?: string;
  return_url: string;
  cancel_url: string;
  // Optional buyer information for e-invoice integration
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_address?: string;
  // Optional items information
  items?: PaymentItem[];
}

export interface PaymentResponse {
  payment_url: string;
  qr_code: string;
  metadata: Record<string, string>;
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
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  expiredAt: number;
  checkoutUrl: string;
  qrCode: string;
}

export interface PaymentGatewayInterface {
  createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  verifyPayment(webhookData: any, signature: string): Promise<boolean>;
} 