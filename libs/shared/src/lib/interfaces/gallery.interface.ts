export enum GalleryType {
  COMMON = 'common',
  SLIDER = 'slider',
  BANNER = 'banner',
  FOOD = 'food'
}

export interface GalleryTranslation {
  locale: string;
  title: string;
  description?: string;
}

export interface Gallery {
  id: number;
  type: GalleryType;
  image: string;
  sequence: number;
  isActive: boolean;
  translations: GalleryTranslation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGalleryInput {
  type?: GalleryType;
  image: string;
  sequence?: number;
  isActive?: boolean;
  translations: GalleryTranslation[];
}

export interface UpdateGalleryInput {
  type?: GalleryType;
  image?: string;
  sequence?: number;
  isActive?: boolean;
  translations?: GalleryTranslation[];
} 