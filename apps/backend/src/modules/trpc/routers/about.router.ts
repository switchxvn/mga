import { Inject, Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { AboutAdminService } from '../../about/admin/services/about-admin.service';
import { AboutFrontendService } from '../../about/frontend/services/about-frontend.service';
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

@Injectable()
export class AboutRouter {
  constructor(
    private readonly trpc: TrpcService,
    @Inject(AboutAdminService)
    private readonly aboutAdminService: AboutAdminService,
    @Inject(AboutFrontendService)
    private readonly aboutFrontendService: AboutFrontendService,
  ) {}

  // Schema definitions
  private aboutPageSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    is_active: z.boolean().optional(),
  });

  private aboutSectionSchema = z.object({
    aboutPageId: z.number(),
    title: z.string(),
    content: z.string().optional(),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    order: z.number().optional(),
    sectionType: z.string().optional(),
    is_active: z.boolean().optional(),
  });

  private aboutTeamMemberSchema = z.object({
    aboutPageId: z.number(),
    name: z.string(),
    position: z.string(),
    bio: z.string().optional(),
    imageUrl: z.string().optional(),
    email: z.string().optional(),
    social_links: z.record(z.string()).optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
  });

  private aboutMilestoneSchema = z.object({
    aboutPageId: z.number(),
    year: z.string(),
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
  });
}

// Định nghĩa router cho trang giới thiệu
export const aboutRouter = router({
  getActiveSections: publicProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      const locale = input || 'en';
      return ctx.services.aboutFrontendService.getActiveSections(locale);
    }),

  getSectionById: publicProcedure
    .input(z.object({
      id: z.number(),
      locale: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const { id, locale = 'en' } = input;
      return ctx.services.aboutFrontendService.getSectionById(id, locale);
    }),

  // Admin procedures
  getAllPages: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const pages = await ctx.services.aboutAdminService.findAllPages();
        return {
          ...pages,
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
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch all about pages',
          cause: error,
        });
      }
    }),

  getPageById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.aboutAdminService.findPageById(input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch about page by id',
          cause: error,
        });
      }
    }),

  // Frontend routes
  getActiveTeamMembers: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.services.aboutFrontendService.getActiveTeamMembers();
    }),

  getActiveMilestones: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.services.aboutFrontendService.getActiveMilestones();
    }),

  // Admin routes
  admin: router({
    getAllPages: adminProcedure
      .query(async ({ ctx }) => {
        return ctx.services.aboutAdminService.findAllPages();
      }),

    getPageById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.findPageById(input.id);
      }),

    createPage: adminProcedure
      .input(z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        meta_title: z.string().optional(),
        meta_description: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.createPage(input);
      }),

    updatePage: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          subtitle: z.string().optional(),
          meta_title: z.string().optional(),
          meta_description: z.string().optional(),
          is_active: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.updatePage(input.id, input.data);
      }),

    deletePage: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.deletePage(input.id);
      }),

    // Section routes
    getSectionById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.findSectionById(input.id);
      }),

    createSection: adminProcedure
      .input(z.object({
        aboutPageId: z.number(),
        title: z.string(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        order: z.number().optional(),
        sectionType: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.createSection(input);
      }),

    updateSection: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          aboutPageId: z.number().optional(),
          title: z.string().optional(),
          content: z.string().optional(),
          imageUrl: z.string().optional(),
          videoUrl: z.string().optional(),
          order: z.number().optional(),
          sectionType: z.string().optional(),
          is_active: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.updateSection(input.id, input.data);
      }),

    deleteSection: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.deleteSection(input.id);
      }),

    // Team member routes
    getTeamMemberById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.findTeamMemberById(input.id);
      }),

    createTeamMember: adminProcedure
      .input(z.object({
        aboutPageId: z.number(),
        name: z.string(),
        position: z.string(),
        bio: z.string().optional(),
        imageUrl: z.string().optional(),
        email: z.string().optional(),
        social_links: z.record(z.string()).optional(),
        order: z.number().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.createTeamMember(input);
      }),

    updateTeamMember: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          aboutPageId: z.number().optional(),
          name: z.string().optional(),
          position: z.string().optional(),
          bio: z.string().optional(),
          imageUrl: z.string().optional(),
          email: z.string().optional(),
          social_links: z.record(z.string()).optional(),
          order: z.number().optional(),
          is_active: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.updateTeamMember(input.id, input.data);
      }),

    deleteTeamMember: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.deleteTeamMember(input.id);
      }),

    // Milestone routes
    getMilestoneById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.findMilestoneById(input.id);
      }),

    createMilestone: adminProcedure
      .input(z.object({
        aboutPageId: z.number(),
        year: z.string(),
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        order: z.number().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.createMilestone(input);
      }),

    updateMilestone: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          aboutPageId: z.number().optional(),
          year: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          order: z.number().optional(),
          is_active: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.updateMilestone(input.id, input.data);
      }),

    deleteMilestone: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.services.aboutAdminService.deleteMilestone(input.id);
      }),
  }),
}); 