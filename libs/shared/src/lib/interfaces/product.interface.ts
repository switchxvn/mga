import { Category } from './category.interface';

export interface ProductTranslation {
  id: number;
  title: string;
  content?: string;
  shortDescription?: string;
  locale: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSpecification {
  id: number;
  name: string;
  value: string;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCombo {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  slug: string;
  sku?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isSale?: boolean;
  active: boolean;
  thumbnail?: string;
  images?: string[];
  videoReview?: string;
  categories: Category[];
  translations: ProductTranslation[];
  specifications?: ProductSpecification[];
  combos?: ProductCombo[];
  crossSellProducts?: Product[];
  createdAt: Date;
  updatedAt: Date;
} 