import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useTrpc } from './useTrpc';
import { useUserStore } from '@/stores/useUserStore';

// Session storage key
const SESSION_ID_KEY = 'user_session_id';

// Session update interval in milliseconds (1 minute)
const UPDATE_INTERVAL = 60 * 1000; // Giảm xuống 1 phút thay vì 5 phút

// Hàm tạo ID ngẫu nhiên thay thế cho uuid
const generateRandomId = (): string => {
  // Tạo chuỗi ngẫu nhiên 16 ký tự
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
};

export const useUserSession = () => {
  console.log('useUserSession composable initialized');
  const trpc = useTrpc();
  const userStore = useUserStore();
  const sessionId = ref<string | null>(null);
  const isActive = ref(true);
  const pageViews = ref(0);
  const sessionStartTime = ref<Date | null>(null);
  const lastActivity = ref<Date | null>(null);
  const currentPage = ref<string | null>(null);
  const updateIntervalId = ref<NodeJS.Timeout | null>(null);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // Tạo hoặc lấy session ID từ localStorage
  const getOrCreateSessionId = (): string => {
    console.log('Getting or creating session ID');
    try {
      let id = localStorage.getItem(SESSION_ID_KEY);
      if (!id) {
        id = generateRandomId();
        localStorage.setItem(SESSION_ID_KEY, id);
        console.log('Created new session ID:', id);
      } else {
        console.log('Using existing session ID:', id);
      }
      return id;
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      // Fallback to in-memory ID if localStorage fails
      return generateRandomId();
    }
  };

  // Lấy session từ server
  const getSession = async (id: string) => {
    try {
      console.log('Getting session from server:', id);
      const session = await trpc.userSession.getSession.query({ sessionId: id });
      
      if (session) {
        console.log('Session found on server:', session);
        // Cập nhật các giá trị theo thông tin từ server
        sessionStartTime.value = new Date(session.startTime);
        lastActivity.value = new Date(); // Cập nhật thời gian hiện tại
        pageViews.value = session.pageViews;
        isActive.value = true;
        
        // Cập nhật session ngay lập tức để gửi lastActivity mới
        await updateSession();
        return true;
      }
      
      console.log('Session not found on server, will create new one');
      return false;
    } catch (err) {
      console.error('Error getting session:', err);
      return false;
    }
  };

  // Khởi tạo session
  const initSession = async () => {
    if (isInitialized.value) {
      console.log('Session already initialized, skipping');
      return sessionId.value;
    }
    
    console.log('Initializing user session');
    try {
      // Lấy thông tin trình duyệt
      const userAgent = navigator.userAgent;
      const deviceInfo = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        platform: navigator.platform,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Lấy thông tin trang hiện tại
      currentPage.value = window.location.pathname;
      
      // Lấy thông tin referrer
      const referrer = document.referrer;
      
      // Tạo hoặc lấy session ID
      const id = getOrCreateSessionId();
      sessionId.value = id;
      
      // Lấy user ID nếu đã đăng nhập
      const userId = userStore.user?.id || null;

      // Kiểm tra xem phiên đã tồn tại chưa
      const sessionExists = await getSession(id);
      
      if (!sessionExists) {
        console.log('Creating new session on server');
        // Gửi request khởi tạo session mới
        await trpc.userSession.startSession.mutate({
          sessionId: id,
          userId,
          ipAddress: undefined, // Sẽ được xác định bởi server
          userAgent,
          deviceInfo,
          referrer,
          landingPage: currentPage.value
        });

        console.log('Session started successfully');

        // Khởi tạo các giá trị theo dõi
        sessionStartTime.value = new Date();
        lastActivity.value = new Date();
        pageViews.value = 1;
        isActive.value = true;
      }

      // Thiết lập interval để cập nhật session định kỳ
      startUpdateInterval();
      isInitialized.value = true;

      return sessionId.value;
    } catch (err: any) {
      console.error('Error initializing session:', err);
      error.value = err?.message || 'Lỗi khởi tạo phiên';
      return null;
    }
  };

  // Cập nhật session khi có hoạt động
  const updateSession = async () => {
    try {
      if (!sessionId.value) {
        console.log('No session ID, skipping update');
        return;
      }

      // Luôn cập nhật thời gian hoạt động mới nhất
      const currentTime = new Date();
      const isoString = currentTime.toISOString();
      
      // DEBUG: Kiểm tra kiểu dữ liệu
      console.log('DEBUG - currentTime type:', typeof currentTime);
      console.log('DEBUG - currentTime instanceof Date:', currentTime instanceof Date);
      console.log('DEBUG - isoString type:', typeof isoString);
      console.log('DEBUG - isoString value:', isoString);
      
      console.log('Updating session with current time:', currentTime);
      
      const payload = {
        sessionId: sessionId.value,
        lastActivity: isoString,
        pageViews: pageViews.value,
        isActive: isActive.value
      };
      
      console.log('DEBUG - Sending payload:', JSON.stringify(payload));
      
      // Chuyển đổi Date thành chuỗi ISO để đảm bảo tương thích
      await trpc.userSession.updateSession.mutate(payload);
      
      // Cập nhật giá trị lastActivity sau khi gửi thành công
      lastActivity.value = currentTime;
      
      console.log('Session updated successfully');
    } catch (err: any) {
      console.error('Error updating session:', err);
      // In chi tiết lỗi hơn
      console.error('Error details:', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        cause: err?.cause
      });
      error.value = err?.message || 'Lỗi cập nhật phiên';
    }
  };

  // Kết thúc session
  const endSession = async () => {
    try {
      if (!sessionId.value) return;

      // Lưu trang hiện tại làm trang thoát
      const exitPage = window.location.pathname;

      console.log('Ending session:', {
        sessionId: sessionId.value,
        exitPage
      });

      await trpc.userSession.endSession.mutate({
        sessionId: sessionId.value,
        exitPage
      });

      console.log('Session ended successfully');

      // Xóa session ID khỏi localStorage để tạo session mới lần sau
      localStorage.removeItem(SESSION_ID_KEY);
      sessionId.value = null;
      isActive.value = false;
      isInitialized.value = false;

      // Dừng interval cập nhật
      stopUpdateInterval();

      return true;
    } catch (err: any) {
      console.error('Error ending session:', err);
      error.value = err?.message || 'Lỗi kết thúc phiên';
      return false;
    }
  };

  // Ghi nhận chuyển trang
  const trackPageView = (path: string) => {
    console.log('Tracking page view:', path);
    
    // Khởi tạo session nếu chưa có
    if (!sessionId.value || !isInitialized.value) {
      console.log('No session ID found or not initialized, initializing session first');
      initSession().then(() => {
        updatePageView(path);
      });
      return;
    }
    
    updatePageView(path);
  };
  
  const updatePageView = (path: string) => {
    currentPage.value = path;
    pageViews.value += 1;
    lastActivity.value = new Date();

    console.log('Updated page view count:', pageViews.value);
    
    // Cập nhật session sau khi người dùng chuyển trang
    updateSession();
  };

  // Bắt đầu interval cập nhật
  const startUpdateInterval = () => {
    console.log('Starting update interval');
    // Dừng interval hiện tại nếu có
    stopUpdateInterval();

    // Tạo interval mới để cập nhật session định kỳ
    updateIntervalId.value = setInterval(() => {
      if (isActive.value && sessionId.value) {
        console.log('Update interval triggered, updating session with current time');
        updateSession();
      }
    }, UPDATE_INTERVAL);
  };

  // Dừng interval cập nhật
  const stopUpdateInterval = () => {
    if (updateIntervalId.value) {
      console.log('Stopping update interval');
      clearInterval(updateIntervalId.value);
      updateIntervalId.value = null;
    }
  };

  // Force cập nhật thời gian hoạt động ngay lập tức
  const pingActivity = () => {
    console.log('Activity detected, updating lastActivity');
    lastActivity.value = new Date();
    updateSession();
  };

  // Xử lý sự kiện khi user không còn hoạt động
  const handleVisibilityChange = () => {
    const isVisible = document.visibilityState === 'visible';
    console.log('Visibility changed:', isVisible ? 'visible' : 'hidden');
    isActive.value = isVisible;
    
    // Cập nhật session khi trạng thái thay đổi
    if (isVisible) {
      // Nếu tab trở lại visible, cập nhật lastActivity
      lastActivity.value = new Date();
    }
    updateSession();
  };

  // Xử lý sự kiện trước khi trang được đóng
  const handleBeforeUnload = async () => {
    if (sessionId.value && isActive.value) {
      // Cập nhật lần cuối trước khi đóng trang
      try {
        const exitPage = window.location.pathname;
        
        console.log('Page unloading, sending final update via beacon API');
        
        // Sử dụng Beacon API để đảm bảo request được gửi ngay cả khi trang đóng
        const data = JSON.stringify({
          sessionId: sessionId.value,
          exitPage
        });
        
        // Tạo request thủ công vì trpc client không hỗ trợ Beacon API
        const result = navigator.sendBeacon('/api/trpc/userSession.endSession', data);
        console.log('Beacon API result:', result);
      } catch (error) {
        console.error('Error in beforeunload handler:', error);
      }
    }
  };

  // Hook lifecycle
  onMounted(() => {
    console.log('useUserSession onMounted');
    if (process.client) {
      console.log('Running on client, initializing session');
      // Khởi tạo session khi component mount
      initSession();
      
      // Lắng nghe các sự kiện
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Lắng nghe các sự kiện người dùng để cập nhật hoạt động
      ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        document.addEventListener(event, pingActivity, { passive: true });
      });
    } else {
      console.log('Running on server, skipping initialization');
    }
  });

  onUnmounted(() => {
    console.log('useUserSession onUnmounted');
    if (process.client) {
      // Dừng interval và xóa event listeners
      stopUpdateInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Xóa event listeners
      ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        document.removeEventListener(event, pingActivity);
      });
    }
  });

  return {
    sessionId: computed(() => sessionId.value),
    isActive: computed(() => isActive.value),
    pageViews: computed(() => pageViews.value),
    currentPage: computed(() => currentPage.value),
    error: computed(() => error.value),
    updateSession,
    endSession,
    trackPageView,
    initSession,
    pingActivity
  };
}; 