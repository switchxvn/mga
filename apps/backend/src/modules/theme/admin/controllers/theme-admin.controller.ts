import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemeAdminService } from '../services/theme-admin.service';
import { Theme } from '../../entities/theme.entity';

@ApiTags('Admin Themes')
@Controller('admin/themes')
export class ThemeAdminController {
  constructor(private readonly themeAdminService: ThemeAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all themes' })
  @ApiResponse({ status: 200, description: 'Return all themes', type: [Theme] })
  findAll() {
    return this.themeAdminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get theme by id' })
  @ApiResponse({ status: 200, description: 'Return theme by id', type: Theme })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.themeAdminService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create theme' })
  @ApiResponse({ status: 201, description: 'Theme successfully created', type: Theme })
  create(@Body() createThemeDto: Partial<Theme>) {
    return this.themeAdminService.create(createThemeDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update theme' })
  @ApiResponse({ status: 200, description: 'Theme successfully updated', type: Theme })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateThemeDto: Partial<Theme>,
  ) {
    return this.themeAdminService.update(id, updateThemeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete theme' })
  @ApiResponse({ status: 200, description: 'Theme successfully deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.themeAdminService.remove(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Set theme as active' })
  @ApiResponse({ status: 200, description: 'Theme successfully activated' })
  setActive(@Param('id', ParseIntPipe) id: number) {
    return this.themeAdminService.setActiveTheme(id);
  }
} 