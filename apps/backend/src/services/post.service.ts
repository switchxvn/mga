import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({ relations: ['author'] });
  }

  async findOne(id: number): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return this.postRepository.findByAuthorId(authorId);
  }

  async findPublished(): Promise<Post[]> {
    return this.postRepository.findPublished();
  }

  async create(data: Partial<Post>): Promise<Post> {
    const post = this.postRepository.create(data);
    return this.postRepository.save(post);
  }

  async update(id: number, data: Partial<Post>): Promise<Post | null> {
    await this.postRepository.update(id, data);
    return this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.postRepository.delete(id);
  }
} 