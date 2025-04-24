import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';
import { GalleryTranslation } from './entities/gallery-translation.entity';
import { GalleryFrontendService } from './frontend/services/gallery-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gallery, GalleryTranslation]),
  ],
  providers: [GalleryFrontendService],
  exports: [GalleryFrontendService],
})
export class GalleryModule {} 