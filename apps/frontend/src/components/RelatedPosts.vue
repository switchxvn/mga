<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '../composables/useTrpc';
import PostCard from './ui/card/PostCard.vue';

const props = defineProps<{
  postId: number;
  limit?: number;
}>();

const trpc = useTrpc();
const relatedPosts = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchRelatedPosts() {
  try {
    loading.value = true;
    error.value = null;
    
    const result = await trpc.post.relatedPosts.query({
      id: props.postId,
      limit: props.limit || 3
    });
    
    relatedPosts.value = result;
  } catch (err: any) {
    console.error('Failed to fetch related posts:', err);
    error.value = err.message || 'Có lỗi xảy ra khi tải bài viết liên quan';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchRelatedPosts();
});
</script>

<template>
  <div class="mt-8">
    <h2 class="text-2xl font-bold mb-4">Bài viết liên quan</h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="text-red-500 mb-4">
      {{ error }}
    </div>
    
    <!-- No related posts -->
    <div v-else-if="relatedPosts.length === 0" class="text-gray-500 text-center py-4">
      Không có bài viết liên quan
    </div>
    
    <!-- Related posts grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="post in relatedPosts" :key="post.id" class="col-span-1">
        <PostCard :post="post" :compact="true" />
      </div>
    </div>
  </div>
</template> 