<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { ref } from '../../composables/useVueComposables';

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();

const postId = Number(route.params.id);
const post = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchPost() {
  try {
    loading.value = true;
    error.value = null;
    
    if (isNaN(postId)) {
      throw new Error('ID bài viết không hợp lệ');
    }
    
    // Gọi tRPC endpoint để lấy chi tiết bài viết
    const result = await trpc.post.byId.query(postId);
    post.value = result;
  } catch (err: any) {
    console.error('Failed to fetch post:', err);
    error.value = err.message || 'Có lỗi xảy ra khi tải chi tiết bài viết';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPost();
});

function goBack() {
  router.back();
}

const getAuthorName = (author) => {
  if (author?.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author?.username || author?.email?.split('@')[0] || 'Không xác định';
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <button 
      @click="goBack" 
      class="mb-6 flex items-center text-blue-500 hover:text-blue-700"
    >
      <span class="mr-2">←</span> Quay lại
    </button>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
      <button 
        @click="fetchPost" 
        class="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Thử lại
      </button>
    </div>
    
    <!-- Post details -->
    <div v-else-if="post" class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
      
      <div class="flex items-center mb-6">
        <div class="text-gray-600">
          <p>Tác giả: {{ getAuthorName(post.author) }}</p>
          <p>Ngày đăng: {{ new Date(post.createdAt).toLocaleDateString('vi-VN') }}</p>
        </div>
      </div>
      
      <div class="prose max-w-none">
        <p>{{ post.content }}</p>
      </div>
    </div>
    
    <!-- Not found state -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500 mb-4">Không tìm thấy bài viết</p>
      <button 
        @click="goBack" 
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Quay lại
      </button>
    </div>
  </div>
</template> 