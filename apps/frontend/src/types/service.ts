export interface ServiceTranslation {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  locale: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  canonicalUrl: string;
  serviceId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  icon: string;
  thumbnail: string | null;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  translations: ServiceTranslation[];
}

export interface ServiceFilter {
  search?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
  locale?: string;
}

export interface ServiceResponse {
  items: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 