import type { Category } from './category';

export interface CategoryTranslation {
  id: number;
  name: string;
  description?: string;
  locale: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  categoryId: number;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
} 