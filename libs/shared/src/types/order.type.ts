export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed'
}

export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  TICKET = 'TICKET'
}

export interface Address {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productType: ProductType;
  isUsed: boolean;
  productCode?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId?: string;
  phoneCode: string;
  phoneNumber: string;
  email?: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  userId?: string;
  phoneCode: string;
  phoneNumber: string;
  email?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod: string;
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productType: ProductType;
  }>;
  totalAmount: number;
}

export interface UpdateOrderStatusInput {
  id: number;
  status: OrderStatus;
}

export interface UpdatePaymentStatusInput {
  id: number;
  paymentStatus: PaymentStatus;
}

export interface OrdersQueryInput {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export interface OrdersQueryResult {
  items: Order[];
  total: number;
} 