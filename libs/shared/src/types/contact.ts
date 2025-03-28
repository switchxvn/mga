export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface UpdateContactStatusDto {
  id: string;
  status: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
} 