import { IsString, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MenuItemTranslationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2)
  locale: string;
}

export class CreateMenuItemTranslationDto extends MenuItemTranslationDto {}

export class UpdateMenuItemTranslationDto extends MenuItemTranslationDto {} 