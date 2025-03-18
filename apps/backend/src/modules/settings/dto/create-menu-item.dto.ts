import { IsString, IsBoolean, IsOptional, IsNumber, IsArray, ValidateNested, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MenuItemTranslationDto } from './menu-item-translation.dto';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  @Length(2, 2)
  defaultLocale: string = 'en';

  @ApiProperty({ type: [MenuItemTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemTranslationDto)
  translations: MenuItemTranslationDto[];

  @ApiProperty()
  @IsString()
  href: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasMegaMenu?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  megaMenuColumns?: any;
} 