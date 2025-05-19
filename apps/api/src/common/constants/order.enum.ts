/**
 * Trạng thái đơn hàng
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

/**
 * Trạng thái thanh toán
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

/**
 * Loại sản phẩm
 */
export enum ProductType {
  REGULAR = 'REGULAR',
  TICKET = 'TICKET',
  SERVICE = 'SERVICE',
  DIGITAL = 'DIGITAL',
}
 