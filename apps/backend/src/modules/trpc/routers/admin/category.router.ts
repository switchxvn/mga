import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';
import { BadRequestException } from '@nestjs/common';
import { CategoryType } from '@ew/shared';
import { UpdateCategoryData, CategoryTranslationData, CreateCategoryData } from '../../../category/admin/services/category-admin.service';

const translationSchema = z.object({
  locale: z.string().min(2),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().nullable().optional()
}).strict();

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(CategoryType),
  active: z.boolean().default(true),
  translations: z.array(z.object({
    locale: z.string().min(2),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().nullable().optional()
  })).min(1, 'At least one translation is required')
}).strict();

const updateCategorySchema = z.object({
  id: z.number(),
  data: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    type: z.nativeEnum(CategoryType).optional(),
    active: z.boolean().optional(),
    translations: z.array(z.object({
      locale: z.string().min(2),
      name: z.string().min(1, 'Name is required'),
      slug: z.string().min(1, 'Slug is required'),
      description: z.string().nullable().optional()
    })).min(1, 'At least one translation is required').optional()
  }).strict()
}).strict();

export const categoryAdminRouter = router({
  getCategoryById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        ctx.logger.log(`Admin fetching category by ID: ${input}`);
        const category = await ctx.services.categoryAdminService.findOne(input);

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

  getAllCategories: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).default(10),
        search: z.string().default(''),
        active: z.boolean().nullable().default(null),
        type: z.enum(['news', 'product', 'both']).optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        console.log('getAllCategories called with input:', input);
        
        const result = await ctx.services.categoryAdminService.getCategories({
          page: input.page,
          limit: input.limit,
          search: input.search,
          active: input.active,
          type: input.type,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder
        });

        console.log('getAllCategories result:', {
          totalItems: result.total,
          itemsCount: result.items.length,
          currentPage: input.page,
          limit: input.limit
        });

        return {
          categories: result.items,
          total: result.total,
          totalPages: Math.ceil(result.total / input.limit),
          currentPage: input.page,
          limit: input.limit
        };
      } catch (error) {
        console.error('Error in getAllCategories:', error);
        ctx.logger.error('Failed to fetch categories:', {
          error,
          input,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
          cause: error,
        });
      }
    }),

  deleteCategory: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .input(z.number())
    .mutation(async ({ ctx, input: id }) => {
      try {
        await ctx.services.categoryAdminService.deleteCategory(id);
        return { success: true };
      } catch (error) {
        ctx.logger.error('Failed to delete category:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete category',
          cause: error,
        });
      }
    }),

  createCategory: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.services.categoryAdminService.create(input as CreateCategoryData);
        return category;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        
        // Handle duplicate slug error
        if (error instanceof Error && error.message.includes('Slug')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: error.message,
          });
        }

        ctx.logger.error('Failed to create category:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category',
          cause: error,
        });
      }
    }),

  updateCategory: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedCategory = await ctx.services.categoryAdminService.updateCategory(input.id, input.data as UpdateCategoryData);
        return updatedCategory;
      } catch (error) {
        // Handle duplicate slug error
        if (error instanceof Error && error.message.includes('Slug')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: error.message,
          });
        }

        ctx.logger.error('Failed to update category:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category',
          cause: error,
        });
      }
    })
}); 