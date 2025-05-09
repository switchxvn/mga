<script setup lang="ts">
import type { AdminPost, PaginatedResponse } from '@ew/shared';
import { PostStatus } from '@ew/shared';
import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from '@headlessui/vue';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import {
  ArchiveIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  ListChecksIcon,
  XCircleIcon as LucideXCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  Trash2Icon,
  TrashIcon,
  ZoomInIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { onMounted, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};
import SearchFilter from '../../components/common/filter/SearchFilter.vue';
import StatusFilter from '../../components/common/filter/StatusFilter.vue';
import PageSizeFilter from '../../components/common/filter/PageSizeFilter.vue';
import FilterContainer from '../../components/common/filter/FilterContainer.vue';
import DataTable from '../../components/common/table/DataTable.vue';
import PageHeader from '../../components/common/header/PageHeader.vue';
import PermissionAlert from '../../components/common/PermissionAlert.vue';
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import PermissionGate from '../../components/common/PermissionGate.vue';
import AuthWrapper from '../../components/common/AuthWrapper.vue';
import { usePermissions } from '../../composables/usePermissions';

definePageMeta({
  middleware: ["auth", "permission"],
});

useHead({
  title: 'Posts Management - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth, user } = useAuth();
const trpc = useTrpc();
const { hasPermission, isSuperAdmin } = usePermissions();
const userCanViewPosts = computed(() => {
  if (isSuperAdmin.value) {
    console.log('User is SUPER_ADMIN, can view posts');
    return true;
  }
  const canView = hasPermission('VIEW_POSTS');
  console.log('User can view posts:', canView);
  return canView;
});

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
const posts = ref<PaginatedResponse<AdminPost>>({
  items: [],
  total: 0,
  currentPage: 1,
  limit: 10,
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

    // Không cần kiểm tra quyền ở đây, PermissionGate sẽ xử lý
    const result = await trpc.admin.posts.getAllPosts.query({
      page: page.value,
      limit: pageSize.value,
      search: search.value || undefined,
      published: publishedFilter.value
    });

    posts.value = result;
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

// Add bulk actions handler
async function handleBulkAction(action: string) {
  const selectedCount = selectedPosts.value.length;
  if (!selectedCount) return;

  let confirmConfig: any = {
    icon: 'question' as const,
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    title: '',
    text: '',
    confirmButtonColor: ''
  };

  switch (action) {
    case 'publish':
      confirmConfig = {
        ...confirmConfig,
        title: 'Publish Selected Posts?',
        text: `Are you sure you want to publish ${selectedCount} selected posts?`,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Yes, publish them'
      };
      break;
    case 'unpublish':
      confirmConfig = {
        ...confirmConfig,
        title: 'Unpublish Selected Posts?',
        text: `Are you sure you want to unpublish ${selectedCount} selected posts?`,
        confirmButtonColor: '#6B7280',
        confirmButtonText: 'Yes, unpublish them'
      };
      break;
    case 'archive':
      confirmConfig = {
        ...confirmConfig,
        title: 'Archive Selected Posts?',
        text: `Are you sure you want to archive ${selectedCount} selected posts?`,
        confirmButtonColor: '#6366F1',
        confirmButtonText: 'Yes, archive them'
      };
      break;
    case 'unarchive':
      confirmConfig = {
        ...confirmConfig,
        title: 'Unarchive Selected Posts?',
        text: `Are you sure you want to unarchive ${selectedCount} selected posts?`,
        confirmButtonColor: '#8B5CF6',
        confirmButtonText: 'Yes, unarchive them'
      };
      break;
    case 'duplicate':
      confirmConfig = {
        ...confirmConfig,
        title: 'Duplicate Selected Posts?',
        text: `Are you sure you want to duplicate ${selectedCount} selected posts?`,
        confirmButtonColor: '#2563EB',
        confirmButtonText: 'Yes, duplicate them'
      };
      break;
    case 'delete':
      confirmConfig = {
        ...confirmConfig,
        title: 'Delete Selected Posts?',
        text: `Are you sure you want to permanently delete ${selectedCount} selected posts? This action cannot be undone.`,
        confirmButtonColor: '#DC2626',
        confirmButtonText: 'Yes, delete them',
        icon: 'warning' as const
      };
      break;
  }

  const result = await Swal.fire(confirmConfig);
  if (!result.isConfirmed) return;

  try {
    isLoading.value = true;

    switch (action) {
      case 'publish':
      case 'unpublish':
        await Promise.all(
          selectedPosts.value.map(postId => {
            return trpc.admin.posts.updatePostStatus.mutate({
              id: postId,
              status: action === 'publish' ? PostStatus.PUBLISHED : PostStatus.DRAFT
            });
          })
        );
        break;
      case 'delete':
        await Promise.all(
          selectedPosts.value.map(postId => 
            trpc.admin.posts.deletePost.mutate(postId)
          )
        );
        break;
      // Add more cases for other actions when backend support is added
    }

    // Refresh posts list
    await fetchPosts();
    selectedPosts.value = [];

    Swal.fire({
      title: 'Success!',
      text: `Successfully performed ${action} on ${selectedCount} posts`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err: any) {
    error.value = err.message || `Failed to ${action} posts`;
    console.error(`Error performing ${action} on posts:`, err);
    
    Swal.fire({
      title: 'Error!',
      text: err.message || `Failed to ${action} posts`,
      icon: 'error' as const
    });
  } finally {
    isLoading.value = false;
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
    selectedPosts.value = posts.value.items.map((post: AdminPost) => post.id);
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

// Add toggle published function
async function togglePublished(post: AdminPost) {
  const newStatus = !post.published;
  
  const result = await Swal.fire({
    title: `${newStatus ? 'Publish' : 'Unpublish'} Post?`,
    text: `Are you sure you want to ${newStatus ? 'publish' : 'unpublish'} "${post.title}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Yes, ${newStatus ? 'publish' : 'unpublish'} it!`,
    cancelButtonText: 'Cancel',
    confirmButtonColor: newStatus ? '#10B981' : '#6B7280',
  });

  if (!result.isConfirmed) return;

  try {
    await trpc.admin.posts.updatePostStatus.mutate({
      id: post.id,
      status: newStatus ? PostStatus.PUBLISHED : PostStatus.DRAFT
    });
    
    post.published = newStatus;

    Swal.fire({
      title: 'Success!',
      text: `Post ${newStatus ? 'published' : 'unpublished'} successfully`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err: any) {
    const errorMessage = err.message || "Failed to update post status";
    error.value = errorMessage;
    console.error("Error updating post status:", err);
    
    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error' as const
    });
  }
}
</script>

<template>
  <AuthWrapper @auth-success="fetchPosts">
    <div class="space-y-6">
      <PageHeader 
        title="Posts Management" 
        description="Create, edit and manage blog posts"
      >
        <template #actions>
          <NuxtLink
            to="/posts/create"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon class="h-5 w-5 mr-2" /> 
            Create New Post
          </NuxtLink>
        </template>
      </PageHeader>

      <!-- Bulk actions toolbar -->
      <TransitionRoot
        :show="showBulkActions"
        as="template"
        enter="transition ease-out duration-200"
        enter-from="opacity-0 -translate-y-4"
        enter-to="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leave-from="opacity-100 translate-y-0"
        leave-to="opacity-0 -translate-y-4"
      >
        <div v-if="showBulkActions" class="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
                {{ selectedPosts.length }} items selected
              </span>
              <div class="flex space-x-2">
                <button
                  @click="handleBulkAction('publish')"
                  class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <EyeIcon class="h-4 w-4 mr-1" />
                  Publish
                </button>
                <button
                  @click="handleBulkAction('unpublish')"
                  class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <EyeOffIcon class="h-4 w-4 mr-1" />
                  Unpublish
                </button>
                <button
                  @click="handleBulkAction('duplicate')"
                  class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CopyIcon class="h-4 w-4 mr-1" />
                  Duplicate
                </button>
                <button
                  @click="handleBulkAction('delete')"
                  class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon class="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
            <button
              @click="clearSelection"
              class="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </TransitionRoot>

      <!-- Permission Check -->
      <PermissionGate :permissions="['VIEW_POSTS']">
        <!-- Permission Denied Alert -->
        <template v-slot:default>
          <!-- Search and Filter -->
          <FilterContainer>
            <SearchFilter 
              v-model="search" 
              placeholder="Search posts..."
              class="w-full md:w-auto"
            />
            
            <StatusFilter 
              v-model="publishedFilter"
              published-label="Published" 
              unpublished-label="Draft"
              any-label="All status"
              class="w-full md:w-auto"
            />
            
            <PageSizeFilter 
              v-model="pageSize"
              class="w-full md:w-auto"
            />
          </FilterContainer>

          <!-- Error Alert -->
          <div v-if="error && !isLoading" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4 dark:bg-red-900/30 dark:border-red-500">
            <div class="flex">
              <div class="flex-shrink-0">
                <LucideXCircleIcon class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700 dark:text-red-300">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

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
          <DataTable
            :items="posts.items"
            :loading="isLoading"
            :error="error"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            :selected-items="selectedPosts"
            :pagination="{
              currentPage: page,
              totalPages: posts.totalPages,
              total: posts.total,
              pageSize: pageSize
            }"
            @page-change="page = $event"
            @toggle-select-all="toggleSelectAll"
            @toggle-item-selection="togglePostSelection"
            @sort="handleSort"
          >
            <!-- Selection slot -->
            <template #selection="{ item, isSelected, toggleSelection }">
              <input
                type="checkbox"
                class="checkbox rounded"
                :checked="isSelected"
                @change="toggleSelection(item.id)"
              />
            </template>

            <!-- Header slot -->
            <template #header="{ sortBy, sortOrder, handleSort }">
              <th scope="col" class="px-6 py-3 text-left">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thumbnail</span>
              </th>
              <th 
                v-for="column in ['Title', 'Status', 'Created At', 'Actions']" 
                :key="column"
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
                @click="handleSort(column.toLowerCase())"
              >
                <div class="flex items-center gap-2">
                  {{ column }}
                  <ChevronDownIcon v-if="sortBy !== column.toLowerCase()" class="h-4 w-4" />
                  <ChevronUpIcon v-else-if="sortOrder === 'asc'" class="h-4 w-4" />
                  <ChevronDownIcon v-else class="h-4 w-4" />
                </div>
              </th>
            </template>

            <!-- Row slot -->
            <template #row="{ item: post }">
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
                    <p v-if="post.shortDescription" class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] truncate">
                      {{ post.shortDescription }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="togglePublished(post)"
                  :class="{
                    'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 cursor-pointer transition-colors duration-200': true,
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800': post.published,
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600': !post.published
                  }"
                >
                  <div class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-green-500': post.published,
                      'bg-gray-500': !post.published
                    }"
                  ></div>
                  {{ post.published ? 'Published' : 'Draft' }}
                </button>
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
            </template>
          </DataTable>
        </template>
        
        <!-- AccessDenied template -->
        <template v-slot:access-denied>
          <PermissionAlert
            :requiredPermissions="['VIEW_POSTS']"
            type="error"
          />
        </template>
      </PermissionGate>

      <!-- Modal for image zoom -->
      <TransitionRoot :show="isZoomModalOpen" as="template">
        <div
          v-if="isZoomModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          @click="closeZoomModal"
        >
          <div
            class="max-w-4xl max-h-[90vh] overflow-auto p-2 bg-white dark:bg-neutral-800 rounded-lg"
            @click.stop
          >
            <img
              v-if="selectedImage"
              :src="selectedImage"
              class="max-w-full h-auto"
              alt="Zoomed post image"
            />
          </div>
        </div>
      </TransitionRoot>
    </div>
  </AuthWrapper>
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