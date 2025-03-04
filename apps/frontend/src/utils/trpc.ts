import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../backend/src/modules/trpc/routers';

// Interface cho cấu trúc response từ API
interface ApiResponse<T> {
  result: {
    data: T;
  };
}

// Interface cho menu item
interface MenuItem {
  id: number;
  label: string;
  href: string;
  hasMegaMenu: boolean;
  icon: string | null;
  order: number;
  isActive: boolean;
  parentId: number | null;
  megaMenuColumns: any[] | null;
  createdAt: string;
  updatedAt: string;
  parent: any | null;
  children: any[];
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
        // Trả về cấu trúc giống với API thực tế
        return {
          result: {
            data: [
              {
                id: 1,
                label: "Trang chủ",
                href: "/",
                hasMegaMenu: false,
                icon: null,
                order: 1,
                isActive: true,
                parentId: null,
                megaMenuColumns: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                parent: null,
                children: []
              },
              {
                id: 2,
                label: "Sản phẩm",
                href: "/products",
                hasMegaMenu: true,
                icon: null,
                order: 2,
                isActive: true,
                parentId: null,
                megaMenuColumns: [
                  {
                    items: [
                      { href: "/products/phones", label: "Điện thoại" },
                      { href: "/products/laptops", label: "Laptop" },
                      { href: "/products/tablets", label: "Máy tính bảng" },
                      { href: "/products/accessories", label: "Phụ kiện" }
                    ],
                    title: "Danh mục sản phẩm"
                  },
                  {
                    items: [
                      { href: "/products/brand/apple", label: "Apple" },
                      { href: "/products/brand/samsung", label: "Samsung" },
                      { href: "/products/brand/xiaomi", label: "Xiaomi" },
                      { href: "/products/brand/asus", label: "Asus" }
                    ],
                    title: "Thương hiệu"
                  }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                parent: null,
                children: []
              },
              {
                id: 3,
                label: "Giới thiệu",
                href: "/about",
                hasMegaMenu: false,
                icon: null,
                order: 3,
                isActive: true,
                parentId: null,
                megaMenuColumns: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                parent: null,
                children: []
              }
            ]
          }
        } as ApiResponse<MenuItem[]>;
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

// Tạm thời sử dụng mock data cho đến khi backend hoạt động đúng
export const trpc = trpcClient; 

// Nếu muốn sử dụng mock data, hãy uncomment dòng dưới đây và comment dòng trên
// export const trpc = mockTrpc; 