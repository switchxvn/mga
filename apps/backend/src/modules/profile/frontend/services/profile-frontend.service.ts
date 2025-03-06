import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../entities/user-profile.entity';
import { CountryPhoneCode } from '../../../common/entities/country-phone-code.entity';
import { UpdateProfileDto } from '../../dto/update-profile.dto';

@Injectable()
export class ProfileFrontendService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(CountryPhoneCode)
    private readonly countryPhoneCodeRepository: Repository<CountryPhoneCode>,
  ) {}

  async getProfileByUserId(userId: number) {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
      relations: ['countryPhoneCode'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    let profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.userProfileRepository.create({
        userId,
      });
    }

    // Update profile fields
    Object.assign(profile, updateProfileDto);

    // If phone code is provided, validate and set country phone code
    if (updateProfileDto.phoneCode) {
      const countryPhoneCode = await this.countryPhoneCodeRepository.findOne({
        where: { phoneCode: updateProfileDto.phoneCode }
      });

      if (!countryPhoneCode) {
        throw new NotFoundException(`Country phone code ${updateProfileDto.phoneCode} not found`);
      }

      profile.phoneCode = updateProfileDto.phoneCode;
    }

    return this.userProfileRepository.save(profile);
  }

  async getAllCountryPhoneCodes() {
    return this.countryPhoneCodeRepository.find({
      order: {
        countryName: 'ASC',
      },
    });
  }
}