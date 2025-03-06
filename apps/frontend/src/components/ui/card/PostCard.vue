<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  post: {
    id: number;
    title: string;
    content?: string;
    createdAt: string;
    updatedAt: string;
    author?: any;
    metaDescription?: string;
    ogImage?: string;
    slug?: string;
  };
  compact?: boolean;
}>();

/**
 * Tạo slug từ tiêu đề nếu không có slug
 */
const postSlug = computed(() => {
  if (props.post.slug) return props.post.slug;
  
  // Fallback: Tạo slug từ tiêu đề nếu không có slug
  return props.post.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/--+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .trim();
});

/**
 * Rút gọn nội dung bài viết để hiển thị trong card
 */
function truncateContent(content: string, maxLength: number = 150): string {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  
  // Cắt nội dung và thêm dấu "..."
  return content.substring(0, maxLength) + '...';
}

/**
 * Format ngày tháng theo định dạng Việt Nam
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Lấy tên tác giả từ thông tin author
 */
function getAuthorName(author: any): string {
  if (!author) return 'Không xác định';
  
  if (author.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  
  return author.email?.split('@')[0] || 'Không xác định';
}
</script>

<template>
  <NuxtLink :to="`/bai-viet/${postSlug}`" class="block">
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <!-- Hình ảnh bài viết nếu có -->
      <div v-if="post.ogImage && !compact" class="h-48 overflow-hidden">
        <img :src="post.ogImage" :alt="post.title" class="w-full h-full object-cover">
      </div>
      
      <!-- Nội dung bài viết -->
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ post.title }}</h3>
        
        <p v-if="!compact && (post.content || post.metaDescription)" class="text-gray-600 mb-3 line-clamp-3">
          {{ truncateContent(post.metaDescription || post.content || '') }}
        </p>
        
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>{{ formatDate(post.createdAt) }}</span>
          <span v-if="post.author && !compact">{{ getAuthorName(post.author) }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template> 