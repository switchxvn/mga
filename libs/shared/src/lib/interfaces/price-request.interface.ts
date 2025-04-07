export enum PriceRequestStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface PriceRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
  productId: number;
  productName: string;
  status: PriceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
} 