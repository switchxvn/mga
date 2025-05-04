<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../../composables/useAuth";
import { useTrpc } from "../../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  PencilIcon,
  PlusCircleIcon,
  Trash2Icon,
  MoreHorizontalIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import FilterContainer from '../../../components/common/filter/FilterContainer.vue';
import SearchFilter from '../../../components/common/filter/SearchFilter.vue';
import PageSizeFilter from '../../../components/common/filter/PageSizeFilter.vue';
import DataTable from '../../../components/common/table/DataTable.vue';
import PageHeader from '../../../components/common/header/PageHeader.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Review Service Types - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Define interface for service type translation
interface ServiceTypeTranslation {
  id: number;
  locale: string;
  name: string;
  description?: string;
}

// Define interface for service type
interface ServiceType {
  id: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  translations: ServiceTypeTranslation[];
}

// Initial state
const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const serviceTypes = ref<{
  items: ServiceType[];
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

const selectedServiceTypes = ref<number[]>([]);
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    sortBy: sortBy.value !== 'createdAt' ? sortBy.value : undefined,
    sortOrder: sortOrder.value !== 'desc' ? sortOrder.value : undefined
  };

  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);
  router.replace({ query });
};

// Watch for changes in filter parameters
watch([page, search, sortBy, sortOrder], () => {
  updateQueryParams();
  fetchServiceTypes();
}, { deep: true });

// Function to fetch service types
async function fetchServiceTypes() {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await trpc.admin.review.listServiceTypes.query({
      page: page.value,
      limit: pageSize.value,
      search: search.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    });

    serviceTypes.value = {
      items: result.items,
      total: result.total,
      page: result.currentPage,
      pageSize: result.limit,
      totalPages: result.totalPages
    };
  } catch (err: any) {
    error.value = err.message || "Failed to load service types";
    console.error("Error loading service types:", err);
  } finally {
    isLoading.value = false;
  }
}

// Function to delete service type
async function deleteServiceType(id: number) {
  // Ask for confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This might affect existing reviews. This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      await trpc.admin.review.deleteServiceType.mutate({ id });
      await fetchServiceTypes(); // Refresh the data
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Service type has been deleted',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete service type'
      });
    }
  }
}

// Function to navigate to edit page
function editServiceType(id: number) {
  router.push(`/reviews/service-types/edit/${id}`);
}

// Function to navigate to add page
function addServiceType() {
  router.push('/reviews/service-types/add');
}

// Navigation helpers
function goToReviews() {
  router.push('/reviews');
}

// Get name for display
function getServiceTypeName(serviceType: ServiceType): string {
  const defaultLocale = 'vi';
  const translation = serviceType.translations.find(t => t.locale === defaultLocale) || serviceType.translations[0];
  
  if (!translation) return serviceType.slug;
  
  return translation.name || serviceType.slug;
}

// Load data on mounted
onMounted(async () => {
  await checkAuth();
  await fetchServiceTypes();
});

// Function to handle sorting
function handleSort(column: string) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
  fetchServiceTypes();
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <PageHeader 
      title="Review Service Types" 
      description="Manage service types for customer reviews"
      :actionButton="{
        label: 'Add New Service Type',
        onClick: addServiceType,
        icon: PlusCircleIcon
      }"
      :secondaryButton="{
        label: 'Back to Reviews',
        onClick: goToReviews
      }"
    />

    <!-- Filters -->
    <FilterContainer>
      <SearchFilter 
        v-model="search" 
        placeholder="Search by name or slug..." 
      />
      
      <PageSizeFilter 
        v-model="pageSize" 
        :options="[10, 25, 50, 100]" 
      />
    </FilterContainer>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Service Types Table -->
    <div class="mt-6">
      <DataTable
        :items="serviceTypes.items"
        :loading="isLoading"
        :pagination="{
          currentPage: serviceTypes.page,
          totalPages: serviceTypes.totalPages,
          total: serviceTypes.total,
          pageSize: serviceTypes.pageSize
        }"
        :selectedItems="selectedServiceTypes"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden"
        @update:selectedItems="selectedServiceTypes = $event"
        @page-change="page = $event"
        @sort="handleSort"
      >
        <template #header="{ sortBy: columnSortBy, sortOrder: columnSortOrder, handleSort }">
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600" @click="handleSort('name')">
            <div class="flex items-center gap-2">
              Name
              <svg v-if="columnSortBy === 'name'" class="h-4 w-4" :class="columnSortOrder === 'asc' ? '' : 'transform rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </div>
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600" @click="handleSort('slug')">
            <div class="flex items-center gap-2">
              Slug
              <svg v-if="columnSortBy === 'slug'" class="h-4 w-4" :class="columnSortOrder === 'asc' ? '' : 'transform rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </div>
          </th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Translations
          </th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600" @click="handleSort('createdAt')">
            <div class="flex items-center justify-center gap-2">
              Created At
              <svg v-if="columnSortBy === 'createdAt'" class="h-4 w-4" :class="columnSortOrder === 'asc' ? '' : 'transform rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </div>
          </th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Actions
          </th>
        </template>
        
        <template #row="{ item: serviceType }">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ getServiceTypeName(serviceType) }}</div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ serviceType.slug }}</div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {{ serviceType.translations.length }}
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ new Date(serviceType.createdAt).toLocaleDateString() }}
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex items-center justify-end">
              <Menu as="div" class="relative inline-block text-left">
                <MenuButton class="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 focus:outline-none">
                  <MoreHorizontalIcon class="h-5 w-5" />
                </MenuButton>
                
                <MenuItems class="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <button 
                      @click="editServiceType(serviceType.id)" 
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
                      @click="deleteServiceType(serviceType.id)" 
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
            <div class="text-gray-500 mb-2">No service types found</div>
            <button 
              @click="addServiceType" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircleIcon class="h-5 w-5 mr-2" />
              Add New Service Type
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template> 