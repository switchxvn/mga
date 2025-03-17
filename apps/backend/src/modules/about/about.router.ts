import { Injectable } from '@nestjs/common';
import { TrpcService } from '@/trpc/trpc.service';
import { AboutFrontendService } from './frontend/services/about-frontend.service';
import { AboutAdminService } from './admin/services/about-admin.service';
import { z } from 'zod';

@Injectable()
export class AboutRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly aboutFrontendService: AboutFrontendService,
    private readonly aboutAdminService: AboutAdminService,
  ) {}

  public router = this.trpc.router({
    getActivePage: this.trpc.procedure
      .input(z.string().optional())
      .query(async ({ input: languageCode }) => {
        if (languageCode) {
          return this.aboutFrontendService.getActivePageTranslation(languageCode);
        }
        return this.aboutFrontendService.getActivePage({
          relations: {
            translations: true,
            sections: {
              translations: true,
            },
            teamMembers: {
              translations: true,
            },
            milestones: {
              translations: true,
            },
          },
        });
      }),

    getActivePageWithoutTranslations: this.trpc.procedure
      .query(async () => {
        return this.aboutFrontendService.getActivePage({
          relations: {
            sections: true,
            teamMembers: true,
            milestones: true
          }
        });
      }),

    // Admin procedures
    getAllPages: this.trpc.procedure
      .query(async () => {
        return this.aboutAdminService.getAllPages({
          relations: {
            translations: true,
            sections: {
              translations: true,
            },
            teamMembers: {
              translations: true,
            },
            milestones: {
              translations: true,
            },
          },
        });
      }),

    getPageById: this.trpc.procedure
      .input(z.string())
      .query(async ({ input }) => {
        return this.aboutAdminService.getPageById(input, {
          relations: {
            translations: true,
            sections: {
              translations: true,
            },
            teamMembers: {
              translations: true,
            },
            milestones: {
              translations: true,
            },
          },
        });
      }),
  });
} 