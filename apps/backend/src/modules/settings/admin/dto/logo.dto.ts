import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateLogoDto {
  @ApiProperty({ description: 'Logo URL', example: 'https://example.com/logo.png' })
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Logo type', example: 'header' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Logo alt text', example: 'Company Logo' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ description: 'Logo width', example: '150px' })
  @IsOptional()
  @IsString()
  width?: string;

  @ApiPropertyOptional({ description: 'Logo height', example: '50px' })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({ description: 'Whether the logo is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLogoDto {
  @ApiPropertyOptional({ description: 'Logo URL', example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Logo type', example: 'header' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Logo alt text', example: 'Company Logo' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ description: 'Logo width', example: '150px' })
  @IsOptional()
  @IsString()
  width?: string;

  @ApiPropertyOptional({ description: 'Logo height', example: '50px' })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({ description: 'Whether the logo is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 