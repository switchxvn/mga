import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostService } from '../services/post.service';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';
import { Post as PostEntity } from '../entities/post.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Create post' })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostEntity })
  create(@Request() req, @Body() createPostDto: CreatePostInput) {
    return this.postService.create(createPostDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Return all posts', type: [PostEntity] })
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  @ApiResponse({ status: 200, description: 'Return found post', type: PostEntity })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostEntity })
  update(@Request() req, @Param('id') id: string, @Body() updatePostDto: UpdatePostInput) {
    return this.postService.update(+id, updatePostDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  remove(@Request() req, @Param('id') id: string) {
    return this.postService.remove(+id, req.user.id);
  }
} 