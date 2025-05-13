import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { Permissions } from '../../../auth/constants/permissions.constant';
import { requirePermission } from '../../middlewares/permission.middleware';

const heroSliderSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string(),
  buttonText: z.string().nullable().optional(),
  buttonLink: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  themeId: z.number().nullable().optional()
});

export const heroSliderAdminRouter = router({
  getAll: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.object({ themeId: z.number().nullable().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.heroSliderService.findAll(input.themeId);
    }),

  getById: adminProcedure
    .use(requirePermission(Permissions.VIEW_CONTENT))
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.services.heroSliderService.findOne(input);
    }),

  create: adminProcedure
    .use(requirePermission(Permissions.CREATE_CONTENT))
    .input(heroSliderSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.heroSliderService.create(input);
    }),

  update: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(z.object({ id: z.number(), data: heroSliderSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.heroSliderService.update(input.id, input.data);
    }),

  delete: adminProcedure
    .use(requirePermission(Permissions.DELETE_CONTENT))
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.services.heroSliderService.remove(input);
      return { success: true };
    }),

  reorder: adminProcedure
    .use(requirePermission(Permissions.EDIT_CONTENT))
    .input(z.array(z.object({ id: z.number(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
      for (const item of input) {
        await ctx.services.heroSliderService.update(item.id, { order: item.order });
      }
      return { success: true };
    })
}); 