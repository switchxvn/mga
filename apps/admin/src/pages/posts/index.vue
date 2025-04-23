<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { 
  PlusCircle, 
  AlertCircle,
  Pencil,
  Trash2
} from "lucide-vue-next";

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

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface Post {
  id: number;
  title: string;
  content: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  categories: any[];
  postTags: any[];
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
const status = ref<PostStatus | undefined>(route.query.status as PostStatus | undefined);
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

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    status: status.value
  };

  // Remove undefined values
  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

  router.replace({ query });
};

// Watch for changes in filters and update URL
watch([page, search, status], () => {
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
      status: status.value === undefined ? undefined : status.value
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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between mb-8">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Posts Management
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create, edit and manage your blog posts
        </p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <NuxtLink
          to="/posts/create"
          class="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusCircle class="h-4 w-4 mr-2" />
          Create Post
        </NuxtLink>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="rounded-md bg-red-50 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <AlertCircle class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white dark:bg-neutral-800 shadow sm:rounded-lg p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search posts..."
          class="input input-bordered flex-1"
          @input="handleSearch"
        />
        <select 
          v-model="status" 
          class="select select-bordered w-full sm:w-48"
          @change="fetchPosts"
        >
          <option :value="undefined">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-neutral-800 shadow sm:rounded-lg p-6">
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded"></div>
        <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded"></div>
      </div>
    </div>

    <!-- Posts Table -->
    <div v-else class="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="post in posts.items" :key="post.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ post.title }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-100 text-yellow-800': post.status === 'DRAFT',
                    'bg-green-100 text-green-800': post.status === 'PUBLISHED',
                    'bg-gray-100 text-gray-800': post.status === 'ARCHIVED'
                  }"
                >
                  {{ post.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(post.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <NuxtLink
                    :to="`/posts/edit/${post.id}`"
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <Pencil class="h-4 w-4" />
                  </NuxtLink>
                  <button
                    @click="handleDelete(post.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-neutral-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex justify-between items-center w-full">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing page {{ posts.page }} of {{ posts.totalPages }}
          </div>
          <div class="join">
            <button
              v-for="pageNum in posts.totalPages"
              :key="pageNum"
              class="join-item btn btn-sm"
              :class="{ 'btn-active': pageNum === page }"
              @click="page = pageNum; fetchPosts()"
            >
              {{ pageNum }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 