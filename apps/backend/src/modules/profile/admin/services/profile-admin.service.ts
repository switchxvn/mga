import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../entities/user-profile.entity';
import { CountryPhoneCode } from '../../../common/entities/country-phone-code.entity';
import { UpdateProfileDto } from '../../dto/update-profile.dto';

@Injectable()
export class ProfileAdminService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(CountryPhoneCode)
    private readonly countryPhoneCodeRepository: Repository<CountryPhoneCode>,
  ) {}

  async findAll() {
    return this.userProfileRepository.find({
      relations: ['countryPhoneCode', 'user'],
    });
  }

  async findOne(id: number) {
    const profile = await this.userProfileRepository.findOne({
      where: { id },
      relations: ['countryPhoneCode', 'user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return profile;
  }

  async findByUserId(userId: number) {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
      relations: ['countryPhoneCode'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(id);

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

  async remove(id: number) {
    const profile = await this.findOne(id);
    return this.userProfileRepository.remove(profile);
  }
} 