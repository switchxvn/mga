import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }

  async findByIdWithAuthor(id: number): Promise<Post | null> {
    return this.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async findByAuthorId(authorId: number): Promise<Post[]> {
    return this.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findPublished(): Promise<Post[]> {
    return this.find({
      where: { published: true },
      relations: ['author'],
    });
  }
} 