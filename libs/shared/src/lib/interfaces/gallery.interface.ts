export enum GalleryType {
  COMMON = 'common',
  SLIDER = 'slider',
  BANNER = 'banner',
  FOOD = 'food'
}

export interface CategoryForGallery {
  id: number;
  name?: string;
}

export interface GalleryTranslation {
  locale: string;
  title: string;
  description?: string;
}

export interface Gallery {
  id: number;
  image: string;
  sequence: number;
  isActive: boolean;
  type: GalleryType;
  translations: GalleryTranslation[];
  categories: CategoryForGallery[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGalleryInput {
  image: string;
  sequence?: number;
  isActive?: boolean;
  type?: GalleryType;
  translations: GalleryTranslation[];
  categoryIds?: number[];
}

export interface UpdateGalleryInput {
  image?: string;
  sequence?: number;
  isActive?: boolean;
  type?: GalleryType;
  translations?: GalleryTranslation[];
  categoryIds?: number[];
} 