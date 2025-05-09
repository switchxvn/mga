export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  roles?: string[] | any[]; // Có thể là mảng string hoặc mảng object
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
  roles: (string | Role)[];  // Có thể là mảng string hoặc mảng Role
  isEmailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  profile: any;
  permissions?: Permission[];
} 