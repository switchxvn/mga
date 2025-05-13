export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed'
}

export enum OrderType {
  STANDARD = 'standard',
  TICKET = 'ticket'
}

export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  TICKET = 'TICKET'
}

export enum RefundReason {
  CHANGE_MIND = 'CHANGE_MIND',
  PRODUCT_DEFECT = 'PRODUCT_DEFECT',
  WRONG_PRODUCT = 'WRONG_PRODUCT',
  SCHEDULE_CHANGE = 'SCHEDULE_CHANGE',
  OTHER = 'OTHER',
}

export enum RefundType {
  MONEY_REFUND = 'MONEY_REFUND',
  RESCHEDULE = 'RESCHEDULE',
  PRODUCT_EXCHANGE = 'PRODUCT_EXCHANGE',
  STORE_CREDIT = 'STORE_CREDIT',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  travelDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId?: string;
  orderCode: string;
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
    travelDate?: Date;
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