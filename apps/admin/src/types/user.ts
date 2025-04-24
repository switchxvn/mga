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