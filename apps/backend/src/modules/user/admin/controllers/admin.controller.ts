import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserAdminService } from '../services/user-admin.service';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
// Tạm thời comment các import không tồn tại
// import { RolesGuard } from '../../../auth/guards/roles.guard';
// import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('admin/users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@ApiBearerAuth()
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userAdminService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users', type: [User] })
  findAll() {
    return this.userAdminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return found user', type: User })
  findOne(@Param('id') id: string): Promise<User> {
    return this.userAdminService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userAdminService.update(String(id), updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.userAdminService.remove(String(id));
  }
} 