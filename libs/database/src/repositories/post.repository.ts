import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }

  async findByAuthorId(authorId: number): Promise<Post[]> {
    return this.find({
      where: { authorId },
      relations: ['author'],
    });
  }

  async findPublished(): Promise<Post[]> {
    return this.find({
      where: { published: true },
      relations: ['author'],
    });
  }
} 