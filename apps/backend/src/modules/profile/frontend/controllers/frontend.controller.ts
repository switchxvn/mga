import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileFrontendService } from '../services/profile-frontend.service';
import { UpdateProfileDto } from '../../dto/update-profile.dto';
import { UserProfile, CountryPhoneCode } from '@ew/database';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('profile')
@Controller('profile')
export class ProfileFrontendController {
  constructor(private readonly profileFrontendService: ProfileFrontendService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile', type: UserProfile })
  getProfile(@Request() req) {
    return this.profileFrontendService.getProfileByUserId(req.user.id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserProfile })
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileFrontendService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('country-phone-codes')
  @ApiOperation({ summary: 'Get all country phone codes' })
  @ApiResponse({ status: 200, description: 'Return all country phone codes', type: [CountryPhoneCode] })
  getAllCountryPhoneCodes() {
    return this.profileFrontendService.getAllCountryPhoneCodes();
  }
} 