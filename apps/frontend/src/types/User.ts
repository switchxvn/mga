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

export interface CountryPhoneCode {
  phoneCode: string;
  countryCode: string;
  countryName: string;
  isActive: boolean;
  flagIcon: string | null;
  flagEmoji: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  phoneNumber: string | null;
  phoneCode: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  countryPhoneCode: CountryPhoneCode | null;
}

export interface User {
  id: number;
  email: string;
  username: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string;
  posts: any[];
  createdAt: string;
  updatedAt: string;
  profile: UserProfile | null;
}

export interface AuthLoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string | undefined;
  };
} 