import { Inject, Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { ContactSectionAdminService } from '../../contact/admin/services/contact-section-admin.service';
import { ContactSectionFrontendService } from '../../contact/frontend/services/contact-section-frontend.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { ContactSectionType } from '../../contact/entities/contact-section.entity';

// Define the schema outside the class
const contactSectionSchema = z.object({
  type: z.nativeEnum(ContactSectionType),
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

@Injectable()
export class ContactSectionRouter {
  constructor(
    private readonly trpc: TrpcService,
    @Inject(ContactSectionAdminService)
    private readonly contactSectionAdminService: ContactSectionAdminService,
    @Inject(ContactSectionFrontendService)
    private readonly contactSectionFrontendService: ContactSectionFrontendService,
  ) {}
}

// Định nghĩa router cho trang liên hệ
export const contactSectionRouter = router({
  // Frontend routes
  getActiveSections: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      try {
        const locale = input || 'en';
        return await ctx.services.contactSectionFrontendService.getActiveSections(locale);
      } catch (error) {
        console.error('Error in getActiveSections:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contact sections',
        });
      }
    }),

  getSectionById: publicProcedure
    .input(z.object({
      id: z.number(),
      locale: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { id, locale = 'en' } = input;
        return await ctx.services.contactSectionFrontendService.getSectionById(id, locale);
      } catch (error) {
        console.error('Error in getSectionById:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contact section',
        });
      }
    }),

  // Admin routes
  admin: router({
    getAllSections: adminProcedure
      .query(async ({ ctx }) => {
        try {
          return await ctx.services.contactSectionAdminService.findAllSections();
        } catch (error) {
          console.error('Error in getAllSections:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch all contact sections',
          });
        }
      }),

    getSectionById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          return await ctx.services.contactSectionAdminService.findSectionById(input.id);
        } catch (error) {
          console.error('Error in getSectionById:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch contact section',
          });
        }
      }),

    createSection: adminProcedure
      .input(contactSectionSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.contactSectionAdminService.createSection(input as any);
        } catch (error) {
          console.error('Error in createSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create contact section',
          });
        }
      }),

    updateSection: adminProcedure
      .input(z.object({
        id: z.number(),
        data: contactSectionSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.contactSectionAdminService.updateSection(input.id, input.data as any);
        } catch (error) {
          console.error('Error in updateSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update contact section',
          });
        }
      }),

    deleteSection: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.contactSectionAdminService.deleteSection(input.id);
        } catch (error) {
          console.error('Error in deleteSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete contact section',
          });
        }
      }),

    updateSectionsOrder: adminProcedure
      .input(z.array(
        z.object({
          id: z.number().int().positive(),
          order: z.number().int().min(0),
        })
      ).min(1))
      .mutation(async ({ ctx, input }) => {
        try {
          const orderData = input.map(item => ({
            id: item.id,
            order: item.order
          }));
          return await ctx.services.contactSectionAdminService.updateSectionsOrder(orderData);
        } catch (error) {
          console.error('Error in updateSectionsOrder:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update contact sections order',
          });
        }
      }),
  }),
}); 