export interface GalleryTranslation {
  id: number;
  locale: string;
  title: string;
  description?: string;
  galleryId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gallery {
  id: number;
  image: string;
  isActive: boolean;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
  translations: GalleryTranslation[];
} 