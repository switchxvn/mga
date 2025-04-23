<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { 
  PlusCircleIcon, 
  AlertCircleIcon,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
  ZoomInIcon
} from 'lucide-vue-next';
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon as SearchIcon,    
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { TransitionRoot } from '@headlessui/vue'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import PaginationComponent from '../../components/ui/Pagination.vue';

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Posts Management - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();


interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  shortDescription?: string;
  createdAt: string;
  updatedAt: string;
  categories: any[];
  postTags: any[];
  author?: any;
  thumbnail?: string;
  translations?: any[];
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const publishedFilter = ref<boolean | undefined>(
  route.query.published === 'true' ? true : 
  route.query.published === 'false' ? false : 
  undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const posts = ref<{
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1
});

const selectedPosts = ref<number[]>([]);
const showBulkActions = ref(false);
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

const selectedImage = ref<string | null>(null);
const isZoomModalOpen = ref(false);

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    published: publishedFilter.value !== undefined ? publishedFilter.value.toString() : undefined
  };

  // Remove undefined values
  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

  router.replace({ query });
};

// Watch for changes in filters and update URL
watch([page, search, publishedFilter], () => {
  updateQueryParams();
  fetchPosts();
}, { deep: true });

async function fetchPosts() {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await trpc.admin.posts.getAllPosts.query({
      page: page.value,
      limit: pageSize.value,
      search: search.value || undefined,
      published: publishedFilter.value
    });

    posts.value = {
      items: result.posts,
      total: result.total,
      page: result.currentPage,
      pageSize: result.limit,
      totalPages: result.totalPages
    };
  } catch (err: any) {
    error.value = err.message || "Failed to load posts";
    console.error("Error loading posts:", err);
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(id: number) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    await trpc.admin.posts.deletePost.mutate(id);
    await fetchPosts();
    // Show success notification
  } catch (err: any) {
    error.value = err.message || "Failed to delete post";
    console.error("Error deleting post:", err);
  }
}

// Debounced search
let searchTimeout: NodeJS.Timeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
  }, 300);
}

