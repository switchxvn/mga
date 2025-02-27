import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../backend/src/modules/trpc/routers';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  return `http://localhost:${process.env.PORT || 3000}`;
};

// Tạo mock tRPC client
const mockTrpc: any = {
  auth: {
    login: {
      mutate: async (credentials: any) => {
        console.warn('Đang sử dụng mock data cho auth.login.mutate');
        return { 
          token: 'mock-token',
          tokenData: { sub: 'mock-user-id' },
          user: { id: 'mock-id', name: 'Mock User', email: 'mock@example.com' }
        };
      }
    },
    register: {
      mutate: async (credentials: any) => {
        console.warn('Đang sử dụng mock data cho auth.register.mutate');
        return { 
          token: 'mock-token',
          user: { id: 'mock-id', name: credentials.name, email: credentials.email }
        };
      }
    },
    logout: {
      mutate: async () => {
        console.warn('Đang sử dụng mock data cho auth.logout.mutate');
        return { success: true };
      }
    },
    me: {
      query: async () => {
        console.warn('Đang sử dụng mock data cho auth.me.query');
        return { id: 'mock-id', name: 'Mock User', email: 'mock@example.com' };
      }
    }
  },
  post: {
    all: {
      query: async () => {
        console.warn('Đang sử dụng mock data cho post.all.query');
        return [
          { 
            id: '1', 
            title: 'Mock Post 1', 
            content: 'Mock content 1',
            createdAt: new Date().toISOString(),
            author: { name: 'Mock Author' }
          },
          { 
            id: '2', 
            title: 'Mock Post 2', 
            content: 'Mock content 2',
            createdAt: new Date().toISOString(),
            author: { name: 'Mock Author' }
          }
        ];
      }
    },
    byId: {
      query: async (id: string) => {
        console.warn('Đang sử dụng mock data cho post.byId.query');
        return { 
          id, 
          title: 'Mock Post', 
          content: 'Mock content',
          createdAt: new Date().toISOString(),
          author: { name: 'Mock Author' }
        };
      }
    }
  },
  example: {
    hello: {
      query: async (params: any) => {
        console.warn('Đang sử dụng mock data cho example.hello.query');
        return { greeting: `Hello, ${params?.name || 'World'}!` };
      }
    }
  },
  user: {
    profile: {
      query: async () => {
        console.warn('Đang sử dụng mock data cho user.profile.query');
        return { id: 'mock-id', name: 'Mock User', email: 'mock@example.com' };
      }
    }
  }
};

// Tạo trpc client với type AppRouter
const trpcClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson as any,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        // Kiểm tra xem có đang ở môi trường client không trước khi truy cập localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});

// Tạm thời sử dụng mock data cho đến khi backend hoạt động đúng
export const trpc = mockTrpc; 