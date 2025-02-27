import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';

export const postRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      const posts = await ctx.repositories.posts.find({
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
      return posts;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        cause: error,
      });
    }
  }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        const post = await ctx.repositories.posts.findOne({
          where: { id: input },
          relations: ['author'],
        });
        
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${input} not found`,
          });
        }
        
        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to create a post',
          });
        }
        
        const post = ctx.repositories.posts.create({
          ...input,
          authorId: ctx.user.id,
        });
        
        return await ctx.repositories.posts.save(post);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        
        const post = await ctx.repositories.posts.findOne({
          where: { id },
        });
        
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${id} not found`,
          });
        }
        
        if (post.authorId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update your own posts',
          });
        }
        
        Object.assign(post, data);
        return await ctx.repositories.posts.save(post);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const post = await ctx.repositories.posts.findOne({
          where: { id: input },
        });
        
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post with ID ${input} not found`,
          });
        }
        
        if (post.authorId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only delete your own posts',
          });
        }
        
        await ctx.repositories.posts.remove(post);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }
    }),
}); 