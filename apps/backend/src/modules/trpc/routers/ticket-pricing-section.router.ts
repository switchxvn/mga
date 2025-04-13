import { Inject, Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { TicketPricingSectionAdminService } from '../../ticket-pricing/admin/services/ticket-pricing-section-admin.service';
import { TicketPricingSectionFrontendService } from '../../ticket-pricing/frontend/services/ticket-pricing-section-frontend.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { TicketPricingSectionType } from '../../ticket-pricing/entities/ticket-pricing-section.entity';

// Define the schema outside the class
const ticketPricingSectionSchema = z.object({
  type: z.nativeEnum(TicketPricingSectionType),
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
export class TicketPricingSectionRouter {
  constructor(
    private readonly trpc: TrpcService,
    @Inject(TicketPricingSectionAdminService)
    private readonly ticketPricingSectionAdminService: TicketPricingSectionAdminService,
    @Inject(TicketPricingSectionFrontendService)
    private readonly ticketPricingSectionFrontendService: TicketPricingSectionFrontendService,
  ) {}
}

// Định nghĩa router cho trang bảng giá vé
export const ticketPricingSectionRouter = router({
  // Frontend routes
  getActiveSections: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      try {
        const locale = input || 'en';
        return await ctx.services.ticketPricingSectionFrontendService.getActiveSections(locale);
      } catch (error) {
        console.error('Error in getActiveSections:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch ticket pricing sections',
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
        return await ctx.services.ticketPricingSectionFrontendService.getSectionById(id, locale);
      } catch (error) {
        console.error('Error in getSectionById:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch ticket pricing section',
        });
      }
    }),

  // Admin routes
  admin: router({
    getAllSections: adminProcedure
      .query(async ({ ctx }) => {
        try {
          return await ctx.services.ticketPricingSectionAdminService.findAllSections();
        } catch (error) {
          console.error('Error in getAllSections:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch all ticket pricing sections',
          });
        }
      }),

    getSectionById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          return await ctx.services.ticketPricingSectionAdminService.findSectionById(input.id);
        } catch (error) {
          console.error('Error in getSectionById:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch ticket pricing section',
          });
        }
      }),

    createSection: adminProcedure
      .input(ticketPricingSectionSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.ticketPricingSectionAdminService.createSection(input as any);
        } catch (error) {
          console.error('Error in createSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create ticket pricing section',
          });
        }
      }),

    updateSection: adminProcedure
      .input(z.object({
        id: z.number(),
        data: ticketPricingSectionSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.ticketPricingSectionAdminService.updateSection(input.id, input.data as any);
        } catch (error) {
          console.error('Error in updateSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update ticket pricing section',
          });
        }
      }),

    deleteSection: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.ticketPricingSectionAdminService.deleteSection(input.id);
        } catch (error) {
          console.error('Error in deleteSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete ticket pricing section',
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
          return await ctx.services.ticketPricingSectionAdminService.updateSectionsOrder(orderData);
        } catch (error) {
          console.error('Error in updateSectionsOrder:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update ticket pricing sections order',
          });
        }
      }),
  }),
}); 