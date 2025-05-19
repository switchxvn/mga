import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class OrderActionDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class OrderConfirmDto extends OrderActionDto {
  @ApiProperty({ description: 'Transaction ID from payment gateway', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ description: 'Payment reference', required: false })
  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class OrderCancelDto extends OrderActionDto {
  @ApiProperty({ description: 'Cancellation reason', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
} 