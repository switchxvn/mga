import { Author } from './author.interface';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam',
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId?: string | null;
  parentId?: number | null;
  authorName?: string | null;
  authorEmail?: string | null;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: Author | null;
  parent?: Comment | null;
  replies?: Comment[];
} 