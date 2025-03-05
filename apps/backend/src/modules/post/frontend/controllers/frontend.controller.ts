import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostFrontendService } from '../services/post-frontend.service';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';
import { Post as PostEntity } from '../../entities/post.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostFrontendController {
  constructor(private readonly postFrontendService: PostFrontendService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiResponse({ status: 200, description: 'Return all published posts', type: [PostEntity] })
  findPublished(): Promise<PostEntity[]> {
    return this.postFrontendService.findPublished();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get published post by id' })
  @ApiResponse({ status: 200, description: 'Return found post', type: PostEntity })
  findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postFrontendService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post' })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostEntity })
  create(@Request() req, @Body() createPostDto: CreatePostInput): Promise<PostEntity> {
    return this.postFrontendService.create(createPostDto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostEntity })
  update(@Request() req, @Param('id') id: string, @Body() updatePostDto: UpdatePostInput): Promise<PostEntity> {
    return this.postFrontendService.update(+id, updatePostDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.postFrontendService.remove(+id, req.user.id);
  }

  @Get('author/:id')
  @ApiOperation({ summary: 'Get posts by author id' })
  @ApiResponse({ status: 200, description: 'Return posts by author', type: [PostEntity] })
  findByAuthorId(@Param('id') id: string): Promise<PostEntity[]> {
    return this.postFrontendService.findByAuthorId(+id);
  }
} 