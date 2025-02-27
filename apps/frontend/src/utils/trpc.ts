import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  return `http://localhost:${process.env.PORT || 3000}`;
};

// Tạo trpc client với type any
const trpcClient = createTRPCProxyClient<any>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
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

// Tạo các mock router
const mockTrpc: any = {
  auth: {
    login: {
      mutate: async (credentials: any) => {
        console.warn('Router auth.login.mutate không tồn tại hoặc chưa được triển khai');
        return { token: 'mock-token' };
      }
    },
    register: {
      mutate: async (credentials: any) => {
        console.warn('Router auth.register.mutate không tồn tại hoặc chưa được triển khai');
        return { token: 'mock-token' };
      }
    },
    logout: {
      mutate: async () => {
        console.warn('Router auth.logout.mutate không tồn tại hoặc chưa được triển khai');
        return { success: true };
      }
    },
    me: {
      query: async () => {
        console.warn('Router auth.me.query không tồn tại hoặc chưa được triển khai');
        return { id: 'mock-id', name: 'Mock User', email: 'mock@example.com' };
      }
    }
  },
  post: {
    all: {
      query: async () => {
        console.warn('Router post.all.query không tồn tại hoặc chưa được triển khai');
        return [
          { id: '1', title: 'Mock Post 1', content: 'Mock content 1' },
          { id: '2', title: 'Mock Post 2', content: 'Mock content 2' }
        ];
      }
    },
    byId: {
      query: async (id: string) => {
        console.warn('Router post.byId.query không tồn tại hoặc chưa được triển khai');
        return { id, title: 'Mock Post', content: 'Mock content' };
      }
    }
  },
  example: {
    hello: {
      query: async (params: any) => {
        console.warn('Router example.hello.query không tồn tại hoặc chưa được triển khai');
        return { greeting: `Hello, ${params?.name || 'World'}!` };
      }
    }
  },
  user: {
    profile: {
      query: async () => {
        console.warn('Router user.profile.query không tồn tại hoặc chưa được triển khai');
        return { id: 'mock-id', name: 'Mock User', email: 'mock@example.com' };
      }
    }
  }
};

// Export trpc client
export const trpc = mockTrpc; 