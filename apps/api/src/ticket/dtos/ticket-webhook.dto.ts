import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class TicketUpdateItemDto {
  @ApiProperty({ description: 'Ticket ID' })
  @IsNotEmpty()
  @IsNumber()
  ticketId: number;

  @ApiProperty({ description: 'Available quantity' })
  @IsNotEmpty()
  @IsNumber()
  availableQuantity: number;

  @ApiProperty({ description: 'Valid from date', required: false })
  @IsOptional()
  @IsString()
  validFrom?: string;

  @ApiProperty({ description: 'Valid until date', required: false })
  @IsOptional()
  @IsString()
  validUntil?: string;

  @ApiProperty({ description: 'Is ticket available', default: true, required: false })
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Price', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'Sale price', required: false })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class TicketWebhookDto {
  @ApiProperty({ description: 'Event type', example: 'ticket.update' })
  @IsNotEmpty()
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'Timestamp' })
  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @ApiProperty({ description: 'Ticket data', type: [TicketUpdateItemDto] })
  @IsNotEmpty()
  @IsArray()
  data: TicketUpdateItemDto[];

  @ApiProperty({ description: 'Webhook signature for verification' })
  @IsNotEmpty()
  @IsString()
  signature: string;
} 