export interface BasePost {
  id: number;
  title: string;
  content: string;
  published: boolean;
  shortDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string | null;
} 