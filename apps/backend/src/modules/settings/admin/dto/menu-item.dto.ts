import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, Min } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Menu item label', example: 'Home' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Menu item URL', example: '/' })
  @IsString()
  @IsUrl({ require_tld: false }, { message: 'href must be a valid URL' })
  href: string;

  @ApiPropertyOptional({ description: 'Parent menu item ID', example: 1 })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Menu item order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Whether the menu item has a mega menu', example: false })
  @IsOptional()
  @IsBoolean()
  hasMegaMenu?: boolean;

  @ApiPropertyOptional({ description: 'Whether the menu item is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ description: 'Menu item label', example: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Menu item URL', example: '/' })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false }, { message: 'href must be a valid URL' })
  href?: string;

  @ApiPropertyOptional({ description: 'Parent menu item ID', example: 1 })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Menu item order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Whether the menu item has a mega menu', example: false })
  @IsOptional()
  @IsBoolean()
  hasMegaMenu?: boolean;

  @ApiPropertyOptional({ description: 'Whether the menu item is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 