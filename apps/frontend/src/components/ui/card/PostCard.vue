<script setup lang="ts">
import { computed } from 'vue';
import LazyImage from '../LazyImage.vue';

const props = defineProps<{
  post: {
    id: number;
    title: string;
    content?: string;
    shortDescription?: string;
    thumbnail?: string | null;
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

/**
 * Kiểm tra xem bài viết có hình ảnh không
 */
const hasImage = computed(() => {
  return !!props.post.thumbnail || !!props.post.ogImage;
});

/**
 * Lấy mô tả ngắn gọn của bài viết
 */
const getDescription = computed(() => {
  return props.post.shortDescription || props.post.metaDescription || props.post.content || '';
});
</script>

<template>
  <NuxtLink :to="`/bai-viet/${postSlug}`" class="block h-full">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div class="flex" :class="{ 'flex-col flex-grow': !compact, 'flex-row': compact }">
        <!-- Hình ảnh bài viết - phiên bản lớn khi không compact -->
        <div v-if="!compact" class="image-container">
          <LazyImage 
            :src="post.thumbnail || post.ogImage" 
            :alt="post.title" 
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        <!-- Hình ảnh bài viết - phiên bản nhỏ khi compact -->
        <div v-else-if="compact && hasImage" class="compact-image-container">
          <LazyImage 
            :src="post.thumbnail || post.ogImage" 
            :alt="post.title" 
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Nội dung bài viết -->
        <div class="p-4 flex-grow flex flex-col">
          <h3 class="title-container">{{ post.title }}</h3>
          
          <p v-if="!compact && getDescription" class="description-container">
            {{ truncateContent(getDescription) }}
          </p>
          
          <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <span>{{ formatDate(post.createdAt) }}</span>
            <span v-if="post.author && !compact">{{ getAuthorName(post.author) }}</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Cố định chiều cao cho hình ảnh */
.image-container {
  height: 200px;
  width: 100%;
  overflow: hidden;
}

.compact-image-container {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
}

/* Cố định chiều cao cho tiêu đề */
.title-container {
  height: 48px; /* Chiều cao cho 2 dòng */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: inherit;
}

.dark .title-container {
  color: white;
}

/* Cố định chiều cao cho mô tả */
.description-container {
  height: 72px; /* Chiều cao cho 3 dòng */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.dark .description-container {
  color: #d1d5db;
}
</style> 