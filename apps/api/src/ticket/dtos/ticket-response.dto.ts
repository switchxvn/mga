import { ApiProperty } from '@nestjs/swagger';

export class TicketVariantDto {
  @ApiProperty({ description: 'Variant ID' })
  id: number;

  @ApiProperty({ description: 'Variant name' })
  name: string;

  @ApiProperty({ description: 'Variant price' })
  price: number;

  @ApiProperty({ description: 'Variant description', required: false })
  description?: string;
}

export class TicketResponseDto {
  @ApiProperty({ description: 'Ticket ID' })
  id: number;

  @ApiProperty({ description: 'Ticket title' })
  title: string;

  @ApiProperty({ description: 'Ticket slug' })
  slug: string;

  @ApiProperty({ description: 'Ticket description', required: false })
  description?: string;

  @ApiProperty({ description: 'Thumbnail image URL', required: false })
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Ticket location', required: false })
  location?: string;

  @ApiProperty({ description: 'Available quantity', required: false })
  availableQuantity?: number;

  @ApiProperty({ description: 'Price in VND' })
  price: number;

  @ApiProperty({ description: 'Sale price in VND', required: false })
  salePrice?: number;

  @ApiProperty({ description: 'Is ticket available', default: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Valid from date', required: false })
  validFrom?: Date;

  @ApiProperty({ description: 'Valid until date', required: false })
  validUntil?: Date;

  @ApiProperty({ description: 'Ticket variants', type: [TicketVariantDto], required: false })
  variants?: TicketVariantDto[];

  @ApiProperty({ description: 'Image URLs', type: [String], required: false })
  images?: string[];
}

export class TicketListResponseDto {
  @ApiProperty({ description: 'List of tickets', type: [TicketResponseDto] })
  data: TicketResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Page size' })
  pageSize: number;
} 