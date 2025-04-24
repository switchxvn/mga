import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserFrontendService } from '../services/user-frontend.service';
import { User } from '../../entities/user.entity';

@ApiTags('frontend/users')
@Controller('frontend/users')
export class UserFrontendController {
  constructor(private readonly userFrontendService: UserFrontendService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return found user', type: User })
  findOne(@Param('id') id: string): Promise<User> {
    return this.userFrontendService.findOne(id);
  }
} 