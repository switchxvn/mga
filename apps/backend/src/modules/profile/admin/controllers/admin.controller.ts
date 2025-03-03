import { Controller, Get, Patch, Param, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileAdminService } from '../services/profile-admin.service';
import { UpdateProfileDto } from '../../dto/update-profile.dto';
import { UserProfile } from '@ew/database';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
// import { RolesGuard } from '../../../auth/roles.guard';
// import { Roles } from '../../../auth/roles.decorator';

@ApiTags('admin/profiles')
@Controller('admin/profiles')
@UseGuards(JwtAuthGuard)
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@ApiBearerAuth()
export class ProfileAdminController {
  constructor(private readonly profileAdminService: ProfileAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all profiles' })
  @ApiResponse({ status: 200, description: 'Return all profiles', type: [UserProfile] })
  findAll() {
    return this.profileAdminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by id' })
  @ApiResponse({ status: 200, description: 'Return found profile', type: UserProfile })
  findOne(@Param('id') id: string) {
    return this.profileAdminService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get profile by user id' })
  @ApiResponse({ status: 200, description: 'Return found profile', type: UserProfile })
  findByUserId(@Param('userId') userId: string) {
    return this.profileAdminService.findByUserId(+userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserProfile })
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileAdminService.update(+id, updateProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  remove(@Param('id') id: string) {
    return this.profileAdminService.remove(+id);
  }
} 