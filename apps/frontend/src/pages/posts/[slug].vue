<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { computed, ref, watch, onMounted, onBeforeMount } from 'vue';
import RelatedPosts from '../../components/RelatedPosts.vue';
import PostSidebar from '../../components/sidebar/PostSidebar.vue';
import Breadcrumb from '../../components/Breadcrumb.vue';
import LazyImage from '../../components/ui/LazyImage.vue';
import Icon from '../../components/ui/Icon.vue';
import { useI18n } from 'vue-i18n';
import type { Post, Profile, Author, Tag } from '@ew/shared';

// Định nghĩa alias cho URL tiếng Việt và tiếng Anh
definePageMeta({
  alias: ['/bai-viet/:slug']
});

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();
const { locale } = useI18n();

const slug = route.params.slug as string;
console.log('slug', slug);
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

const currentKey = computed(() => `post-${slug}-${locale.value}`);

// Sử dụng useAsyncData thay vì useLazyAsyncData để hỗ trợ SSR tốt hơn
const { data: post, pending: loading, error, refresh } = useAsyncData(
  `post-${slug}`,
  () => fetchPost(slug)
);

async function fetchPost(postSlug: string) {
  console.log('fetchPost', postSlug);
  try {
    const result = await trpc.post.bySlugWithAuthorAndTags.query({
      slug: postSlug
    });

    // Sau khi fetch được data, set locale dựa trên translation có slug match
    if (result) {
      const matchedTranslation = result.translations?.find(t => t.slug === postSlug);
      if (matchedTranslation && matchedTranslation.locale !== locale.value) {
        locale.value = matchedTranslation.locale;
      }
    }

    return result;
  } catch (err: any) {
    console.error('Failed to fetch post:', err);
    throw new Error(err.message || 'Có lỗi xảy ra khi tải chi tiết bài viết');
  }
}

// Tạo các computed properties để truy cập dữ liệu post một cách an toàn
const postData = computed(() => post.value || {} as Post);
const currentTranslation = computed(() => {
  // Ưu tiên tìm translation có slug match với URL hiện tại
  const matchedTranslation = postData.value.translations?.find(t => t.slug === slug);
  if (matchedTranslation) return matchedTranslation;

  // Fallback về locale hiện tại nếu không tìm thấy
  return postData.value.translations?.find(t => t.locale === locale.value);
});

const postTitle = computed(() => currentTranslation.value?.title || '');
const postContent = computed(() => currentTranslation.value?.content || '');
const postShortDescription = computed(() => currentTranslation.value?.shortDescription || '');
const postCreatedAt = computed(() => postData.value.createdAt?.toString() || '');
const postUpdatedAt = computed(() => postData.value.updatedAt?.toString() || '');
const postId = computed(() => postData.value.id || 0);
const postThumbnail = computed(() => postData.value.thumbnail || '');
const postOgImage = computed(() => currentTranslation.value?.ogImage || '');
const postMetaKeywords = computed(() => currentTranslation.value?.metaKeywords || '');
const postTags = computed(() => postData.value.tags || []);

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
  return author.username || author.email?.split('@')[0] || 'Không xác định';
});

const authorInfo = computed(() => {
  if (!postData.value.author) return undefined;
  
  const author = postData.value.author;
  return {
    name: getAuthorName.value,
    bio: author.profile?.bio || null
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
  const translation = currentTranslation.value;
  if (!translation) return '';
  
  // Nếu bài viết có canonicalUrl, sử dụng nó
  if (translation.canonicalUrl) {
    return translation.canonicalUrl;
  }
  
  // Nếu không, tạo canonical URL từ slug
  const postSlug = translation.slug;
  return `${currentURL.value}/bai-viet/${postSlug}`;
});

// Thiết lập meta tags ở phía server
useHead(() => {
  const translation = currentTranslation.value;
  if (!translation) return {};

  return {
    title: translation.metaTitle || postTitle.value || 'Bài viết',
    meta: [
      { name: 'description', content: translation.metaDescription || postShortDescription.value || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
      { name: 'keywords', content: translation.metaKeywords || '' },
      { property: 'og:title', content: translation.ogTitle || postTitle.value || '' },
      { property: 'og:description', content: translation.ogDescription || postShortDescription.value || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
      { property: 'og:image', content: translation.ogImage || '' },
      { property: 'og:url', content: canonicalUrl.value },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: translation.ogTitle || postTitle.value || '' },
      { name: 'twitter:description', content: translation.ogDescription || (postContent.value ? postContent.value.substring(0, 160) : '') || '' },
      { name: 'twitter:image', content: translation.ogImage || '' }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl.value }
    ]
  };
});

// Watch locale changes to update URL and content
watch(locale, async (newLocale) => {
  if (!post.value) return;

  // Tìm translation cho locale mới
  const newTranslation = post.value.translations?.find(t => t.locale === newLocale);
  if (newTranslation?.slug) {
    // Cập nhật URL với slug mới
    const newPath = newLocale === 'vi' 
      ? `/bai-viet/${newTranslation.slug}`
      : `/posts/${newTranslation.slug}`;
    
    // Chỉ thay đổi route, không fetch lại data
    await router.replace(newPath);
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

/**
 * Format date to Vietnamese locale
 */
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
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