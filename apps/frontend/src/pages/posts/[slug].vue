<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { computed } from 'vue';
import RelatedPosts from '../../components/RelatedPosts.vue';
import PostSidebar from '../../components/sidebar/PostSidebar.vue';
import Breadcrumb from '../../components/Breadcrumb.vue';

// Định nghĩa kiểu dữ liệu cho post
interface Profile {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

interface Author {
  id: number;
  email?: string;
  profile?: Profile;
}

interface Post {
  id: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  author: Author;
}

// Định nghĩa alias cho URL tiếng Việt
definePageMeta({
  alias: ['/bai-viet/:slug']
});

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();

const slug = route.params.slug as string;

/**
 * Tạo slug từ tiêu đề
 */
function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/--+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .trim();
}

// Sử dụng useLazyAsyncData thay vì useAsyncData để tránh lỗi SSR
const { data: post, pending: loading, error, refresh } = useLazyAsyncData<Post | null>(
  `post-${slug}`,
  async () => {
    try {
      // Kiểm tra xem slug có phải là số không (trường hợp URL cũ dùng ID)
      const isNumeric = /^\d+$/.test(slug);
      
      if (isNumeric) {
        // Nếu là số, gọi API theo ID
        const postId = Number(slug);
        const result = await trpc.post.byIdWithAuthor.query(postId);
        
        // Tạo slug từ tiêu đề nếu bài viết không có slug
        const postSlug = result.slug || createSlugFromTitle(result.title);
        
        // Chuyển hướng đến URL có slug với đường dẫn tiếng Việt
        if (process.client) {
          const slugUrl = `/bai-viet/${postSlug}`;
          router.replace({ path: slugUrl, query: route.query });
        }
        
        return result as Post;
      } else {
        // Nếu không phải số, gọi API theo slug
        try {
          return await trpc.post.bySlugWithAuthor.query(slug) as Post;
        } catch (err) {
          // Nếu không tìm thấy bài viết theo slug, có thể slug được tạo từ tiêu đề
          // Tìm tất cả bài viết và so sánh slug được tạo từ tiêu đề
          const allPosts = await trpc.post.all.query();
          const matchedPost = allPosts.find(p => createSlugFromTitle(p.title) === slug);
          
          if (matchedPost) {
            return await trpc.post.byIdWithAuthor.query(matchedPost.id) as Post;
          } else {
            throw new Error('Không tìm thấy bài viết');
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch post:', err);
      throw new Error(err.message || 'Có lỗi xảy ra khi tải chi tiết bài viết');
    }
  },
  {
    // Đảm bảo dữ liệu được tải ngay lập tức
    immediate: true
  }
);

// Đảm bảo dữ liệu được tải ở phía server
onMounted(() => {
  if (!post.value) {
    refresh();
  }
});

// Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: 'Bài viết',
    to: '/bai-viet'
  },
  {
    label: postTitle.value || 'Chi tiết bài viết'
  }
]);

