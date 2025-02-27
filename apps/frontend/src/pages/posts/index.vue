<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useTrpc } from '../../composables/useTrpc';
import { ref } from '../../composables/useVueComposables';

const trpc = useTrpc();
const posts = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchPosts() {
  try {
    loading.value = true;
    error.value = null;
    
    // Gọi tRPC endpoint để lấy danh sách bài viết
    const result = await trpc.post.all.query();
    posts.value = result;
  } catch (err: any) {
    console.error('Failed to fetch posts:', err);
    error.value = err.message || 'Có lỗi xảy ra khi tải danh sách bài viết';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Danh sách bài viết</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
      <button 
        @click="fetchPosts" 
        class="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Thử lại
      </button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="posts.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">Chưa có bài viết nào</p>
    </div>
    
    <!-- Posts list -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-2">{{ post.title }}</h2>
          <p class="text-gray-600 mb-4 line-clamp-3">{{ post.content }}</p>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">
              Tác giả: {{ post.author?.name || 'Không xác định' }}
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
  </div>
</template> 