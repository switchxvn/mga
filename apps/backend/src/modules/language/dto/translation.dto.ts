import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TranslationDto {
  @IsNotEmpty()
  @IsString()
  languageCode: string;

  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  namespace?: string;
}

export class TranslationResponseDto {
  id: number;
  languageCode: string;
  key: string;
  value: string;
  namespace: string;
}

export class TranslationsRequestDto {
  @IsNotEmpty()
  @IsString()
  languageCode: string;

  @IsOptional()
  @IsString()
  namespace?: string;
} 