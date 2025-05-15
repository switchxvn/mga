
<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  ChevronDownIcon
} from '@heroicons/vue/24/outline';
import {
  ImageIcon,
  LayoutIcon,
  ListChecksIcon,
  MoveVerticalIcon,
  PencilIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  TrashIcon,
  XCircleIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import FilterContainer from '../../components/common/filter/FilterContainer.vue';
import PageSizeFilter from '../../components/common/filter/PageSizeFilter.vue';
import SearchFilter from '../../components/common/filter/SearchFilter.vue';
import StatusFilter from '../../components/common/filter/StatusFilter.vue';
import PageHeader from '../../components/common/header/PageHeader.vue';
import PermissionGate from '../../components/common/PermissionGate.vue';
import DataTable from '../../components/common/table/DataTable.vue';
import { useAuth } from "../../composables/useAuth";
import { usePermissions } from '../../composables/usePermissions';
import { useTrpc } from "../../composables/useTrpc";

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth", "permission"],
});

useHead({
  title: 'Hero Slider Management - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();
const { hasPermission, isSuperAdmin } = usePermissions();

// State
const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const activeFilter = ref<boolean | undefined>(
  route.query.active === 'true' ? true : 
  route.query.active === 'false' ? false : 
  undefined
);
const themeId = ref<number | undefined>(
  route.query.themeId ? Number(route.query.themeId) : undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const heroSliders = ref<any[]>([]); // Should match the structure of HeroSlider entity
const themes = ref<any[]>([]);

const selectedSliders = ref<number[]>([]);
const sortBy = ref('order');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    active: activeFilter.value !== undefined ? activeFilter.value.toString() : undefined,
    themeId: themeId.value ? themeId.value.toString() : undefined
  };

  // Remove undefined values
  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

  router.replace({ query });
};

// Watch for changes in filters and update URL
watch([page, search, activeFilter, themeId], () => {
  updateQueryParams();
  fetchHeroSliders();
}, { deep: true });

// Fetch all themes
const fetchThemes = async () => {
  try {
    const result = await trpc.admin.theme.getAll.query();
    themes.value = result;
  } catch (err: any) {
    console.error('Error fetching themes:', err);
  }
};

// Fetch hero sliders with filters
const fetchHeroSliders = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    if (!themeId.value) {
      // If no theme selected, just set empty array
      heroSliders.value = [];
      isLoading.value = false;
      return;
    }
    
    const filters = {
      themeId: themeId.value,
      search: search.value || undefined,
      isActive: activeFilter.value
    };
    
    // Fetch data from API
    const result = await trpc.admin.heroSlider.getAll.query(filters);
    
    // Update the state
    heroSliders.value = result;
  } catch (err: any) {
    console.error('Error fetching hero sliders:', err);
    error.value = err.message || 'Failed to fetch hero sliders';
    
    // Reset to empty array on error
    heroSliders.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Delete a single hero slider
const deleteSlider = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      await trpc.admin.heroSlider.delete.mutate(id);
      Swal.fire('Deleted!', 'Hero slider has been deleted.', 'success');
      fetchHeroSliders();
    } catch (err: any) {
      console.error('Error deleting hero slider:', err);
      Swal.fire('Error!', err.message || 'Failed to delete hero slider', 'error');
    }
  }
};

