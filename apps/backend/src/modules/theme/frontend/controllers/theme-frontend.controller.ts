import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemeFrontendService } from '../services/theme-frontend.service';
import { Theme } from '../../entities/theme.entity';

@ApiTags('Frontend Themes')
@Controller('themes')
export class ThemeFrontendController {
  constructor(private readonly themeFrontendService: ThemeFrontendService) {}

  @Get()
  @ApiOperation({ summary: 'Get all themes' })
  @ApiResponse({ status: 200, description: 'Return all themes', type: [Theme] })
  findAll() {
    return this.themeFrontendService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get theme by id' })
  @ApiResponse({ status: 200, description: 'Return theme by id', type: Theme })
  findOne(@Param('id') id: string) {
    return this.themeFrontendService.findOne(+id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active theme' })
  @ApiResponse({ status: 200, description: 'Return active theme', type: Theme })
  getActiveTheme() {
    return this.themeFrontendService.getActiveTheme();
  }
} 