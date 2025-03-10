import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hero } from './entities/hero.entity';
import { HeroSlider } from './entities/hero-slider.entity';
import { HeroService } from './admin/services/hero.service';
import { HeroSliderService } from './admin/services/hero-slider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hero, HeroSlider]),
  ],
  providers: [HeroService, HeroSliderService],
  exports: [HeroService, HeroSliderService],
})
export class HeroModule {} 