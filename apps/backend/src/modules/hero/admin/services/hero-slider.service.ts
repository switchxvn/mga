import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlider } from '../../entities/hero-slider.entity';

@Injectable()
export class HeroSliderService {
  constructor(
    @InjectRepository(HeroSlider)
    private heroSliderRepository: Repository<HeroSlider>,
  ) {}

  async findAll(themeId?: number): Promise<HeroSlider[]> {
    const where: any = {};
    if (themeId) where.themeId = themeId;
    return this.heroSliderRepository.find({
      where,
      order: { order: 'ASC' },
    });
  }

  async findActive(themeId?: number): Promise<HeroSlider[]> {
    const query: any = {
      isActive: true,
    };

    if (themeId) {
      query.themeId = themeId;
    }

    return this.heroSliderRepository.find({
      where: query,
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<HeroSlider> {
    return this.heroSliderRepository.findOne({
      where: { id },
    });
  }

  async create(createHeroSliderDto: Partial<HeroSlider>): Promise<HeroSlider> {
    const heroSlider = this.heroSliderRepository.create(createHeroSliderDto);
    return this.heroSliderRepository.save(heroSlider);
  }

  async update(id: number, updateHeroSliderDto: Partial<HeroSlider>): Promise<HeroSlider> {
    await this.heroSliderRepository.update(id, updateHeroSliderDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.heroSliderRepository.delete(id);
  }
} 