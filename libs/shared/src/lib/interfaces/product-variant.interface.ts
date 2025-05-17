export interface ProductVariantTranslation {
  id?: number;
  locale: string;
  name: string;
  variantId?: number;
}

export interface ProductVariant {
  id?: number;
  productId?: number;
  sku: string;
  price: number | null;
  comparePrice: number | null;
  thumbnail?: string;
  gallery?: string[];
  published?: boolean;
  quantity: number;
  stock?: number; // Alias for quantity used in frontend
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  barcode?: string;
  options?: Record<string, string>;
  translations?: ProductVariantTranslation[];
  createdAt?: Date;
  updatedAt?: Date;
  
  // Frontend-only fields for UI state
  _tempPrice?: number;
  _tempComparePrice?: number | null;
} 