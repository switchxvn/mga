import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'Item ID' })
  id: number;

  @ApiProperty({ description: 'Product ID' })
  productId: number;

  @ApiProperty({ description: 'Product title' })
  title: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  unitPrice: number;

  @ApiProperty({ description: 'Total price' })
  totalPrice: number;

  @ApiProperty({ description: 'Is used', required: false })
  isUsed?: boolean;

  @ApiProperty({ description: 'QR code', required: false })
  qrCode?: string;

  @ApiProperty({ description: 'QR code image URL', required: false })
  qrCodeImageUrl?: string;

  @ApiProperty({ description: 'Travel date', required: false })
  travelDate?: string;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: number;

  @ApiProperty({ description: 'Order code' })
  orderCode: string;

  @ApiProperty({ description: 'Customer name' })
  customerName: string;

  @ApiProperty({ description: 'Customer email' })
  email: string;

  @ApiProperty({ description: 'Customer phone' })
  phone: string;

  @ApiProperty({ description: 'Order status', enum: ['pending', 'confirmed', 'cancelled', 'processing', 'shipped', 'delivered'] })
  status: string;

  @ApiProperty({ description: 'Payment status', enum: ['pending', 'paid', 'failed'] })
  paymentStatus: string;

  @ApiProperty({ description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Return URL', required: false })
  returnUrl?: string;

  @ApiProperty({ description: 'Payment URL', required: false })
  paymentUrl?: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
} 