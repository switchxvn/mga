import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { PostTranslation } from '../entities/post-translation.entity';

@Injectable()
export class PostAdminService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTranslation)
    private readonly postTranslationRepository: Repository<PostTranslation>
  ) {}

  async create(data: Partial<Post>) {
    const post = this.postRepository.create(data);
    return this.postRepository.save(post);
  }

  async update(id: number, data: Partial<Post>) {
    await this.postRepository.update(id, data);
    return this.postRepository.findOne({
      where: { id },
      relations: ['translations', 'author']
    });
  }

  async remove(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['translations']
    });
    if (post) {
      await this.postRepository.remove(post);
    }
    return { success: true };
  }

  async createTranslation(postId: number, data: Partial<PostTranslation>) {
    const translation = this.postTranslationRepository.create({
      ...data,
      postId
    });
    return this.postTranslationRepository.save(translation);
  }

  async updateTranslation(id: number, data: Partial<PostTranslation>) {
    await this.postTranslationRepository.update(id, data);
    return this.postTranslationRepository.findOne({
      where: { id },
      relations: ['post']
    });
  }

  async removeTranslation(id: number) {
    const translation = await this.postTranslationRepository.findOne({
      where: { id }
    });
    if (translation) {
      await this.postTranslationRepository.remove(translation);
    }
    return { success: true };
  }
} 