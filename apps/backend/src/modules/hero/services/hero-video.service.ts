import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroVideo } from '../entities/hero-video.entity';

@Injectable()
export class HeroVideoService {
  constructor(
    @InjectRepository(HeroVideo)
    private readonly heroVideoRepository: Repository<HeroVideo>,
  ) {}

  async findAll(): Promise<HeroVideo[]> {
    return this.heroVideoRepository.find({
      order: {
        order: 'ASC',
      },
    });
  }

  async findActive(themeId?: number): Promise<HeroVideo[]> {
    const query: any = {
      isActive: true,
    };

    if (themeId) {
      query.themeId = themeId;
    }

    return this.heroVideoRepository.find({
      where: query,
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<HeroVideo> {
    return this.heroVideoRepository.findOne({
      where: { id },
    });
  }

  async create(data: Partial<HeroVideo>): Promise<HeroVideo> {
    const heroVideo = this.heroVideoRepository.create(data);
    return this.heroVideoRepository.save(heroVideo);
  }

  async update(id: number, data: Partial<HeroVideo>): Promise<HeroVideo> {
    await this.heroVideoRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.heroVideoRepository.delete(id);
  }
} 