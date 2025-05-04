<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/vue/24/outline';
import {
  EyeIcon,
  CheckCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  Trash2Icon,
  XCircleIcon,
  ShieldIcon,
  ClockIcon,
  MoreHorizontalIcon,
  ListChecksIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import FilterContainer from '../../components/common/filter/FilterContainer.vue';
import SearchFilter from '../../components/common/filter/SearchFilter.vue';
import StatusFilter from '../../components/common/filter/StatusFilter.vue';
import PageSizeFilter from '../../components/common/filter/PageSizeFilter.vue';
import DataTable from '../../components/common/table/DataTable.vue';
import PageHeader from '../../components/common/header/PageHeader.vue';
import { RouterLink } from 'vue-router';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Reviews Management - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Enum for review status
enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

// Define interface for review translation
interface ReviewTranslation {
  id: number;
  locale: string;
  title?: string;
  content: string;
}

// Define interface for review service type
interface ReviewServiceType {
  id: number;
  slug: string;
  name?: string;
}

// Define interface for review
interface Review {
  id: number;
  authorName: string;
  authorAvatar?: string;
  profession?: string;
  rating: number;
  serviceType?: ReviewServiceType;
  visitDate?: string;
  featured: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  translations: ReviewTranslation[];
}

// Status options for filter
const statusOptions = [
  { value: ReviewStatus.ACTIVE, label: 'Active', icon: CheckCircleIcon, color: 'text-green-500' },
  { value: ReviewStatus.INACTIVE, label: 'Inactive', icon: XCircleIcon, color: 'text-red-500' },
  { value: ReviewStatus.PENDING, label: 'Pending', icon: ClockIcon, color: 'text-yellow-500' },
];

// Initial state
const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const statusFilter = ref<ReviewStatus | undefined>(
  route.query.status ? route.query.status.toString() as ReviewStatus : undefined
);
const featuredFilter = ref<boolean | undefined>(
  route.query.featured === 'true' ? true : 
  route.query.featured === 'false' ? false : 
  undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const reviews = ref<{
  items: Review[];
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

const selectedReviews = ref<number[]>([]);
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Debounced search
let searchTimeout: NodeJS.Timeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
  }, 300);
}

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    status: statusFilter.value,
    featured: featuredFilter.value !== undefined ? featuredFilter.value.toString() : undefined,
    sortBy: sortBy.value !== 'createdAt' ? sortBy.value : undefined,
    sortOrder: sortOrder.value !== 'desc' ? sortOrder.value : undefined
  };

  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);
  router.replace({ query });
};

// Watch for changes in filter parameters
watch([page, search, statusFilter, featuredFilter, sortBy, sortOrder], () => {
  updateQueryParams();
  fetchReviews();
}, { deep: true });

// Function to fetch reviews
async function fetchReviews() {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await trpc.admin.review.list.query({
      page: page.value,
      limit: pageSize.value,
      search: search.value || undefined,
      status: statusFilter.value,
      featured: featuredFilter.value
    });

    console.log("API Response:", result);

    // Handle the complex nested API response structure
    if (Array.isArray(result) && result.length > 0 && result[0]?.result?.data) {
      // Format from the JSON you provided
      const responseData = result[0].result.data;
      reviews.value = {
        items: responseData.data as Review[],
        total: responseData.meta.total,
        page: responseData.meta.page,
        pageSize: responseData.meta.limit,
        totalPages: responseData.meta.totalPages
      };
    } else if (result.data && result.meta) {
      // Standard data/meta structure
      reviews.value = {
        items: result.data as Review[],
        total: result.meta.total,
        page: result.meta.page,
        pageSize: result.meta.limit,
        totalPages: result.meta.totalPages
      };
    } else {
      // Handle raw data array (fallback)
      reviews.value = {
        items: Array.isArray(result) ? result as Review[] : [],
        total: Array.isArray(result) ? result.length : 0,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };
    }
    
    console.log("Processed reviews:", reviews.value);
  } catch (err: any) {
    error.value = err.message || "Failed to load reviews";
    console.error("Error loading reviews:", err);
  } finally {
    isLoading.value = false;
  }
}

// Function to toggle review featured status
async function toggleFeatured(id: number) {
  try {
    await trpc.admin.review.toggleFeatured.mutate({ id });
    await fetchReviews(); // Refresh the data
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Featured status updated successfully',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Failed to update featured status'
    });
  }
}

// Function to change review status
async function changeStatus(id: number, status: ReviewStatus) {
  try {
    await trpc.admin.review.updateStatus.mutate({ id, status });
    await fetchReviews(); // Refresh the data
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Status updated successfully',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Failed to update status'
    });
  }
}

// Function to delete review
async function deleteReview(id: number) {
  // Ask for confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This action cannot be undone",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      await trpc.admin.review.delete.mutate({ id });
      await fetchReviews(); // Refresh the data
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Review has been deleted',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete review'
      });
    }
  }
}

