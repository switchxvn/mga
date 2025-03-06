<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { computed, ref } from 'vue';
import RelatedPosts from '../../components/RelatedPosts.vue';
import PostSidebar from '../../components/sidebar/PostSidebar.vue';
import Breadcrumb from '../../components/Breadcrumb.vue';
import LazyImage from '../../components/ui/LazyImage.vue';
import Icon from '../../components/ui/Icon.vue';

// Định nghĩa kiểu dữ liệu cho post
interface Profile {
  id?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string | null;
  phoneCode?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface Author {
  id: number;
  email?: string;
  username?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  __profile__?: Profile;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

interface Post {
  id: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  shortDescription?: string;
  published: boolean;
  authorId: number;
  slug: string;
  thumbnail?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  __author__?: Author;
  categories?: any[];
  tags?: Tag[];
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

// Sử dụng useAsyncData thay vì useLazyAsyncData để hỗ trợ SSR tốt hơn
const { data: post, pending: loading, error, refresh } = useAsyncData<Post | null>(
  `post-${slug}`,
  async () => {
    try {
      // Kiểm tra xem slug có phải là số không (trường hợp URL cũ dùng ID)
      const isNumeric = /^\d+$/.test(slug);
      
      if (isNumeric) {
        // Nếu là số, gọi API theo ID
        const postId = Number(slug);
        const result = await trpc.post.byIdWithAuthorAndTags.query(postId);
        
        // Tạo slug từ tiêu đề nếu bài viết không có slug
        const postSlug = result.slug || createSlugFromTitle(result.title);
        
        // Chuyển hướng đến URL có slug với đường dẫn tiếng Việt
        if (process.client) {
          const slugUrl = `/bai-viet/${postSlug}`;
          router.replace({ path: slugUrl, query: route.query });
        }
        
        return result as unknown as Post;
      } else {
        // Nếu không phải số, gọi API theo slug
        try {
          return await trpc.post.bySlugWithAuthorAndTags.query(slug) as unknown as Post;
        } catch (err) {
          // Nếu không tìm thấy bài viết theo slug, có thể slug được tạo từ tiêu đề
          // Tìm tất cả bài viết và so sánh slug được tạo từ tiêu đề
          const allPosts = await trpc.post.all.query();
          const matchedPost = allPosts.find(p => createSlugFromTitle(p.title) === slug);
          
          if (matchedPost) {
            return await trpc.post.byIdWithAuthorAndTags.query(matchedPost.id) as unknown as Post;
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
const postData = computed(() => post.value || {} as unknown as Post);
const postTitle = computed(() => postData.value.title || '');
const postContent = computed(() => postData.value.content || '');
const postShortDescription = computed(() => postData.value.shortDescription || '');
const postCreatedAt = computed(() => postData.value.createdAt || '');
const postUpdatedAt = computed(() => postData.value.updatedAt || '');
const postId = computed(() => postData.value.id || 0);
const postThumbnail = computed(() => postData.value.thumbnail || '');
const postOgImage = computed(() => postData.value.ogImage || '');
const postMetaKeywords = computed(() => postData.value.metaKeywords || '');
const postTags = computed(() => {
  return postData.value.tags || [];
});

const getAuthorName = computed(() => {
  if (!postData.value.__author__) return 'Không xác định';
  
  const author = postData.value.__author__;
  if (author.__profile__) {
    const firstName = author.__profile__.firstName || '';
    const lastName = author.__profile__.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author.username || author.email?.split('@')[0] || 'Không xác định';
});

const authorInfo = computed(() => {
  if (!postData.value.__author__) return undefined;
  
  const author = postData.value.__author__;
  return {
    name: getAuthorName.value,
    bio: author.__profile__?.bio || null
  };
});

// Lấy URL hiện tại từ server - đặt ở ngoài computed
let serverUrl = '';
if (process.server) {
  try {
    const config = useRuntimeConfig();
    if (config.public && config.public.siteUrl && typeof config.public.siteUrl === 'string') {
      serverUrl = config.public.siteUrl;
    } else {
      const reqURL = useRequestURL();
      serverUrl = `${reqURL.protocol}//${reqURL.host}`;
    }
  } catch (e) {
    console.error('Error in server URL setup:', e);
  }
}

// Sử dụng ref để lưu trữ URL
const baseUrl = ref(serverUrl);

// Cập nhật URL ở client side khi component được mount
onMounted(() => {
  if (process.client && !baseUrl.value) {
    baseUrl.value = window.location.origin;
  }
});

// Sử dụng giá trị đã lưu trong ref
const currentURL = computed(() => {
  return baseUrl.value || '';
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
      { name: 'description', content: postData.value.metaDescription || postShortDescription.value || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
      { name: 'keywords', content: postMetaKeywords.value },
      { property: 'og:title', content: postData.value.ogTitle || postTitle.value || '' },
      { property: 'og:description', content: postData.value.ogDescription || postShortDescription.value || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
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
            <div class="post-detail__featured-image">
              <LazyImage 
                :src="postThumbnail || postOgImage" 
                :alt="postTitle"
                class="w-full h-auto rounded-lg"
                :key="postId"
              />
            </div>
            
            <!-- Post header -->
            <div class="post-detail__header">
              <h1 class="post-detail__title">{{ postTitle }}</h1>
              
              <!-- Short Description -->
              <div v-if="postShortDescription" class="post-detail__short-description">
                {{ postShortDescription }}
              </div>
              
              <div class="post-detail__meta">
                <div class="post-detail__author">
                  <div class="post-detail__author-avatar">
                    {{ getAuthorName.charAt(0) }}
                  </div>
                  <div class="post-detail__author-info">
                    <div class="post-detail__author-name">
                      <Icon name="User" :size="16" class="mr-1" />
                      <span>{{ getAuthorName }}</span>
                    </div>
                    <div class="post-detail__date">
                      <Icon name="Calendar" :size="16" class="mr-1" />
                      <span>{{ formatDate(postCreatedAt) }}</span>
                    </div>
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
              <div class="post-detail__tags-title">
                <Icon name="Tag" :size="16" class="mr-1" />
                <span>Tags:</span>
              </div>
              <div class="post-detail__tags-list">
                <NuxtLink 
                  v-for="tag in postTags" 
                  :key="tag.id"
                  :to="`/tags/${tag.slug}`"
                  class="post-detail__tags-item"
                  :style="tag.color ? { backgroundColor: tag.color + '20', borderColor: tag.color } : {}"
                >
                  <span class="tag-hash">#</span>
                  <span>{{ tag.name }}</span>
                </NuxtLink>
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

.post-detail__short-description {
  @apply text-lg text-gray-600 dark:text-gray-300 my-4 font-medium italic;
}

.post-detail__author-name,
.post-detail__date {
  @apply flex items-center text-sm mb-1;
}

.post-detail__author-name {
  @apply font-medium text-gray-800 dark:text-gray-200;
}

.post-detail__date {
  @apply text-gray-600 dark:text-gray-400;
}

.post-detail__author-info {
  @apply flex flex-col justify-center;
}

.post-detail__tags {
  @apply mt-6 border-t border-gray-200 dark:border-gray-700 pt-4;
}

.post-detail__tags-title {
  @apply flex items-center text-gray-600 dark:text-gray-400 mb-3 font-medium;
}

.post-detail__tags-list {
  @apply flex flex-wrap gap-2;
}

.post-detail__tags-item {
  @apply px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 inline-flex items-center;
  height: 28px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tag-hash {
  @apply mr-0.5 text-gray-500 dark:text-gray-400 font-medium;
}
</style> 