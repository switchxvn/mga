export interface PostTranslation {
  id: number;
  locale: string;
  title: string;
  content: string;
  shortDescription?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  postId: number;
  createdAt: Date;
  updatedAt: Date;
} 