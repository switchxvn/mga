<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTrpc } from '../composables/useTrpc';

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
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="text-xl font-bold text-blue-600">My App</NuxtLink>
        
        <nav class="flex items-center space-x-6">
          <NuxtLink to="/" class="text-gray-700 hover:text-blue-600">Trang chủ</NuxtLink>
          <NuxtLink to="/posts" class="text-gray-700 hover:text-blue-600">Bài viết</NuxtLink>
          
          <!-- Authentication links -->
          <template v-if="isLoading">
            <div class="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </template>
          <template v-else-if="user">
            <div class="relative group">
              <button class="flex items-center text-gray-700 hover:text-blue-600">
                <span class="mr-2">{{ user.name || user.email }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hồ sơ</NuxtLink>
                <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Đăng xuất
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-gray-700 hover:text-blue-600">Đăng nhập</NuxtLink>
            <NuxtLink to="/register" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Đăng ký</NuxtLink>
          </template>
        </nav>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="flex-grow">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <h3 class="text-xl font-bold">My App</h3>
            <p class="text-gray-400">© {{ new Date().getFullYear() }} All rights reserved.</p>
          </div>
          
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white">
              <span class="sr-only">Facebook</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white">
              <span class="sr-only">Twitter</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white">
              <span class="sr-only">GitHub</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template> 