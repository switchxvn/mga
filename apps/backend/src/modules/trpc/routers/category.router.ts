import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { z } from 'zod';

export const categoryRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    try {
      ctx.logger.log('Fetching all categories');
      // Giả lập danh sách danh mục (trong thực tế, bạn sẽ lấy từ database)
      const categories = [
        { id: 1, name: 'Tin tức', slug: 'tin-tuc' },
        { id: 2, name: 'Công nghệ', slug: 'cong-nghe' },
        { id: 3, name: 'Kinh doanh', slug: 'kinh-doanh' },
        { id: 4, name: 'Giáo dục', slug: 'giao-duc' },
        { id: 5, name: 'Sức khỏe', slug: 'suc-khoe' },
        { id: 6, name: 'Du lịch', slug: 'du-lich' },
      ];
      return categories;
    } catch (error) {
      ctx.logger.error(`Error fetching all categories: ${error instanceof Error ? error.message : String(error)}`);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve categories',
        cause: error,
      });
    }
  }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching category by ID: ${input}`);
        // Giả lập lấy danh mục theo ID (trong thực tế, bạn sẽ lấy từ database)
        const categories = [
          { id: 1, name: 'Tin tức', slug: 'tin-tuc' },
          { id: 2, name: 'Công nghệ', slug: 'cong-nghe' },
          { id: 3, name: 'Kinh doanh', slug: 'kinh-doanh' },
          { id: 4, name: 'Giáo dục', slug: 'giao-duc' },
          { id: 5, name: 'Sức khỏe', slug: 'suc-khoe' },
          { id: 6, name: 'Du lịch', slug: 'du-lich' },
        ];
        
        const category = categories.find(c => c.id === input);

        if (!category) {
          ctx.logger.warn(`Category not found for ID: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Category with ID ${input} not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved category ID: ${input}`);
        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching category by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve category',
          cause: error,
        });
      }
    }),

  bySlug: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching category by slug: ${input}`);
        // Giả lập lấy danh mục theo slug (trong thực tế, bạn sẽ lấy từ database)
        const categories = [
          { id: 1, name: 'Tin tức', slug: 'tin-tuc' },
          { id: 2, name: 'Công nghệ', slug: 'cong-nghe' },
          { id: 3, name: 'Kinh doanh', slug: 'kinh-doanh' },
          { id: 4, name: 'Giáo dục', slug: 'giao-duc' },
          { id: 5, name: 'Sức khỏe', slug: 'suc-khoe' },
          { id: 6, name: 'Du lịch', slug: 'du-lich' },
        ];
        
        const category = categories.find(c => c.slug === input);

        if (!category) {
          ctx.logger.warn(`Category not found for slug: ${input}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Category with slug "${input}" not found`,
          });
        }

        ctx.logger.debug(`Successfully retrieved category with slug: ${input}`);
        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching category by slug ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve category',
          cause: error,
        });
      }
    }),
}); 