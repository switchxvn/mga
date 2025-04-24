import { Address, CountryPhoneCodeResponse, Profile, ProfileResponse } from '@ew/shared';
import { UserProfile } from '../entities/user-profile.entity';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';
import { User } from '../../user/entities/user.entity';

export class ProfileTransformer {
  static toAddressResponse(data: NonNullable<UserProfile['address']>): Address {
    return {
      street: data.street ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      country: data.country ?? null,
      zipCode: data.zipCode ?? null,
    };
  }

  static toCountryPhoneCodeResponse(data: CountryPhoneCode): CountryPhoneCodeResponse {
    return {
      phoneCode: data.phoneCode,
      countryCode: data.countryCode,
      countryName: data.countryName,
      isActive: data.isActive,
      flagIcon: data.flagIcon ?? null,
      flagEmoji: data.flagEmoji ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  static async toProfileResponse(data: UserProfile): Promise<Profile> {
    const countryPhoneCode = await data.countryPhoneCode;
    
    return {
      id: data.id,
      userId: data.userId,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      phoneNumber: data.phoneNumber ?? null,
      phoneCode: data.phoneCode ?? null,
      bio: data.bio ?? null,
      address: data.address ? this.toAddressResponse(data.address) : null,
      countryPhoneCode: countryPhoneCode ? this.toCountryPhoneCodeResponse(countryPhoneCode) : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  static async toFullProfileResponse(user: User): Promise<ProfileResponse> {
    const profile = await user.profile;
    const roles = user.roles || [];

    return {
      id: user.id,
      email: user.email,
      roles: roles.map(role => role.name),
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: profile ? await this.toProfileResponse(profile) : null,
    };
  }
} 