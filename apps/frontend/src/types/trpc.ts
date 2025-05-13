import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter as BackendAppRouter } from '@backend/modules/trpc/routers';

// Định nghĩa rõ ràng cho AppRouter từ backend
export type AppRouter = BackendAppRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// Kiểu dữ liệu cho SiteStatisticsSettings
interface SiteStatisticsSettings {
  id: number;
  is_enabled: boolean;
  display_in_footer: boolean;
  display_items: string[];
  style_settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Kiểu dữ liệu cho SiteStatistics
interface SiteStatistics {
  id: number;
  key: string;
  value: string;
  value_number: number;
  display_name: string;
  icon?: string;
  description?: string;
  is_visible: boolean;
  display_order: number;
  translations?: Array<{
    locale: string;
    display_name: string;
    description?: string;
  }>;
}

// Thêm định nghĩa cho router SiteStatistics
declare module '@backend/modules/trpc/routers' {
  interface AppRouter {
    siteStatistics: {
      getSettings: {
        query: () => Promise<SiteStatisticsSettings>;
      };
      getVisibleStatistics: {
        query: (input: { locale: string }) => Promise<SiteStatistics[]>;
      };
      trackVisit: {
        mutate: (input: { sessionId: string }) => Promise<{ success: boolean }>;
      };
      registerOnlineUser: {
        mutate: (input: { sessionId: string }) => Promise<{ success: boolean }>;
      };
    };
  }
}

// Thêm định nghĩa cho router UserSession
declare module '@backend/modules/trpc/routers' {
  interface AppRouter {
    userSession: {
      startSession: {
        mutate: (input: {
          sessionId: string;
          userId?: number | null;
          ipAddress?: string;
          userAgent?: string;
          deviceInfo?: Record<string, any>;
          referrer?: string;
          landingPage?: string;
        }) => Promise<any>;
      };
      updateSession: {
        mutate: (input: {
          sessionId: string;
          lastActivity?: Date;
          pageViews?: number;
          exitPage?: string;
          isActive?: boolean;
        }) => Promise<any>;
      };
      endSession: {
        mutate: (input: {
          sessionId: string;
          exitPage?: string;
        }) => Promise<any>;
      };
      getActiveUserCount: {
        query: () => Promise<number>;
      };
    };
  }
} 