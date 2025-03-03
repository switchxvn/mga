import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../backend/src/modules/trpc/routers';

const getBaseUrl = () => {
  // Trong môi trường phát triển, frontend và backend có thể chạy trên các port khác nhau
  if (typeof window !== 'undefined') {
    // Trong môi trường trình duyệt, sử dụng URL tương đối để proxy trong vite hoạt động
    return '';
  }
  // Trong môi trường server (SSR), cần URL đầy đủ
  return process.env.API_BASE || 'http://localhost:3000';
};

// Tạo mock tRPC client
const mockTrpc: any = {
  auth: {
    login: {
      mutate: async (credentials: any) => {
        console.warn('Đang sử dụng mock data cho auth.login.mutate');
        const tokenData = { 
          sub: 1, 
          email: 'mock@example.com' 
        };
        return { 
          user: { 
            id: 1, 
            name: 'Mock User', 
            email: 'mock@example.com',
            isActive: true,
            isEmailVerified: false,
            username: 'mockuser',
            lastLoginAt: new Date().toISOString(),
            bio: '',
            posts: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          tokenData,
          token: btoa(JSON.stringify(tokenData))
        };
      }
    },
    register: {
      mutate: async (credentials: any) => {
        console.warn('Đang sử dụng mock data cho auth.register.mutate');
        return { 
          user: { 
            id: 1, 
            name: credentials.name, 
            email: credentials.email,
            isActive: true,
            isEmailVerified: false,
            username: '',
            lastLoginAt: null,
            bio: '',
            posts: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          message: 'User registered successfully'
        };
      }
    },
    logout: {
      mutate: async () => {
        console.warn('Đang sử dụng mock data cho auth.logout.mutate');
        return { success: true, message: 'Logged out successfully' };
      }
    },
    me: {
      query: async () => {
        console.warn('Đang sử dụng mock data cho auth.me.query');
        return { 
          id: 1, 
          name: 'Mock User', 
          email: 'mock@example.com',
          isActive: true,
          isEmailVerified: false,
          username: 'mockuser',
          lastLoginAt: new Date().toISOString(),
          bio: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }
  },
  post: {
    all: {
      query: async () => {
        console.warn('Đang sử dụng mock data cho post.all.query');
        return [
          { 
            id: 1, 
            title: 'Mock Post 1', 
            content: 'Mock content 1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
            authorId: 1,
            author: { name: 'Mock Author' }
          },
          { 
            id: 2, 
            title: 'Mock Post 2', 
            content: 'Mock content 2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
            authorId: 1,
            author: { name: 'Mock Author' }
          }
        ];
      }
    },
    byId: {
      query: async (id: string) => {
        console.warn('Đang sử dụng mock data cho post.byId.query');
        return { 
          id: Number(id), 
          title: 'Mock Post', 
          content: 'Mock content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          published: true,
          authorId: 1,
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
        return { 
          id: 1, 
          name: 'Mock User', 
          email: 'mock@example.com',
          isActive: true,
          isEmailVerified: false,
          username: 'mockuser',
          lastLoginAt: new Date().toISOString(),
          bio: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
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