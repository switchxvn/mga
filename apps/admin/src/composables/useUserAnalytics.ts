import { ref, reactive } from 'vue';
import { useTrpc } from './useTrpc';
import { useNotification } from './useNotification';

interface PageVisit {
  id: number;
  session?: {
    id: number;
  };
  pageUrl: string;
  referrer: string;
  entryTime: string;
  exitTime: string | null;
  timeOnPage: number;
  isLandingPage: boolean;
  isExitPage: boolean;
}

interface PageItem {
  page: string;
  count: number;
}

interface ReferrerItem {
  referrer: string;
  count: number;
}

interface PageMetrics {
  totalPageViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

interface SessionMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  newUsers: number;
  returningUsers: number;
}

interface PageVisitsResponse {
  items: PageVisit[];
  total: number;
  totalPages: number;
  page: number;
}

export function useUserAnalytics() {
  const trpc = useTrpc();
  const { showSuccess, showError } = useNotification();
  
  const loading = ref(false);
  const pageVisits = ref<PageVisit[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const pageSize = ref(10);
  const activeSessionsCount = ref(0);
  
  const pageMetrics = reactive<PageMetrics>({
    totalPageViews: 0,
    averageTimeOnPage: 0,
    bounceRate: 0
  });
  
  const sessionMetrics = reactive<SessionMetrics>({
    totalSessions: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    newUsers: 0,
    returningUsers: 0
  });
  
  const topReferrers = ref<ReferrerItem[]>([]);
  const topLandingPages = ref<PageItem[]>([]);
  const topExitPages = ref<PageItem[]>([]);
  
  // User Session Functions
  const fetchSessions = async (params: any) => {
    try {
      loading.value = true;
      const response = await trpc.admin.userSession.findAll.query(params);
      
      if (response) {
        return {
          items: response.items,
          total: response.total,
          totalPages: response.totalPages,
          page: response.page
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showError('Không thể tải danh sách phiên');
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchActiveSessionsCount = async () => {
    try {
      const count = await trpc.admin.userSession.getActiveSessionsCount.query();
      activeSessionsCount.value = count;
      return count;
    } catch (error) {
      console.error('Error fetching active sessions count:', error);
      return 0;
    }
  };
  
  const fetchSessionMetrics = async (params?: { startDate?: Date; endDate?: Date }) => {
    try {
      const metrics = await trpc.admin.userSession.getSessionMetrics.query(params || {});
      Object.assign(sessionMetrics, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching session metrics:', error);
      return null;
    }
  };
  
  const cleanupExpiredSessions = async () => {
    try {
      loading.value = true;
      const cleanedCount = await trpc.admin.userSession.cleanupExpiredSessions.mutate();
      showSuccess(`Đã dọn dẹp ${cleanedCount} phiên hết hạn`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      showError('Không thể dọn dẹp phiên hết hạn');
      return 0;
    } finally {
      loading.value = false;
    }
  };
  
  const deleteSession = async (id: number) => {
    try {
      loading.value = true;
      await trpc.admin.userSession.deleteSession.mutate({ id });
      showSuccess('Đã xóa phiên thành công');
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      showError('Không thể xóa phiên');
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Page Visit Functions
  const fetchPageVisits = async (params: any) => {
    try {
      loading.value = true;
      const response = await trpc.admin.userPageVisit.getPageVisits.query(params);
      
      if (response) {
        pageVisits.value = response.items;
        totalPages.value = response.totalPages;
        totalItems.value = response.total;
        currentPage.value = response.page;
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error fetching page visits:', error);
      showError('Không thể tải dữ liệu lượt truy cập');
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchPageMetrics = async (params?: { startDate?: Date; endDate?: Date }) => {
    try {
      const metrics = await trpc.admin.userPageVisit.getPageVisitMetrics.mutate(params || {});
      Object.assign(pageMetrics, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching page metrics:', error);
      return null;
    }
  };
  
  const fetchTopReferrers = async (limit: number = 10) => {
    try {
      const referrers = await trpc.admin.userPageVisit.getTopReferrers.mutate({ limit });
      topReferrers.value = referrers;
      return referrers;
    } catch (error) {
      console.error('Error fetching top referrers:', error);
      return [];
    }
  };
  
  const fetchTopLandingPages = async (limit: number = 5) => {
    try {
      const pages = await trpc.admin.userPageVisit.getTopLandingPages.mutate({ limit });
      topLandingPages.value = pages;
      return pages;
    } catch (error) {
      console.error('Error fetching top landing pages:', error);
      return [];
    }
  };
  
  const fetchTopExitPages = async (limit: number = 5) => {
    try {
      const pages = await trpc.admin.userPageVisit.getTopExitPages.mutate({ limit });
      topExitPages.value = pages;
      return pages;
    } catch (error) {
      console.error('Error fetching top exit pages:', error);
      return [];
    }
  };
  
  const deletePageVisit = async (id: number) => {
    try {
      loading.value = true;
      await trpc.admin.userPageVisit.deletePageVisit.mutate(id);
      showSuccess('Đã xóa lượt truy cập');
      return true;
    } catch (error) {
      console.error('Error deleting page visit:', error);
      showError('Không thể xóa lượt truy cập');
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (remainingSeconds > 0 || result === '') result += `${remainingSeconds}s`;
    
    return result.trim();
  };
  
  return {
    // State
    loading,
    pageVisits,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    activeSessionsCount,
    pageMetrics,
    sessionMetrics,
    topReferrers,
    topLandingPages,
    topExitPages,
    
    // Session functions
    fetchSessions,
    fetchActiveSessionsCount,
    fetchSessionMetrics,
    cleanupExpiredSessions,
    deleteSession,
    
    // Page visit functions
    fetchPageVisits,
    fetchPageMetrics,
    fetchTopReferrers,
    fetchTopLandingPages,
    fetchTopExitPages,
    deletePageVisit,
    
    // Utility functions
    formatDateTime,
    formatDuration
  };
} 