import { Author } from './author.interface';
import { Tag } from './tag.interface';
import { PostTranslation } from './post-translation.interface';

export interface Post {
  id: number;
  published: boolean;
  authorId: number;
  title?: string;
  content?: string;
  shortDescription?: string;
  thumbnail?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  author?: Author;
  categories?: any[];
  tags?: Tag[];
  translations?: PostTranslation[];
} 