import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSeoQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pagePath?: string;
} 