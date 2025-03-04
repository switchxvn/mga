import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc.service';
import { FooterAdminService } from '../../modules/footer/admin/services/footer-admin.service';
import { FooterFrontendService } from '../../modules/footer/frontend/services/footer-frontend.service';
import { createFooterSchema, updateFooterSchema } from '@ew/shared';

@Injectable()
export class FooterRouter {
  constructor(
    private readonly trpc: TrpcService,
    @Inject(FooterAdminService)
    private readonly footerAdminService: FooterAdminService,
    @Inject(FooterFrontendService)
    private readonly footerFrontendService: FooterFrontendService,
  ) {}

  router = this.trpc.router({
    // Admin procedures
    adminCreate: this.trpc.procedure
      .input(createFooterSchema)
      .mutation(({ input }) => {
        return this.footerAdminService.create(input);
      }),

    adminUpdate: this.trpc.procedure
      .input(z.object({
        id: z.number(),
        data: updateFooterSchema,
      }))
      .mutation(({ input }) => {
        return this.footerAdminService.update(input.id, input.data);
      }),

    adminDelete: this.trpc.procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return this.footerAdminService.delete(input.id);
      }),

    adminFindAll: this.trpc.procedure
      .query(() => {
        return this.footerAdminService.findAll();
      }),

    adminFindOne: this.trpc.procedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return this.footerAdminService.findOne(input.id);
      }),

    adminSetActive: this.trpc.procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return this.footerAdminService.setActive(input.id);
      }),

    // Frontend procedures
    getActiveFooter: this.trpc.procedure
      .query(() => {
        return this.footerFrontendService.getActiveFooter();
      }),
  });
} 