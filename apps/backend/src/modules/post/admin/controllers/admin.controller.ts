import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PostAdminService } from '../services/post-admin.service';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';
import { Post as PostEntity } from '../../entities/post.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
// import { RolesGuard } from '../../../auth/roles.guard';
// import { Roles } from '../../../auth/roles.decorator';

@ApiTags('admin/posts')
@Controller('admin/posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostAdminController {
  constructor(private readonly postAdminService: PostAdminService) {}

  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Create post' })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostEntity })
  create(@Body() createPostDto: CreatePostInput): Promise<PostEntity> {
    // Assuming admin ID is 1 for now, in a real app you would get this from the request
    return this.postAdminService.create(createPostDto, 1);
  }

  @Get()
  // @Roles('admin')
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Return all posts', type: [PostEntity] })
  findAll(): Promise<PostEntity[]> {
    return this.postAdminService.findAll();
  }

  @Get(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Get post by id' })
  @ApiResponse({ status: 200, description: 'Return found post', type: PostEntity })
  findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postAdminService.findOne(+id);
  }

  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostEntity })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostInput): Promise<PostEntity> {
    // Assuming admin ID is 1 for now, in a real app you would get this from the request
    return this.postAdminService.update(+id, updatePostDto, 1);
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    // Assuming admin ID is 1 for now, in a real app you would get this from the request
    return this.postAdminService.remove(+id, 1);
  }
} 