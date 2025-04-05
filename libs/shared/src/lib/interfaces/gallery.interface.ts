export interface GalleryTranslation {
  id: number;
  locale: string;
  title: string;
  description?: string;
  galleryId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type GalleryType = 'common' | 'food';

export interface Gallery {
  id: number;
  image: string;
  isActive: boolean;
  sequence: number;
  type: GalleryType;
  createdAt: Date;
  updatedAt: Date;
  translations: GalleryTranslation[];
} 