onMounted(async () => {
  try {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    await fetchPosts();
  } catch (err: any) {
    error.value = err.message || "Failed to initialize posts page";
    console.error("Error initializing posts page:", err);
    isLoading.value = false;
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// Add bulk selection handling
const toggleSelectAll = () => {
  if (selectedPosts.value.length === posts.value.items.length) {
    selectedPosts.value = [];
  } else {
    selectedPosts.value = posts.value.items.map(post => post.id);
  }
};

const togglePostSelection = (postId: number) => {
  const index = selectedPosts.value.indexOf(postId);
  if (index === -1) {
    selectedPosts.value.push(postId);
  } else {
    selectedPosts.value.splice(index, 1);
  }
};

// Add bulk delete function
async function handleBulkDelete() {
  if (!selectedPosts.value.length || !confirm(`Are you sure you want to delete ${selectedPosts.value.length} posts?`)) return;

  try {
    for (const id of selectedPosts.value) {
      await trpc.admin.posts.deletePost.mutate(id);
    }
    selectedPosts.value = [];
    await fetchPosts();
  } catch (err: any) {
    error.value = err.message || "Failed to delete posts";
    console.error("Error deleting posts:", err);
  }
}

// Add sorting function
const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
  fetchPosts();
};

const openZoomModal = (image: string) => {
  selectedImage.value = image;
  isZoomModalOpen.value = true;
};

const closeZoomModal = () => {
  selectedImage.value = null;
  isZoomModalOpen.value = false;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Enhanced Header -->
    <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
            <DocumentTextIcon class="h-8 w-8 text-indigo-600" />
            Posts Management
          </h2>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <InformationCircleIcon class="h-5 w-5" />
            Manage and organize your blog posts efficiently
          </p>
        </div>
        <div class="mt-4 flex flex-col sm:flex-row gap-3 sm:mt-0">
          <button v-if="selectedPosts.length" 
            @click="handleBulkDelete"
            class="btn btn-error btn-sm flex items-center gap-2">
            <Trash2Icon class="h-4 w-4" />
            Delete Selected ({{ selectedPosts.length }})
          </button>
          <NuxtLink
            to="/posts/create"
            class="btn btn-primary btn-sm flex items-center gap-2"
          >
            <PlusCircleIcon class="h-4 w-4" />
            Create Post
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Enhanced Search and Filter -->
    <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search Input with rounded corners -->
        <div class="relative rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="search"
            type="text"
            placeholder="Search posts..."
            class="block w-full pl-10 pr-3 py-2 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
            @input="handleSearch"
          />
        </div>

        <!-- Status Filter -->
        <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <select 
            v-model="publishedFilter" 
            class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
          >
            <option :value="undefined">All Posts</option>
            <option :value="true">Published</option>
            <option :value="false">Draft</option>
          </select>
        </div>

        <!-- Items per page Select with rounded corners -->
        <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <select 
            v-model="pageSize" 
            class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
            @change="page = 1; fetchPosts()"
          >
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Enhanced Error Alert -->
    <TransitionRoot as="template" :show="!!error">
      <div class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
          <div class="ml-auto pl-3">
            <button
              type="button"
              class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              @click="error = null"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </TransitionRoot>

    <!-- Enhanced Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
      <div class="animate-pulse space-y-4">
        <div v-for="i in 5" :key="i" class="flex space-x-4">
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Enhanced Posts Table with Thumbnails -->
    <div v-else class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  class="checkbox rounded"
                  :checked="selectedPosts.length === posts.items.length"
                  :indeterminate="selectedPosts.length > 0 && selectedPosts.length < posts.items.length"
                  @change="toggleSelectAll"
                />
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thumbnail</span>
              </th>
              <th 
                v-for="(column, index) in ['Title', 'Status', 'Created At', 'Actions']" 
                :key="index"
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
                @click="handleSort(column.toLowerCase())"
              >
                <div class="flex items-center gap-2">
                  {{ column }}
                  <ChevronUpDownIcon v-if="sortBy !== column.toLowerCase()" class="h-4 w-4" />
                  <ChevronUpIcon v-else-if="sortOrder === 'asc'" class="h-4 w-4" />
                  <ChevronDownIcon v-else class="h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr 
              v-for="post in posts.items" 
              :key="post.id"
              class="hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150 ease-in-out"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  class="checkbox rounded"
                  :checked="selectedPosts.includes(post.id)"
                  @change="togglePostSelection(post.id)"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div 
                    v-if="post.thumbnail" 
                    class="h-16 w-16 flex-shrink-0 cursor-pointer group relative rounded-lg overflow-hidden"
                    @click="openZoomModal(post.thumbnail)"
                  >
                    <img 
                      :src="post.thumbnail" 
                      class="h-full w-full object-cover transition-transform group-hover:scale-105"
                      alt=""
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      <ZoomInIcon class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div v-else class="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                    <ImageIcon class="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ post.title }}
                    <p v-if="post.shortDescription" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {{ post.shortDescription }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1': true,
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': post.published,
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !post.published
                  }"
                >
                  <div class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-green-500': post.published,
                      'bg-gray-500': !post.published
                    }"
                  ></div>
                  {{ post.published ? 'Published' : 'Draft' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(post.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <NuxtLink
                    :to="`/posts/edit/${post.id}`"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Edit post"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </NuxtLink>
                  <button
                    @click="handleDelete(post.id)"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete post"
                  >
                    <Trash2Icon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Enhanced Pagination -->
      <PaginationComponent
        :current-page="page"
        :total-pages="posts.totalPages"
        :total-items="posts.total"
        :items-per-page="pageSize"
        @page-change="(newPage: number) => { page = newPage; fetchPosts(); }"
      />
    </div>

    <!-- Image Zoom Modal -->
    <TransitionRoot as="template" :show="isZoomModalOpen">
      <div class="fixed inset-0 z-50 overflow-y-auto" @click="closeZoomModal">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          
          <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all max-w-4xl w-full" @click.stop>
            <div class="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                class="rounded-md bg-white dark:bg-neutral-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                @click="closeZoomModal"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div class="mt-6">
              <swiper
                :modules="[Navigation, Pagination, Zoom]"
                :navigation="true"
                :pagination="{ clickable: true }"
                :zoom="true"
                class="h-[60vh]"
              >
                <swiper-slide v-if="selectedImage">
                  <div class="swiper-zoom-container">
                    <img :src="selectedImage" class="w-full h-full object-contain" alt="" />
                  </div>
                </swiper-slide>
              </swiper>
            </div>
          </div>
        </div>
      </div>
    </TransitionRoot>
  </div>
</template>

<style scoped>
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.swiper-button-next,
.swiper-button-prev {
  color: theme('colors.indigo.600');
}

.swiper-pagination-bullet-active {
  background: theme('colors.indigo.600');
}

/* Dark mode */
:dark .swiper-button-next,
:dark .swiper-button-prev {
  color: theme('colors.indigo.400');
}

:dark .swiper-pagination-bullet-active {
  background: theme('colors.indigo.400');
}
</style> 