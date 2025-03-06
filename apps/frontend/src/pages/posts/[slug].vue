<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRoute, useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { ref, computed, onMounted, watch } from 'vue';
import RelatedPosts from '../../components/RelatedPosts.vue';

const route = useRoute();
const router = useRouter();
const trpc = useTrpc();

const slug = route.params.slug as string;
const post = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchPost() {
  try {
    loading.value = true;
    error.value = null;
    
    // Kiểm tra xem slug có phải là số không (trường hợp URL cũ dùng ID)
    const isNumeric = /^\d+$/.test(slug);
    
    if (isNumeric) {
      // Nếu là số, gọi API theo ID và chuyển hướng đến URL có slug
      const postId = Number(slug);
      const result = await trpc.post.byIdWithAuthor.query(postId);
      post.value = result;
      
      // Tạo slug từ tiêu đề nếu bài viết không có slug
      const postSlug = post.value.slug || createSlugFromTitle(post.value.title);
      
      // Chuyển hướng đến URL có slug
      const slugUrl = `/posts/${postSlug}`;
      router.replace({ path: slugUrl, query: route.query });
      return;
    } else {
      // Nếu không phải số, gọi API theo slug
      try {
        const result = await trpc.post.bySlugWithAuthor.query(slug);
        post.value = result;
      } catch (err) {
        // Nếu không tìm thấy bài viết theo slug, có thể slug được tạo từ tiêu đề
        // Tìm tất cả bài viết và so sánh slug được tạo từ tiêu đề
        const allPosts = await trpc.post.all.query();
        const matchedPost = allPosts.find(p => createSlugFromTitle(p.title) === slug);
        
        if (matchedPost) {
          const result = await trpc.post.byIdWithAuthor.query(matchedPost.id);
          post.value = result;
        } else {
          throw new Error('Không tìm thấy bài viết');
        }
      }
    }
  } catch (err: any) {
    console.error('Failed to fetch post:', err);
    error.value = err.message || 'Có lỗi xảy ra khi tải chi tiết bài viết';
  } finally {
    loading.value = false;
  }
}

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

onMounted(() => {
  fetchPost();
});

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

const getAuthorName = computed(() => {
  if (!post.value?.author) return 'Không xác định';
  
  const author = post.value.author;
  if (author.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author.email?.split('@')[0] || 'Không xác định';
});

const metaTags = computed(() => {
  if (!post.value) return {};
  
  // Lấy URL hiện tại cho canonical URL nếu không có canonicalUrl từ bài viết
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.origin + route.path
    : '';
  
  return {
    title: post.value.metaTitle || post.value.title,
    description: post.value.metaDescription || post.value.content?.substring(0, 160),
    keywords: post.value.metaKeywords,
    ogTitle: post.value.ogTitle || post.value.title,
    ogDescription: post.value.ogDescription || post.value.content?.substring(0, 160),
    ogImage: post.value.ogImage,
    canonicalUrl: post.value.canonicalUrl || currentUrl
  };
});

// Cập nhật SEO meta tags khi post thay đổi
watch(() => post.value, (newPost) => {
  if (newPost) {
    useHead({
      title: metaTags.value.title,
      meta: [
        { name: 'description', content: metaTags.value.description },
        { name: 'keywords', content: metaTags.value.keywords },
        { property: 'og:title', content: metaTags.value.ogTitle },
        { property: 'og:description', content: metaTags.value.ogDescription },
        { property: 'og:image', content: metaTags.value.ogImage },
        { property: 'og:url', content: metaTags.value.canonicalUrl },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: metaTags.value.ogTitle },
        { name: 'twitter:description', content: metaTags.value.ogDescription },
        { name: 'twitter:image', content: metaTags.value.ogImage }
      ],
      link: [
        { rel: 'canonical', href: metaTags.value.canonicalUrl }
      ]
    });
  }
}, { immediate: true });
</script>

<template>
  <div>
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
      <div v-else-if="post" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Featured image -->
        <div v-if="post.ogImage" class="w-full h-64 md:h-96 overflow-hidden">
          <img :src="post.ogImage" :alt="post.title" class="w-full h-full object-cover">
        </div>
        
        <!-- Post header -->
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
          
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                {{ getAuthorName.charAt(0) }}
              </div>
              <div>
                <p class="font-medium">{{ getAuthorName }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</p>
              </div>
            </div>
            
            <div v-if="post.updatedAt !== post.createdAt" class="text-sm text-gray-500">
              Cập nhật: {{ formatDate(post.updatedAt) }}
            </div>
          </div>
        </div>
        
        <!-- Post content -->
        <div class="p-6">
          <div class="prose max-w-none">
            <p class="whitespace-pre-line">{{ post.content }}</p>
          </div>
        </div>
        
        <!-- Post metadata -->
        <div v-if="post.metaKeywords" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(tag, index) in post.metaKeywords.split(',')" 
              :key="index"
              class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {{ tag.trim() }}
            </span>
          </div>
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
      
      <!-- Related posts -->
      <RelatedPosts v-if="post && !loading" :postId="post.id" :limit="3" />
    </div>
  </div>
</template> 