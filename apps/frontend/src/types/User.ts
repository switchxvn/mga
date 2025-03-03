export interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string;
  bio: string;
  posts: Post[];
  createdAt: string;
  updatedAt: string;
} 