// Toggle active status
const toggleActive = async (id: number, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus;
    await trpc.admin.heroSlider.update.mutate({ 
      id, 
      data: { isActive: newStatus } 
    });
    
    // Update local state
    const index = heroSliders.value.findIndex(slider => slider.id === id);
    if (index !== -1) {
      heroSliders.value[index].isActive = newStatus;
    }
    
    // Show success message
    Swal.fire({
      title: 'Success!',
      text: `Hero slider is now ${newStatus ? 'active' : 'inactive'}`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err: any) {
    console.error('Error toggling slider status:', err);
    Swal.fire('Error!', err.message || 'Failed to update slider status', 'error');
  }
};

// Bulk actions
const bulkDeleteSliders = async () => {
  if (!selectedSliders.value.length) return;

  const result = await Swal.fire({
    title: `Delete ${selectedSliders.value.length} sliders?`,
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete them!'
  });

  if (result.isConfirmed) {
    try {
      // Delete each slider
      for (const id of selectedSliders.value) {
        await trpc.admin.heroSlider.delete.mutate(id);
      }
      
      Swal.fire('Deleted!', `${selectedSliders.value.length} sliders have been deleted.`, 'success');
      selectedSliders.value = [];
      fetchHeroSliders();
    } catch (err: any) {
      console.error('Error deleting sliders:', err);
      Swal.fire('Error!', err.message || 'Failed to delete sliders', 'error');
    }
  }
};

// Reorder sliders
const reorderSliders = async () => {
  if (!themeId.value) return;
  
  try {
    // Just refresh the order based on current array order
    const orderList = heroSliders.value.map((slider, index) => ({
      id: slider.id,
      order: index
    }));
    
    await trpc.admin.heroSlider.reorder.mutate(orderList);
    Swal.fire({
      title: 'Success!',
      text: 'Sliders have been reordered',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err: any) {
    console.error('Error reordering sliders:', err);
    Swal.fire('Error!', err.message || 'Failed to reorder sliders', 'error');
  }
};

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// Initial load
onMounted(async () => {
  await checkAuth();
  await fetchThemes();
  // Only fetch sliders if themeId is specified
  if (themeId.value) {
    await fetchHeroSliders();
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Hero Slider Management"
      description="Manage hero sliders for your website themes"
    >
      <template #actions>
        <PermissionGate>
          <div class="flex items-center gap-2">
            <Menu as="div" class="relative" v-if="selectedSliders.length">
              <MenuButton class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                <ListChecksIcon class="h-4 w-4" />
                Bulk Actions ({{ selectedSliders.length }})
                <ChevronDownIcon class="h-4 w-4" />
              </MenuButton>

              <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div class="px-1 py-1">
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="bulkDeleteSliders"
                      :class="[
                        active ? 'bg-red-100 text-red-900' : 'text-red-700',
                        'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                      ]"
                    >
                      <TrashIcon class="mr-2 h-4 w-4" />
                      Delete Selected
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
            
            <button 
              v-if="themeId" 
              @click="reorderSliders"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <MoveVerticalIcon class="h-4 w-4 mr-2" />
              Update Order
            </button>
            
            <button
              v-if="themeId"
              @click="fetchHeroSliders"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <RefreshCwIcon class="h-4 w-4 mr-2" />
              Refresh
            </button>
            
            <NuxtLink
              v-if="themeId"
              to="/hero-slider/create"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircleIcon class="h-5 w-5 mr-2" />
              Add Slider
            </NuxtLink>
          </div>
        </PermissionGate>
      </template>
    </PageHeader>


    <!-- Filter Container -->
    <FilterContainer>
      <template #search>
        <SearchFilter
          :search="search"
          search-placeholder="Search sliders..."
          @update:search="search = $event"
        />
      </template>
      
      <template #status>
        <StatusFilter
          :modelValue="activeFilter"
          :options="[
            { label: 'All Status', value: undefined },
            { label: 'Active', value: true },
            { label: 'Inactive', value: false }
          ]"
          @update:modelValue="activeFilter = $event"
        />
      </template>
      
      <template #additionalFilters>
        <div class="flex items-center space-x-4">
          <div class="w-48">
            <label for="theme-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
            <select
              id="theme-filter"
              v-model="themeId"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            >
              <option :value="undefined">Select theme</option>
              <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                {{ theme.name }}
              </option>
            </select>
          </div>
        </div>
      </template>
      
      <template #pageSize>
        <PageSizeFilter
          :modelValue="pageSize"
          @update:modelValue="pageSize = $event"
        />
      </template>
    </FilterContainer>

    <!-- Hero Sliders Table -->
    <div>
      <DataTable
        :items="heroSliders"
        :loading="isLoading"
        :error="error"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        :selected-items="selectedSliders"
        :pagination="{
          currentPage: page,
          totalPages: 1,
          total: heroSliders.length,
          pageSize: pageSize
        }"
        @update:selected-items="selectedSliders = $event"
        @sort="sortBy = $event"
        @page-change="page = $event"
        @clear-error="error = null"
      >
        <template #header>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            IMAGE
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            TITLE
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            BUTTON
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            ORDER
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            STATUS
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            DATE
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            ACTIONS
          </th>
        </template>

        <template #row="{ item: slider }">
          <!-- IMAGE Column -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-16 rounded-sm bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img 
                  v-if="slider.imageUrl" 
                  :src="slider.imageUrl" 
                  class="h-10 w-16 object-cover" 
                  :alt="slider.title" 
                />
                <div v-else class="flex items-center justify-center h-full w-full">
                  <ImageIcon class="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </td>
          
          <!-- TITLE Column -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ slider.title }}
            </div>
            <div v-if="slider.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {{ slider.description }}
            </div>
          </td>
          
          <!-- BUTTON Column -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div v-if="slider.buttonText" class="flex flex-col">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ slider.buttonText }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                {{ slider.buttonLink }}
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 dark:text-gray-400">
              No button
            </div>
          </td>
          
          <!-- ORDER Column -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ slider.order }}
          </td>
          
          <!-- STATUS Column -->
          <td class="px-6 py-4 whitespace-nowrap">
            <span 
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="slider.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
            >
              {{ slider.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
          
          <!-- DATE Column -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(slider.createdAt) }}
          </td>
          
          <!-- ACTIONS Column -->
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex items-center space-x-2">
              <button @click="toggleActive(slider.id, slider.isActive)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                <component :is="slider.isActive ? ToggleRightIcon : ToggleLeftIcon" class="h-5 w-5" />
              </button>
              <NuxtLink :to="`/hero-slider/${slider.id}/edit`" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                <PencilIcon class="h-5 w-5" />
              </NuxtLink>
              <button @click="deleteSlider(slider.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </td>
        </template>

        <template #empty>
          <div class="text-center py-10">
            <LayoutIcon class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {{ themeId ? 'No hero sliders found' : 'Please select a theme first' }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ themeId ? 'Get started by creating a new hero slider.' : 'Select a theme to manage its hero sliders.' }}
            </p>
            <div class="mt-6" v-if="themeId">
              <NuxtLink
                to="/hero-slider/create"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircleIcon class="-ml-1 mr-2 h-5 w-5" />
                Add Hero Slider
              </NuxtLink>
            </div>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template> 