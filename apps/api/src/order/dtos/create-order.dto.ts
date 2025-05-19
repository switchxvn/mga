import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ description: 'Ticket ID' })
  @IsNotEmpty()
  @IsNumber()
  ticketId: number;

  @ApiProperty({ description: 'Variant ID', required: false })
  @IsOptional()
  @IsNumber()
  variantId?: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ description: 'Selected date for ticket', example: '2024-07-01', required: false })
  @IsOptional()
  @IsString()
  selectedDate?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer name' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Customer email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer phone' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Payment method code', example: 'PAYOS' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Return URL after payment', required: false })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 