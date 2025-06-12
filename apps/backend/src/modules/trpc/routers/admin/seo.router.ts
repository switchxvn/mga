import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../../procedures';
import { z } from 'zod';

const createSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  keywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  pagePath: z.string(),
  robotsTxt: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  keywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  pagePath: z.string().optional(),
  robotsTxt: z.string().optional(),
  isActive: z.boolean().optional(),
});

const getSeoListSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['id', 'pagePath', 'title', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const seoAdminRouter = router({
  // Get all SEO entries with pagination and filtering
  getAll: protectedProcedure
    .input(getSeoListSchema)
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Admin fetching SEO entries', { input });
        const result = await ctx.services.seoAdminService.findAllPaginated(input);
        return result;
      } catch (error) {
        ctx.logger.error('Error fetching SEO entries:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve SEO entries',
          cause: error,
        });
      }
    }),

  // Get SEO by ID
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Admin fetching SEO ID: ${input}`);
        const seo = await ctx.services.seoAdminService.findById(input);
        
        if (!seo) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `SEO with ID ${input} not found`,
          });
        }
        
        return seo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching SEO ID ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve SEO entry',
          cause: error,
        });
      }
    }),

  // Get SEO by page path
  getByPath: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Admin fetching SEO for path: ${input}`);
        const seo = await ctx.services.seoAdminService.findByPath(input);
        return seo;
      } catch (error) {
        ctx.logger.error(`Error fetching SEO for path ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve SEO entry',
          cause: error,
        });
      }
    }),

  // Create new SEO entry
  create: protectedProcedure
    .input(createSeoSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Admin creating SEO entry', { pagePath: input.pagePath });
        
        // Check if SEO for this path already exists
        const existing = await ctx.services.seoAdminService.findByPath(input.pagePath);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `SEO entry for path '${input.pagePath}' already exists`,
          });
        }
        
        const newSeo = await ctx.services.seoAdminService.create(input);
        ctx.logger.log(`Admin successfully created SEO ID: ${newSeo.id}`);
        return newSeo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error('Error creating SEO entry:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create SEO entry',
          cause: error,
        });
      }
    }),

  // Update SEO entry
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: updateSeoSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Admin updating SEO ID: ${input.id}`);
        
        // Check if entry exists
        const existing = await ctx.services.seoAdminService.findById(input.id);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `SEO with ID ${input.id} not found`,
          });
        }
        
        // Check if updating path and new path already exists
        if (input.data.pagePath && input.data.pagePath !== existing.pagePath) {
          const pathExists = await ctx.services.seoAdminService.findByPath(input.data.pagePath);
          if (pathExists) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: `SEO entry for path '${input.data.pagePath}' already exists`,
            });
          }
        }
        
        const updatedSeo = await ctx.services.seoAdminService.update(input.id, input.data);
        ctx.logger.log(`Admin successfully updated SEO ID: ${updatedSeo.id}`);
        return updatedSeo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error updating SEO ID ${input.id}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update SEO entry',
          cause: error,
        });
      }
    }),

  // Delete SEO entry
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Admin deleting SEO ID: ${input}`);
        
        const existing = await ctx.services.seoAdminService.findById(input);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `SEO with ID ${input} not found`,
          });
        }
        
        await ctx.services.seoAdminService.delete(input);
        ctx.logger.log(`Admin successfully deleted SEO ID: ${input}`);
        return { success: true, message: 'SEO entry deleted successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error deleting SEO ID ${input}:`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete SEO entry',
          cause: error,
        });
      }
    }),

  // Bulk operations
  bulkUpdate: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
      data: z.object({
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Admin bulk updating SEO entries: ${input.ids.join(', ')}`);
        const result = await ctx.services.seoAdminService.bulkUpdate(input.ids, input.data);
        ctx.logger.log(`Admin successfully bulk updated ${result.affected} SEO entries`);
        return { success: true, affected: result.affected };
      } catch (error) {
        ctx.logger.error('Error bulk updating SEO entries:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to bulk update SEO entries',
          cause: error,
        });
      }
    }),

  // Get SEO statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log('Admin fetching SEO statistics');
        const stats = await ctx.services.seoAdminService.getStatistics();
        return stats;
      } catch (error) {
        ctx.logger.error('Error fetching SEO statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve SEO statistics',
          cause: error,
        });
      }
    }),
}); 