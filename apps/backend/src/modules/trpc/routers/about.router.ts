import { Inject, Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { AboutAdminService } from '../../about/admin/services/about-admin.service';
import { AboutFrontendService } from '../../about/frontend/services/about-frontend.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AboutSectionType } from '../../about/entities/about-section.entity';

// Define the schema outside the class
const aboutSectionSchema = z.object({
  type: z.nativeEnum(AboutSectionType),
  component_name: z.string(),
  order: z.number().optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
  translations: z.array(z.object({
    locale: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    content: z.string().optional(),
    data: z.record(z.any()).optional(),
  })).optional(),
});

type AboutSectionInput = z.infer<typeof aboutSectionSchema>;

@Injectable()
export class AboutRouter {
  constructor(
    private readonly trpc: TrpcService,
    @Inject(AboutAdminService)
    private readonly aboutAdminService: AboutAdminService,
    @Inject(AboutFrontendService)
    private readonly aboutFrontendService: AboutFrontendService,
  ) {}
}

// Định nghĩa router cho trang giới thiệu
export const aboutRouter = router({
  // Frontend routes
  getActiveSections: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      const locale = input || 'en';
      return ctx.services.aboutFrontendService.getActiveSections(locale);
    }),

  getSectionById: publicProcedure
    .input(z.object({
      id: z.number(),
      locale: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { id, locale = 'en' } = input;
      return ctx.services.aboutFrontendService.getSectionById(id, locale);
    }),

  // Admin routes
  admin: router({
    getAllSections: adminProcedure
      .query(async ({ ctx }) => {
        return ctx.services.aboutAdminService.findAllSections();
      }),

    getSectionById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.findSectionById(input.id);
      }),

    createSection: adminProcedure
      .input(aboutSectionSchema)
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.createSection(input as any);
      }),

    updateSection: adminProcedure
      .input(z.object({
        id: z.number(),
        data: aboutSectionSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.updateSection(input.id, input.data as any);
      }),

    deleteSection: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.deleteSection(input.id);
      }),

    updateSectionsOrder: adminProcedure
      .input(z.array(
        z.object({
          id: z.number().int().positive(),
          order: z.number().int().min(0),
        })
      ).min(1))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.updateSectionsOrder(input as any);
      }),
  }),
}); 