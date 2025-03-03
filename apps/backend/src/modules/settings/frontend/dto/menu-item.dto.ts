import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

// Frontend chỉ cần DTO cho các tham số truy vấn
export class GetMenuItemsQueryDto {
  @ApiPropertyOptional({ description: 'Parent menu item ID', example: 1 })
  @IsOptional()
  @IsNumber()
  parentId?: number;
} 