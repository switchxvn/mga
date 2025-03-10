import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hero } from '../../entities/hero.entity';

@Injectable()
export class HeroService {
  constructor(
    @InjectRepository(Hero)
    private heroRepository: Repository<Hero>,
  ) {}

  async findAll(): Promise<Hero[]> {
    return this.heroRepository.find({
      order: {
        order: 'ASC',
      },
    });
  }

  async findActive(): Promise<Hero[]> {
    return this.heroRepository.find({
      where: {
        isActive: true,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Hero> {
    return this.heroRepository.findOne({
      where: { id },
    });
  }

  async create(createHeroDto: Partial<Hero>): Promise<Hero> {
    const hero = this.heroRepository.create(createHeroDto);
    return this.heroRepository.save(hero);
  }

  async update(id: number, updateHeroDto: Partial<Hero>): Promise<Hero> {
    await this.heroRepository.update(id, updateHeroDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.heroRepository.delete(id);
  }
} 