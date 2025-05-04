import { Injectable } from '@nestjs/common';
import { GalleryAdminService } from '../../../gallery/admin/services/gallery-admin.service';
import { createGallerySchema, galleryQuerySchema, updateGallerySchema } from '../../../gallery/admin/dto/gallery.dto';
import { adminProcedure, router } from '../../procedures';
import { z } from 'zod';

@Injectable()
export class GalleryAdminRouter {
  constructor(private galleryAdminService: GalleryAdminService) {}

  public readonly router = router({
    getAll: adminProcedure
      .input(galleryQuerySchema)
      .query(({ input }) => {
        return this.galleryAdminService.getAll(input);
      }),

    getById: adminProcedure
      .input(z.number().int().positive())
      .query(({ input }) => {
        return this.galleryAdminService.getById(input);
      }),

    create: adminProcedure
      .input(createGallerySchema)
      .mutation(({ input }) => {
        return this.galleryAdminService.create(input);
      }),

    update: adminProcedure
      .input(updateGallerySchema)
      .mutation(({ input }) => {
        return this.galleryAdminService.update(input);
      }),

    delete: adminProcedure
      .input(z.number().int().positive())
      .mutation(({ input }) => {
        return this.galleryAdminService.delete(input);
      }),
  });
}

export const galleryAdminRouter = router({
  getAll: adminProcedure
    .input(galleryQuerySchema)
    .query(({ ctx, input }) => {
      return ctx.services.galleryAdminService.getAll(input);
    }),

  getById: adminProcedure
    .input(z.number().int().positive())
    .query(({ ctx, input }) => {
      return ctx.services.galleryAdminService.getById(input);
    }),

  create: adminProcedure
    .input(createGallerySchema)
    .mutation(({ ctx, input }) => {
      return ctx.services.galleryAdminService.create(input);
    }),

  update: adminProcedure
    .input(updateGallerySchema)
    .mutation(({ ctx, input }) => {
      return ctx.services.galleryAdminService.update(input);
    }),

  delete: adminProcedure
    .input(z.number().int().positive())
    .mutation(({ ctx, input }) => {
      return ctx.services.galleryAdminService.delete(input);
    }),
}); 