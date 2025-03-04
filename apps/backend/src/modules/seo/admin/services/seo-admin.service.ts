import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seo } from '../../entities/seo.entity';
import { CreateSeoInput, UpdateSeoInput } from '@ew/shared';

@Injectable()
export class SeoAdminService {
  constructor(
    @InjectRepository(Seo)
    private readonly seoRepository: Repository<Seo>,
  ) {}

  async findAll(filters: Partial<{ pagePath: string; isActive: boolean }> = {}): Promise<Seo[]> {
    return this.seoRepository.find({
      where: filters,
    });
  }

  async findById(id: number): Promise<Seo> {
    const seo = await this.seoRepository.findOne({
      where: { id },
    });

    if (!seo) {
      throw new NotFoundException(`SEO with ID ${id} not found`);
    }

    return seo;
  }

  async create(data: CreateSeoInput): Promise<Seo> {
    const seo = this.seoRepository.create(data);
    return this.seoRepository.save(seo);
  }

  async update(id: number, data: UpdateSeoInput): Promise<Seo> {
    const seo = await this.findById(id);
    Object.assign(seo, data);
    return this.seoRepository.save(seo);
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const seo = await this.findById(id);
    await this.seoRepository.remove(seo);
    return {
      success: true,
      message: `SEO with ID ${id} has been deleted`,
    };
  }
} 