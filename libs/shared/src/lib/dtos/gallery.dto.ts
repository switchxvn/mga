export interface GalleryTranslationDto {
  locale: string;
  title: string;
  description?: string;
}

export interface CreateGalleryDto {
  image: string;
  isActive: boolean;
  sequence: number;
  translations: GalleryTranslationDto[];
}

export interface UpdateGalleryDto {
  image?: string;
  isActive?: boolean;
  sequence?: number;
  translations?: GalleryTranslationDto[];
} 