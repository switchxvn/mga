<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRouter } from 'vue-router';
import { useTrpc } from '../composables/useTrpc';
import { ref, onMounted, watch } from '../composables/useVueComposables';
// Import components
import NavbarWithTheme from '../components/ui/NavbarWithTheme.vue';
import Footer from '../components/ui/Footer.vue';

const router = useRouter();
const trpc = useTrpc();

const user = ref<any>(null);
const isLoading = ref(true);
const isDarkMode = ref(false);

// Kiểm tra dark mode
const checkDarkMode = () => {
  if (typeof document !== 'undefined') {
    isDarkMode.value = document.documentElement.classList.contains('dark');
    
    // Thêm class vào body để đảm bảo dark mode được áp dụng đúng cách
    if (isDarkMode.value) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
};

onMounted(async () => {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      // Nếu có thông tin người dùng trong localStorage, sử dụng nó
      user.value = JSON.parse(storedUser);
      
      // Kiểm tra token với server
      try {
        // Token đã được lưu trong localStorage và sẽ được tự động gửi trong header
        // bởi trpc client trong file trpc.ts
        const currentUser = await trpc.auth.me.query();
        user.value = currentUser;
      } catch (error) {
        console.error('Failed to validate token:', error);
        // Nếu token không hợp lệ, đăng xuất
        handleLogout();
      }
    }
    
    // Kiểm tra dark mode
    checkDarkMode();
    
    // Theo dõi thay đổi của dark mode
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            checkDarkMode();
          }
        });
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  } finally {
    isLoading.value = false;
  }
});

// Theo dõi thay đổi của isDarkMode
watch(isDarkMode, () => {
  // Cập nhật style khi dark mode thay đổi
  if (typeof document !== 'undefined') {
    if (isDarkMode.value) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
});

async function handleLogout() {
  try {
    // Gọi tRPC endpoint để đăng xuất
    await trpc.auth.logout.mutate();
    
    // Xóa thông tin người dùng và token khỏi localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reset user state
    user.value = null;
    
    // Chuyển hướng đến trang đăng nhập
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <NavbarWithTheme logo="/logo.svg" hotline="1900 1234" />
    
    <!-- Main content -->
    <main class="flex-grow">
      <slot />
    </main>
    
    <!-- Footer -->
    <Footer appName="E-Commerce" />
  </div>
</template>

<style>
/* Đảm bảo dark mode được áp dụng đúng cách */
body.dark-mode {
  background-color: #111827 !important;
  color: #f9fafb !important;
}

body.dark-mode .footer {
  background-color: #111827 !important;
  color: #f9fafb !important;
  border-color: #374151 !important;
}

body.dark-mode .footer__title {
  color: #f9fafb !important;
}

body.dark-mode .footer__link {
  color: #9ca3af !important;
}

body.dark-mode .footer__link:hover {
  color: #60a5fa !important;
}

body.dark-mode .footer__text {
  color: #9ca3af !important;
}

body.dark-mode .footer__copyright {
  border-color: #374151 !important;
  color: #9ca3af !important;
}
</style> 