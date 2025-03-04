import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seo } from '../../entities/seo.entity';

@Injectable()
export class SeoFrontendService {
  constructor(
    @InjectRepository(Seo)
    private readonly seoRepository: Repository<Seo>,
  ) {}

  async findActiveSeo(filters: Partial<{ pagePath: string }> = {}): Promise<Seo[]> {
    return this.seoRepository.find({
      where: {
        ...filters,
        isActive: true,
      },
    });
  }

  async findActiveSeoByPath(pagePath: string): Promise<Seo> {
    const seo = await this.seoRepository.findOne({
      where: {
        pagePath,
        isActive: true,
      },
    });

    if (!seo) {
      throw new NotFoundException(`SEO for page ${pagePath} not found`);
    }

    return seo;
  }
} 