function goBack() {
  router.back();
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Tạo các computed properties để truy cập dữ liệu post một cách an toàn
const postData = computed(() => post.value || {} as Post);
const postTitle = computed(() => postData.value.title || '');
const postContent = computed(() => postData.value.content || '');
const postCreatedAt = computed(() => postData.value.createdAt || '');
const postUpdatedAt = computed(() => postData.value.updatedAt || '');
const postId = computed(() => postData.value.id || 0);
const postOgImage = computed(() => postData.value.ogImage || '');
const postMetaKeywords = computed(() => postData.value.metaKeywords || '');
const postTags = computed(() => {
  if (!postMetaKeywords.value) return [];
  return postMetaKeywords.value.split(',').map((tag: string) => tag.trim());
});

const getAuthorName = computed(() => {
  if (!postData.value.author) return 'Không xác định';
  
  const author = postData.value.author;
  if (author.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author.email?.split('@')[0] || 'Không xác định';
});

const authorInfo = computed(() => {
  if (!postData.value.author) return null;
  
  const author = postData.value.author;
  return {
    name: getAuthorName.value,
    bio: author.profile?.bio || null
  };
});

// Lấy URL hiện tại - đảm bảo chỉ gọi useRequestURL trong setup function
const currentURL = computed(() => {
  // Sử dụng config.public.siteUrl nếu có
  if (process.server) {
    try {
      const config = useRuntimeConfig();
      if (config.public.siteUrl) {
        return config.public.siteUrl;
      }
    } catch (e) {
      console.error('Error accessing runtime config:', e);
    }
  }
  
  // Fallback
  if (process.client) {
    return window.location.origin;
  } else {
    try {
      // Trong SSR, sử dụng useRequestURL nhưng bọc trong try-catch
      const reqURL = useRequestURL();
      return `${reqURL.protocol}//${reqURL.host}`;
    } catch (e) {
      console.error('Error using useRequestURL:', e);
      return '';
    }
  }
});

// Tạo canonical URL từ server - Đặt trong computed để đảm bảo chạy trong setup function
const canonicalUrl = computed(() => {
  if (!postData.value || !postData.value.slug) return '';
  
  // Nếu bài viết có canonicalUrl, sử dụng nó
  if (postData.value.canonicalUrl) {
    return postData.value.canonicalUrl;
  }
  
  // Nếu không, tạo canonical URL từ slug
  const postSlug = postData.value.slug || createSlugFromTitle(postData.value.title);
  return `${currentURL.value}/bai-viet/${postSlug}`;
});

// Thiết lập meta tags ở phía server
useHead(() => {
  return {
    title: postData.value.metaTitle || postTitle.value || 'Bài viết',
    meta: [
      { name: 'description', content: postData.value.metaDescription || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
      { name: 'keywords', content: postMetaKeywords.value },
      { property: 'og:title', content: postData.value.ogTitle || postTitle.value || '' },
      { property: 'og:description', content: postData.value.ogDescription || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
      { property: 'og:image', content: postOgImage.value },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: postData.value.ogTitle || postTitle.value || '' },
      { name: 'twitter:description', content: postData.value.ogDescription || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
      { name: 'twitter:image', content: postOgImage.value }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl.value }
    ]
  };
});
</script>

<template>
  <div class="post-detail">
    <div class="post-detail__container">
      <!-- Breadcrumb thay thế cho nút quay lại -->
      <Breadcrumb 
        :items="breadcrumbItems" 
        variant="default" 
        separator="/"
        :showHomeIcon="true"
      />
      
      <!-- Loading state -->
      <div v-if="loading" class="post-detail__loading">
        <div class="post-detail__loading-spinner"></div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="post-detail__error">
        <p class="post-detail__error-message">{{ error }}</p>
        <button 
          @click="() => { refresh(); }" 
          class="post-detail__error-button"
        >
          Thử lại
        </button>
      </div>
      
      <!-- Post content with sidebar -->
      <div v-else-if="post" class="post-detail__content">
        <!-- Main content -->
        <div class="post-detail__main">
          <article class="post-detail__article">
            <!-- Featured image -->
            <div v-if="postOgImage" class="post-detail__featured-image">
              <img :src="postOgImage" :alt="postTitle">
            </div>
            
            <!-- Post header -->
            <div class="post-detail__header">
              <h1 class="post-detail__title">{{ postTitle }}</h1>
              
              <div class="post-detail__meta">
                <div class="post-detail__author">
                  <div class="post-detail__author-avatar">
                    {{ getAuthorName.charAt(0) }}
                  </div>
                  <div class="post-detail__author-info">
                    <p class="post-detail__author-info-name">{{ getAuthorName }}</p>
                    <p class="post-detail__author-info-date">{{ formatDate(postCreatedAt) }}</p>
                  </div>
                </div>
                
                <div v-if="postUpdatedAt !== postCreatedAt" class="post-detail__updated">
                  Cập nhật: {{ formatDate(postUpdatedAt) }}
                </div>
              </div>
            </div>
            
            <!-- Post content -->
            <div class="post-detail__body">
              <div class="post-prose">
                <p class="whitespace-pre-line">{{ postContent }}</p>
              </div>
            </div>
            
            <!-- Post metadata -->
            <div v-if="postTags.length > 0" class="post-detail__tags">
              <div v-for="(tag, i) in postTags" :key="i">
                <span class="post-detail__tags-item">
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
          
          <!-- Related posts -->
          <RelatedPosts v-if="post && !loading" :postId="postId" :limit="3" class="mt-8" />
        </div>
        
        <!-- Sidebar -->
        <div class="post-detail__sidebar">
          <PostSidebar 
            :postId="postId" 
            :authorInfo="authorInfo"
          />
        </div>
      </div>
      
      <!-- Not found state -->
      <div v-else class="post-detail__not-found">
        <div class="post-detail__not-found-emoji">😕</div>
        <h2 class="post-detail__not-found-title">Không tìm thấy bài viết</h2>
        <p class="post-detail__not-found-message">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <NuxtLink 
          to="/bai-viet" 
          class="post-detail__not-found-button"
        >
          Xem tất cả bài viết
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  @apply text-gray-800;
}

.prose p {
  @apply mb-4;
}

.prose a {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.prose strong {
  @apply font-bold;
}

.prose h2 {
  @apply text-2xl font-bold mt-8 mb-4;
}

.prose h3 {
  @apply text-xl font-bold mt-6 mb-3;
}

.prose ul, .prose ol {
  @apply my-4 pl-6;
}

.prose li {
  @apply mb-2;
}

.prose blockquote {
  @apply pl-4 border-l-4 border-gray-300 italic my-4 text-gray-600;
}
</style> 