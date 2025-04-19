import { Inject, Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { OrderTicketSectionAdminService } from '../../order-ticket/admin/services/order-ticket-section-admin.service';
import { OrderTicketSectionFrontendService } from '../../order-ticket/frontend/services/order-ticket-section-frontend.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

// Define the schema for order ticket section
const orderTicketSectionSchema = z.object({
  type: z.string(),
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
export class OrderTicketSectionRouter {
  constructor(
    private readonly trpc: TrpcService,
    @Inject(OrderTicketSectionAdminService)
    private readonly orderTicketSectionAdminService: OrderTicketSectionAdminService,
    @Inject(OrderTicketSectionFrontendService)
    private readonly orderTicketSectionFrontendService: OrderTicketSectionFrontendService,
  ) {}
}

// Define router for order ticket section
export const orderTicketSectionRouter = router({
  // Frontend routes
  getActiveSections: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      try {
        const locale = input || 'en';
        return await ctx.services.orderTicketSectionFrontendService.getActiveSections(locale);
      } catch (error) {
        console.error('Error in getActiveSections:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch order ticket sections',
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
        return await ctx.services.orderTicketSectionFrontendService.getSectionById(id, locale);
      } catch (error) {
        console.error('Error in getSectionById:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch order ticket section',
        });
      }
    }),

  // Admin routes
  admin: router({
    getAllSections: adminProcedure
      .query(async ({ ctx }) => {
        try {
          return await ctx.services.orderTicketSectionAdminService.findAllSections();
        } catch (error) {
          console.error('Error in getAllSections:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch all order ticket sections',
          });
        }
      }),

    getSectionById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          return await ctx.services.orderTicketSectionAdminService.findSectionById(input.id);
        } catch (error) {
          console.error('Error in getSectionById:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch order ticket section',
          });
        }
      }),

    createSection: adminProcedure
      .input(orderTicketSectionSchema)
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.orderTicketSectionAdminService.createSection(input);
        } catch (error) {
          console.error('Error in createSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create order ticket section',
          });
        }
      }),

    updateSection: adminProcedure
      .input(z.object({
        id: z.number(),
        data: orderTicketSectionSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.orderTicketSectionAdminService.updateSection(input.id, input.data);
        } catch (error) {
          console.error('Error in updateSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update order ticket section',
          });
        }
      }),

    deleteSection: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await ctx.services.orderTicketSectionAdminService.deleteSection(input.id);
        } catch (error) {
          console.error('Error in deleteSection:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete order ticket section',
          });
        }
      }),

    updateSectionsOrder: adminProcedure
      .input(z.array(
        z.object({
          id: z.number().int().positive(),
          order: z.number().int().min(0),
        }).strict()
      ).min(1))
      .mutation(async ({ ctx, input }) => {
        try {
          // Transform input to ensure all fields are present
          const orderData = input.map(item => ({
            id: item.id,
            order: item.order
          }));
          return await ctx.services.orderTicketSectionAdminService.updateSectionsOrder(orderData);
        } catch (error) {
          console.error('Error in updateSectionsOrder:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update order ticket sections order',
          });
        }
      }),
  }),
}); 