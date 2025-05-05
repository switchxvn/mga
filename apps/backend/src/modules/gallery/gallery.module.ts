import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';
import { GalleryTranslation } from './entities/gallery-translation.entity';
import { GalleryFrontendService } from './frontend/services/gallery-frontend.service';
import { GalleryAdminService } from './admin/services/gallery-admin.service';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gallery, GalleryTranslation, Category]),
  ],
  providers: [GalleryFrontendService, GalleryAdminService],
  exports: [GalleryFrontendService, GalleryAdminService],
})
export class GalleryModule {} 