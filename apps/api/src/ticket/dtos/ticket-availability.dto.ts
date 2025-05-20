import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TicketAvailabilityQueryDto {
  @ApiProperty({ description: 'Date to check availability', example: '2024-07-01' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Variant ID', required: false })
  @IsOptional()
  @IsNumber()
  variantId?: number;
}

export class TicketAvailabilityResponseDto {
  @ApiProperty({ description: 'Ticket ID' })
  id: number;

  @ApiProperty({ description: 'Available quantity' })
  availableQuantity: number;

  @ApiProperty({ description: 'Date of availability' })
  date: string;

  @ApiProperty({ description: 'Variant ID', required: false })
  variantId?: number;

  @ApiProperty({ description: 'Is available', default: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Additional information', required: false })
  additionalInfo?: string;
} 