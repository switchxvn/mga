<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '../composables/useTrpc';

const trpc = useTrpc();
const latestPosts = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchLatestPosts() {
  try {
    loading.value = true;
    error.value = null;
    
    // Gọi tRPC endpoint để lấy danh sách bài viết mới nhất
    const result = await trpc.post.all.query();
    latestPosts.value = result.slice(0, 3); // Chỉ lấy 3 bài viết mới nhất
  } catch (err: any) {
    console.error('Failed to fetch latest posts:', err);
    error.value = err.message || 'Có lỗi xảy ra khi tải bài viết mới nhất';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchLatestPosts();
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-blue-600 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Chào mừng đến với ứng dụng của chúng tôi</h1>
        <p class="text-xl mb-8 max-w-3xl mx-auto">
          Một ứng dụng hiện đại sử dụng Nuxt 3, NestJS và tRPC trong một monorepo Nx.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink to="/posts" class="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100">
            Xem bài viết
          </NuxtLink>
          <NuxtLink to="/register" class="bg-blue-700 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-800 border border-blue-500">
            Đăng ký ngay
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Latest Posts Section -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">Bài viết mới nhất</h2>
        
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
          <p>{{ error }}</p>
          <button 
            @click="fetchLatestPosts" 
            class="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Thử lại
          </button>
        </div>
        
        <!-- Posts grid -->
        <div v-else-if="latestPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="post in latestPosts" 
            :key="post.id" 
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{{ post.title }}</h3>
              <p class="text-gray-600 mb-4 line-clamp-3">{{ post.content }}</p>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">
                  {{ new Date(post.createdAt).toLocaleDateString('vi-VN') }}
                </span>
                <NuxtLink 
                  :to="`/posts/${post.id}`" 
                  class="text-blue-500 hover:text-blue-700"
                >
                  Xem chi tiết
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500 mb-4">Chưa có bài viết nào</p>
          <NuxtLink to="/posts/new" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Tạo bài viết đầu tiên
          </NuxtLink>
        </div>
        
        <!-- View all button -->
        <div v-if="latestPosts.length > 0" class="text-center mt-10">
          <NuxtLink to="/posts" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md">
            Xem tất cả bài viết
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center">Tính năng</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Hiệu suất cao</h3>
            <p class="text-gray-600">
              Được xây dựng với Nuxt 3 và NestJS, ứng dụng cung cấp hiệu suất tối ưu và thời gian phản hồi nhanh.
            </p>
          </div>
          
          <div class="text-center p-6">
            <div class="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Bảo mật</h3>
            <p class="text-gray-600">
              Hệ thống xác thực và phân quyền mạnh mẽ, bảo vệ dữ liệu người dùng và nội dung.
            </p>
          </div>
          
          <div class="text-center p-6">
            <div class="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Thiết kế hiện đại</h3>
            <p class="text-gray-600">
              Giao diện người dùng trực quan, đáp ứng và dễ sử dụng trên mọi thiết bị.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
