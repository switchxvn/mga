import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hero } from './entities/hero.entity';
import { HeroSlider } from './entities/hero-slider.entity';
import { HeroVideo } from './entities/hero-video.entity';
import { HeroService } from './admin/services/hero.service';
import { HeroSliderService } from './admin/services/hero-slider.service';
import { HeroVideoService } from './services/hero-video.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hero, HeroSlider, HeroVideo]),
  ],
  providers: [HeroService, HeroSliderService, HeroVideoService],
  exports: [HeroService, HeroSliderService, HeroVideoService],
})
export class HeroModule {} 