import type { CategoryTranslation } from './category-translation';
import type { Post } from './post';
import type { Product } from './product';

export enum CategoryType {
  NEWS = 'news',
  PRODUCT = 'product',
  BOTH = 'both'
}

export interface Category {
  id: number;
  active: boolean;
  isFeatured: boolean;
  type: CategoryType;
  parentId: number | null;
  parent: Category | null;
  children: Category[];
  translations: CategoryTranslation[];
  posts?: Post[];
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
} 