import { publicProcedure, router } from '../../../trpc';
import { logoService } from '../services/logo.service';
import { z } from 'zod';

export const logoRouter = router({
  getActiveLogo: publicProcedure
    .input(z.object({
      type: z.string().default('main')
    }))
    .query(async ({ input }) => {
      const logo = await logoService.findOneByType(input.type);
      return logo;
    }),
}); 