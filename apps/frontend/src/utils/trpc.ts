import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/modules/trpc/routers';
import type { MenuItem } from '@ew/shared';

// Interface cho cấu trúc response từ API
interface ApiResponse<T> {
  result: {
    data: T;
  };
}

const getBaseUrl = () => {
  // Trong môi trường phát triển, frontend và backend có thể chạy trên các port khác nhau
  if (typeof window !== 'undefined') {
    // Trong môi trường trình duyệt, sử dụng URL tương đối để proxy trong vite hoạt động
    return process.env.API_BASE || 'http://localhost:3000';
  }
  // Trong môi trường server (SSR), cần URL đầy đủ
  return process.env.API_BASE || 'http://localhost:3000';
};

// Tạo mock tRPC client
const mockTrpc: any = {
  settings: {
    getAllMenuItems: {
      query: async () => {
        console.warn('Đang sử dụng mock data cho settings.getAllMenuItems.query');
        const mockMenuItem: MenuItem = {
          id: 1,
          label: "Trang chủ",
          href: "/",
          hasMegaMenu: false,
          order: 1,
          isActive: true,
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [mockMenuItem];
      }
    }
  }
};

// Tạo trpc client với type AppRouter
const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        // Kiểm tra xem có đang ở môi trường client không trước khi truy cập localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        console.log('tRPC client using URL:', `${getBaseUrl()}/api/trpc`);
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});

// Sử dụng trpc client thực tế
export const trpc = trpcClient; 

// Nếu muốn sử dụng mock data, hãy uncomment dòng dưới đây và comment dòng trên
// export const trpc = mockTrpc; 