import { useUserSession } from '@/composables/useUserSession';
import { useRoute, useRouter } from 'vue-router';

export default defineNuxtPlugin(() => {
  console.log('User Session Plugin loaded');
  // Chỉ chạy ở phía client
  if (process.client) {
    console.log('User Session Plugin running on client');
    const userSession = useUserSession();
    const router = useRouter();
    
    // Khởi tạo session ngay khi ứng dụng khởi động
    setTimeout(() => {
      userSession.initSession().then((sessionId) => {
        console.log('Session initialized in plugin with IP tracking:', sessionId);
        
        // Ghi nhận page view ban đầu
        const currentPath = window.location.pathname;
        userSession.trackPageView(currentPath);
      });
    }, 500); // Chờ một chút để đảm bảo các thành phần khác đã được tải
    
    // Lắng nghe sự kiện thay đổi route để theo dõi page views
    router.afterEach((to) => {
      console.log('Route changed, tracking page view:', to.path);
      // Theo dõi page view cho mỗi lần chuyển trang
      userSession.trackPageView(to.path);
    });
    
    // Cập nhật session định kỳ khi người dùng đang ở trên trang
    setInterval(() => {
      userSession.pingActivity();
    }, 30000); // Cập nhật mỗi 30 giây nếu người dùng đang active
  }
}); 