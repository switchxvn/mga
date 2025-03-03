import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// Frontend chỉ cần DTO cho các tham số truy vấn
export class GetLogosQueryDto {
  @ApiPropertyOptional({ description: 'Logo type', example: 'header' })
  @IsOptional()
  @IsString()
  type?: string;
} 