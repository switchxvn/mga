export type Address = {
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
};

export type CountryPhoneCodeResponse = {
  phoneCode: string;
  countryCode: string;
  countryName: string;
  isActive: boolean;
  flagIcon: string | null;
  flagEmoji: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Profile = {
  id: number;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  phoneCode: string | null;
  bio: string | null;
  address: Address | null;
  countryPhoneCode: CountryPhoneCodeResponse | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileResponse = {
  id: string;
  email: string;
  roles: string[];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: Profile | null;
};