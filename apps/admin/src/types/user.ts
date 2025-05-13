export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  roles?: any[];
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  phoneCode?: string | null;
  bio?: string | null;
  address?: {
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthLoginResponse {
  accessToken: string;
}

// Thêm interface cho Permission
export interface Permission {
  id: string;
  name: string;
  code: string;
  groupName: string;
  description?: string;
}

// Interface cho Role khi là object
export interface Role {
  id: string;
  code: string;
  name: string;
}

// Interface mở rộng từ ProfileResponse để bao gồm permissions
export interface ProfileResponseExtended {
  id: string;
  email: string;
  username?: string;
  roles: (string | Role)[];  // Có thể là mảng string hoặc mảng Role
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  profile?: UserProfile;
  permissions?: Permission[];
}

export type UserState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
} 