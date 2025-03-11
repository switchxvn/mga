import { Profile } from './profile.interface';

export interface Author {
  id: number;
  email: string;
  username: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
} 