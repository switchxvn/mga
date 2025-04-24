export interface Profile {
  id?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string | null;
  phoneCode?: string | null;
  address?: {
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
} 