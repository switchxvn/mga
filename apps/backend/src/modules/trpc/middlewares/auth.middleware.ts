import { TRPCError } from '@trpc/server';
import { initTRPC } from '@trpc/server';
import { TRPCContext } from '../contexts/trpc.context';

const t = initTRPC.context<TRPCContext>().create();

// List of admin role codes
const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'CONTENT_MANAGER',
  'CONTENT_EDITOR',
  'PRODUCT_MANAGER',
  'PRODUCT_EDITOR',
  'USER_MANAGER',
  'ADMIN'
];

export const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Bạn cần đăng nhập để thực hiện hành động này / You need to be logged in to perform this action',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    }
  });
});

export const isGuest = t.middleware(async ({ ctx, next }) => {
  if (ctx.user) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Bạn đã đăng nhập, không thể thực hiện hành động này / You are already logged in, cannot perform this action',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: null,
    }
  });
});

export const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Bạn cần đăng nhập để thực hiện hành động này / You need to be logged in to perform this action',
    });
  }

  const hasAdminRole = ctx.user.roles?.some(role => ADMIN_ROLES.includes(role.code)) ?? false;

  if (!hasAdminRole) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Bạn không có quyền thực hiện hành động này / You do not have permission to perform this action',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    }
  });
}); 