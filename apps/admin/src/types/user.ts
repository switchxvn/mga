export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  // Add any additional profile fields here
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

// Interface mở rộng từ ProfileResponse để bao gồm permissions
export interface ProfileResponseExtended {
  id: string;
  email: string;
  roles: string[];
  isEmailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  profile: any;
  permissions?: Permission[];
} 