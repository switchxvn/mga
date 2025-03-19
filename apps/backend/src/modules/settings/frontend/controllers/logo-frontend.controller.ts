import { Controller } from '@nestjs/common';
import { LogoFrontendService } from '../services/logo-frontend.service';
import { publicProcedure, router } from '../../../../trpc';
import { z } from 'zod';

@Controller()
export class LogoFrontendController {
  constructor(private readonly logoService: LogoFrontendService) {}

  public router = router({
    getActiveLogo: publicProcedure
      .input(z.object({
        type: z.string().default('main')
      }))
      .query(async ({ input }) => {
        return this.logoService.findOneByType(input.type);
      }),
  });
} 