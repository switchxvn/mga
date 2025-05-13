import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { useTrpc } from './useTrpc';

export function useUserSession() {
  const toast = useToast();
  const router = useRouter();
  const trpc = useTrpc();
  
  const loading = ref(true);
  const pageVisitsLoading = ref(true);
  const session = ref<any>(null);
  const pageVisits = ref<any[]>([]);

  /**
   * Lấy thông tin phiên người dùng theo ID
   */
  async function fetchSessionData(sessionId: number) {
    try {
      loading.value = true;
      
      const result = await trpc.admin.userSession.getSessionById.query(sessionId);
      
      if (result) {
        session.value = result;
        await fetchPageVisits();
      } else {
        toast.error('Không tìm thấy thông tin phiên');
      }
    } catch (error: any) {
      console.error('Error fetching session data:', error);
      toast.error(error.message || 'Không thể tải thông tin phiên');
    } finally {
      loading.value = false;
    }
  }

  /**
   * Lấy danh sách lịch sử duyệt trang của phiên
   */
  async function fetchPageVisits() {
    try {
      pageVisitsLoading.value = true;
      
      if (!session.value) return;
      
      const result = await trpc.admin.userPageVisit.getSessionPageVisits.query({
        sessionId: session.value.sessionId,
        page: 1,
        limit: 100
      });
      
      if (result && result.items) {
        pageVisits.value = result.items;
      }
    } catch (error: any) {
      console.error('Error fetching page visits:', error);
      toast.error(error.message || 'Không thể tải lịch sử duyệt trang');
    } finally {
      pageVisitsLoading.value = false;
    }
  }

  /**
   * Kết thúc phiên người dùng
   */
  async function endSession() {
    if (!session.value || !session.value.isActive) return;
    
    try {
      loading.value = true;
      
      await trpc.admin.userSession.deleteSession.mutate(session.value.id);
      
      toast.success('Đã kết thúc phiên thành công');
      await fetchSessionData(session.value.id);
    } catch (error: any) {
      console.error('Error ending session:', error);
      toast.error(error.message || 'Không thể kết thúc phiên');
    } finally {
      loading.value = false;
    }
  }

  /**
   * Xóa phiên người dùng
   */
  async function deleteSession() {
    if (!session.value) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa phiên này?')) {
      return;
    }
    
    try {
      loading.value = true;
      
      await trpc.admin.userSession.deleteSession.mutate(session.value.id);
      
      toast.success('Đã xóa phiên thành công');
      router.push('/user-session');
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast.error(error.message || 'Không thể xóa phiên');
    } finally {
      loading.value = false;
    }
  }

  /**
   * Format date string
   */
  function formatDate(dateString: string | Date | null) {
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
  }

  /**
   * Format duration in seconds to human readable string
   */
  function formatDuration(seconds: number) {
    if (!seconds) return '0 giây';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    if (hours > 0) {
      result += `${hours} giờ `;
    }
    if (minutes > 0) {
      result += `${minutes} phút `;
    }
    if (remainingSeconds > 0 || result === '') {
      result += `${remainingSeconds} giây`;
    }
    
    return result.trim();
  }

  /**
   * Format user agent to more readable string
   */
  function formatUserAgent(userAgent: string | null) {
    if (!userAgent) return null;
    
    // Rút gọn user agent để hiển thị thân thiện hơn
    if (userAgent.length > 50) {
      const browserInfo = userAgent.split(' ');
      if (browserInfo.length > 2) {
        return browserInfo.slice(0, 2).join(' ') + '...';
      }
    }
    
    return userAgent;
  }

  return {
    loading,
    pageVisitsLoading,
    session,
    pageVisits,
    fetchSessionData,
    fetchPageVisits,
    endSession,
    deleteSession,
    formatDate,
    formatDuration,
    formatUserAgent
  };
} 