export interface PayOSWebhookData {
  id: string;
  code: string;
  desc: string;
  clientId: string;
  time: number;
  cancelTime: number;
  status: number;
  amount: number;
  virtualAccount: VirtualAccount;
  items: WebhookItem[];
  description: string;
  reference: {
    orderId: string;
    transactionId: string;
  };
  signature: string;
}

export interface VirtualAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  qrCode: string;
  bankId: string;
  bankName: string;
}

export interface WebhookItem {
  name: string;
  quantity: number;
  price: number;
} 