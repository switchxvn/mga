import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostFrontendService } from '../services/post-frontend.service';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';
import { Post as PostEntity } from '../../entities/post.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('Posts Frontend')
@Controller('posts')
export class PostFrontendController {
  constructor(private readonly postService: PostFrontendService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  findAll() {
    return this.postService.findAll();
  }

  @Get('locale/:locale')
  @ApiOperation({ summary: 'Get posts by locale' })
  findByLocale(@Param('locale') locale: string) {
    return this.postService.findByLocale(locale);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get post by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related posts' })
  findRelatedPosts(
    @Param('id') id: string,
    @Query('locale') locale = 'vi',
    @Query('limit') limit?: number
  ) {
    return this.postService.findRelatedPosts(+id, locale, limit);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular posts' })
  findPopularPosts(
    @Query('locale') locale = 'vi',
    @Query('limit') limit?: number,
    @Query('excludeId') excludeId?: number
  ) {
    return this.postService.findPopularPosts(locale, limit, excludeId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post' })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostEntity })
  create(@Request() req, @Body() createPostDto: CreatePostInput): Promise<PostEntity> {
    return this.postService.create(createPostDto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostEntity })
  update(@Request() req, @Param('id') id: number, @Body() updatePostDto: UpdatePostInput): Promise<PostEntity> {
    return this.postService.update(id, updatePostDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  remove(@Request() req, @Param('id') id: number): Promise<void> {
    return this.postService.remove(id, req.user.id);
  }

  @Get('author/:id')
  @ApiOperation({ summary: 'Get posts by author id' })
  @ApiResponse({ status: 200, description: 'Return posts by author', type: [PostEntity] })
  findByAuthorId(@Param('id') id: string): Promise<PostEntity[]> {
    return this.postService.findByAuthorId(id);
  }
} 