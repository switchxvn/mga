import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserFrontendService } from '../services/user-frontend.service';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserFrontendController {
  constructor(private readonly userFrontendService: UserFrontendService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return found user', type: User })
  findOne(@Param('id') id: string): Promise<User> {
    return this.userFrontendService.findOne(+id);
  }
} 