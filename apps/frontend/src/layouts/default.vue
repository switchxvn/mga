<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRouter } from 'vue-router';
import { useTrpc } from '../composables/useTrpc';
import { ref, onMounted } from '../composables/useVueComposables';
// Import components
import NavbarWithTheme from '../components/ui/NavbarWithTheme.vue';
import Footer from '../components/ui/Footer.vue';

const router = useRouter();
const trpc = useTrpc();

const user = ref<any>(null);
const isLoading = ref(true);

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
  } catch (error) {
    console.error('Error checking authentication:', error);
  } finally {
    isLoading.value = false;
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