// Function to navigate to edit page
function editReview(id: number) {
  router.push(`/reviews/edit/${id}`);
}

// Function to navigate to add page
function addReview() {
  router.push('/reviews/add');
}

// Function to render rating stars
function renderRatingStars(rating: number) {
  return Array(5).fill(0).map((_, i) => 
    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
  );
}

// Get status color and icon
function getStatusInfo(status: ReviewStatus) {
  const statusOption = statusOptions.find(option => option.value === status);
  return {
    color: statusOption?.color || 'text-gray-500',
    icon: statusOption?.icon || ShieldIcon,
    label: statusOption?.label || status
  };
}

// Get review title or content for display
function getReviewTitle(review: Review): string {
  const defaultLocale = 'vi';
  const translation = review.translations.find(t => t.locale === defaultLocale) || review.translations[0];
  
  if (!translation) return 'No content';
  
  return translation.title || translation.content.substring(0, 50) + (translation.content.length > 50 ? '...' : '');
}

// Handle sorting when clicking on header
function handleSort(column: string) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
  fetchReviews();
}

// Load data on mounted
onMounted(() => {
  checkAuth().then(() => {
    fetchReviews();
  });
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <PageHeader 
      title="Reviews Management" 
      description="Manage customer reviews and testimonials"
      :actionButton="{
        label: 'Add New Review',
        onClick: addReview,
        icon: PlusCircleIcon,
        class: 'bg-primary hover:bg-primary-dark'
      }"
    >
      <template #extraActions>
        <RouterLink 
          to="/reviews/service-types" 
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <ListChecksIcon class="h-4 w-4" />
          Manage Service Types
        </RouterLink>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
      <!-- Search Filter -->
      <div class="relative rounded-md w-full mb-5">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          v-model="search"
          type="text"
          placeholder="Search by name or content..."
          class="focus:ring-primary focus:border-primary block w-full pl-10 py-2 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md"
          @input="handleSearch"
        />
      </div>

      <div class="flex flex-col md:flex-row gap-4 mb-4">
        <!-- Status Filter -->
        <div class="w-full md:w-1/2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <div class="relative">
            <select
              v-model="statusFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option :value="undefined">All Statuses</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Featured Filter -->
        <div class="w-full md:w-1/2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Featured</label>
          <div class="relative">
            <select
              v-model="featuredFilter"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option :value="undefined">All</option>
              <option :value="true">Featured</option>
              <option :value="false">Not Featured</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Items per page</label>
        <div class="relative inline-block w-48">
          <select
            v-model="pageSize"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Reviews Table -->
    <div class="mt-6">
      <DataTable
        :items="reviews.items"
        :loading="isLoading"
        :pagination="{
          currentPage: reviews.page,
          totalPages: reviews.totalPages,
          total: reviews.total,
          pageSize: reviews.pageSize
        }"
        :selectedItems="selectedReviews"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden"
        @update:selectedItems="selectedReviews = $event"
        @page-change="page = $event"
        @sort="handleSort"
      >
        <template #header="{ sortBy: columnSortBy, sortOrder: columnSortOrder, handleSort }">
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            <div class="flex items-center">Author</div>
          </th>
          <th 
            scope="col" 
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
            @click="handleSort('title')"
          >
            <div class="flex items-center gap-2">
              Review
              <ChevronDownIcon v-if="columnSortBy !== 'title'" class="h-4 w-4" />
              <ChevronUpIcon v-else-if="columnSortOrder === 'asc'" class="h-4 w-4" />
              <ChevronDownIcon v-else class="h-4 w-4" />
            </div>
          </th>
          <th 
            scope="col" 
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
            @click="handleSort('rating')"
          >
            <div class="flex items-center justify-center gap-2">
              Rating
              <ChevronDownIcon v-if="columnSortBy !== 'rating'" class="h-4 w-4" />
              <ChevronUpIcon v-else-if="columnSortOrder === 'asc'" class="h-4 w-4" />
              <ChevronDownIcon v-else class="h-4 w-4" />
            </div>
          </th>
          <th 
            scope="col" 
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
            @click="handleSort('status')"
          >
            <div class="flex items-center justify-center gap-2">
              Status
              <ChevronDownIcon v-if="columnSortBy !== 'status'" class="h-4 w-4" />
              <ChevronUpIcon v-else-if="columnSortOrder === 'asc'" class="h-4 w-4" />
              <ChevronDownIcon v-else class="h-4 w-4" />
            </div>
          </th>
          <th 
            scope="col" 
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
            @click="handleSort('featured')"
          >
            <div class="flex items-center justify-center gap-2">
              Featured
              <ChevronDownIcon v-if="columnSortBy !== 'featured'" class="h-4 w-4" />
              <ChevronUpIcon v-else-if="columnSortOrder === 'asc'" class="h-4 w-4" />
              <ChevronDownIcon v-else class="h-4 w-4" />
            </div>
          </th>
          <th 
            scope="col" 
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
            @click="handleSort('createdAt')"
          >
            <div class="flex items-center justify-center gap-2">
              Date
              <ChevronDownIcon v-if="columnSortBy !== 'createdAt'" class="h-4 w-4" />
              <ChevronUpIcon v-else-if="columnSortOrder === 'asc'" class="h-4 w-4" />
              <ChevronDownIcon v-else class="h-4 w-4" />
            </div>
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            <div class="flex items-center justify-end">Actions</div>
          </th>
        </template>
        
        <template #row="{ item: review }">
          <!-- Author Column -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div 
                v-if="review.authorAvatar" 
                class="h-10 w-10 mr-3 rounded-full bg-cover bg-center"
                :style="`background-image: url(${review.authorAvatar})`"
              ></div>
              <div v-else class="h-10 w-10 mr-3 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-gray-500 text-lg font-medium">{{ review.authorName.charAt(0) }}</span>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">{{ review.authorName }}</div>
                <div v-if="review.profession" class="text-sm text-gray-500 dark:text-gray-400">{{ review.profession }}</div>
              </div>
            </div>
          </td>
          
          <!-- Review Content Column -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="max-w-xs">
              <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ getReviewTitle(review) }}</div>
              <div v-if="review.serviceType" class="text-xs text-gray-500 dark:text-gray-400">
                {{ review.serviceType.name || review.serviceType.slug }}
              </div>
            </div>
          </td>
          
          <!-- Rating Column -->
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              <span class="flex items-center">
                <StarIcon class="w-3.5 h-3.5 mr-1 text-amber-500 fill-current" />
                {{ review.rating }}
              </span>
            </div>
          </td>
          
          <!-- Status Column -->
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': review.status === ReviewStatus.ACTIVE,
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': review.status === ReviewStatus.INACTIVE,
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': review.status === ReviewStatus.PENDING,
              }">
              {{ getStatusInfo(review.status).label }}
            </div>
          </td>
          
          <!-- Featured Column -->
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer"
              @click="toggleFeatured(review.id)"
              :class="{
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': review.featured,
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !review.featured
              }">
              <CheckIcon v-if="review.featured" class="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400 fill-current" />
              <XMarkIcon v-else class="w-3.5 h-3.5 mr-1 text-gray-500 dark:text-gray-400 fill-current" />
              {{ review.featured ? 'Featured' : 'Not Featured' }}
            </div>
          </td>
          
          <!-- Date Column -->
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ new Date(review.createdAt).toLocaleDateString() }}
            </div>
          </td>
          
          <!-- Actions Column -->
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex items-center justify-end">
              <Menu as="div" class="relative inline-block text-left">
                <MenuButton class="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 focus:outline-none">
                  <MoreHorizontalIcon class="h-5 w-5" />
                </MenuButton>
                
                <MenuItems class="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="editReview(review.id)" 
                      class="flex w-full items-center px-4 py-2 text-sm"
                      :class="active ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'"
                    >
                      <PencilIcon class="mr-3 h-4 w-4" />
                      Edit
                    </button>
                  </MenuItem>
                  
                  <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="changeStatus(review.id, ReviewStatus.ACTIVE)" 
                      class="flex w-full items-center px-4 py-2 text-sm"
                      :class="active ? 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                      :disabled="review.status === ReviewStatus.ACTIVE"
                    >
                      <CheckCircleIcon class="mr-3 h-4 w-4 text-green-500" />
                      Mark as Active
                    </button>
                  </MenuItem>
                  
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="changeStatus(review.id, ReviewStatus.INACTIVE)" 
                      class="flex w-full items-center px-4 py-2 text-sm"
                      :class="active ? 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                      :disabled="review.status === ReviewStatus.INACTIVE"
                    >
                      <XCircleIcon class="mr-3 h-4 w-4 text-red-500" />
                      Mark as Inactive
                    </button>
                  </MenuItem>
                  
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="changeStatus(review.id, ReviewStatus.PENDING)" 
                      class="flex w-full items-center px-4 py-2 text-sm"
                      :class="active ? 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                      :disabled="review.status === ReviewStatus.PENDING"
                    >
                      <ClockIcon class="mr-3 h-4 w-4 text-yellow-500" />
                      Mark as Pending
                    </button>
                  </MenuItem>
                  
                  <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="deleteReview(review.id)" 
                      class="flex w-full items-center px-4 py-2 text-sm"
                      :class="active ? 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300' : 'text-red-600 dark:text-red-400'"
                    >
                      <Trash2Icon class="mr-3 h-4 w-4" />
                      Delete
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </td>
        </template>
        
        <template #empty>
          <div class="text-center py-10">
            <div class="text-gray-500 mb-2">No reviews found</div>
            <button 
              @click="addReview" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircleIcon class="h-5 w-5 mr-2" />
              Add New Review
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template> 