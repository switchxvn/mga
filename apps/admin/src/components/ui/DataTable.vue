<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

interface Props {
  items: any[];
  loading?: boolean;
  error?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  selectedItems?: number[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  selectedItems: () => [],
  pagination: undefined
});

const emit = defineEmits<{
  'update:selectedItems': [items: number[]],
  'sort': [column: string],
  'page-change': [page: number],
  'clear-error': []
}>();

const selectedItems = ref<number[]>(props.selectedItems || []);

watch(() => props.selectedItems, (newVal) => {
  selectedItems.value = newVal || [];
});

const toggleSelectAll = () => {
  if (selectedItems.value.length === props.items.length) {
    emit('update:selectedItems', []);
  } else {
    emit('update:selectedItems', props.items.map(item => item.id));
  }
};

const toggleItemSelection = (itemId: number) => {
  const newSelection = [...selectedItems.value];
  const index = newSelection.indexOf(itemId);
  
  if (index === -1) {
    newSelection.push(itemId);
  } else {
    newSelection.splice(index, 1);
  }
  
  emit('update:selectedItems', newSelection);
};

const handleSort = (column: string) => {
  emit('sort', column);
};
</script>

<template>
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
            @click="$emit('clear-error')"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </TransitionRoot>

  <!-- Enhanced Loading State -->
  <div v-if="loading" class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
    <div class="animate-pulse space-y-4">
      <div v-for="i in 5" :key="i" class="flex space-x-4">
        <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div v-else class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-neutral-700">
          <tr>
            <!-- Selection Column -->
            <th v-if="$slots.selection" scope="col" class="px-6 py-3 text-left">
              <slot 
                name="selection-header" 
                :toggle-all="toggleSelectAll"
                :selected-items="selectedItems"
                :total-items="items.length"
              >
                <input
                  type="checkbox"
                  class="checkbox rounded"
                  :checked="selectedItems.length === items.length"
                  :indeterminate="selectedItems.length > 0 && selectedItems.length < items.length"
                  @change="toggleSelectAll"
                />
              </slot>
            </th>
            
            <!-- Custom Header Columns -->
            <slot name="header" :sort-by="sortBy" :sort-order="sortOrder" :handle-sort="handleSort">
              <!-- Default header if no custom header provided -->
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
            </slot>
          </tr>
        </thead>
        
        <tbody class="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr 
            v-for="item in items" 
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150 ease-in-out"
          >
            <!-- Selection Column -->
            <td v-if="$slots.selection" class="px-6 py-4 whitespace-nowrap">
              <slot 
                name="selection" 
                :item="item"
                :is-selected="selectedItems.includes(item.id)"
                :toggle-selection="toggleItemSelection"
              >
                <input
                  type="checkbox"
                  class="checkbox rounded"
                  :checked="selectedItems.includes(item.id)"
                  @change="toggleItemSelection(item.id)"
                />
              </slot>
            </td>

            <!-- Custom Row Content -->
            <slot name="row" :item="item" />
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination" class="px-6 py-4">
      <slot name="pagination" :pagination="pagination" :on-page-change="(page: number) => $emit('page-change', page)">
        <PaginationComponent
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.total"
          :items-per-page="pagination.pageSize"
          @page-change="$emit('page-change', $event)"
        />
      </slot>
    </div>
  </div>
</template> 