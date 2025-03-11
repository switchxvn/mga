export interface Profile {
  id?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string | null;
  phoneCode?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
} 