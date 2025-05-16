<script setup lang="ts">
import { computed } from 'vue';
import { useLocalization } from '../../../composables/useLocalization';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  maxVisiblePages?: number;
  showItemsInfo?: boolean;
}

const { t } = useLocalization();

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5,
  showItemsInfo: true
});

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
}>();

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(props.maxVisiblePages / 2);
  let start = Math.max(1, props.currentPage - halfVisible);
  let end = Math.min(props.totalPages, start + props.maxVisiblePages - 1);

  // Adjust start if we're near the end
  if (end - start + 1 < props.maxVisiblePages) {
    start = Math.max(1, end - props.maxVisiblePages + 1);
  }

  // Add first page
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  // Add visible pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add last page
  if (end < props.totalPages) {
    if (end < props.totalPages - 1) pages.push('...');
    pages.push(props.totalPages);
  }

  return pages;
});

const startItem = computed(() => (props.currentPage - 1) * props.itemsPerPage + 1);
const endItem = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems));

const handlePageChange = (page: number | string) => {
  if (typeof page === 'number' && page !== props.currentPage) {
    emit('page-change', page);
  }
};
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-gray-700">
    <!-- Items info -->
    <div v-if="showItemsInfo" class="text-sm text-gray-700 dark:text-gray-300">
      <p class="flex items-center gap-1">
        <span>{{ t('components.common.pagination.showing') }}</span>
        <span class="font-medium">{{ startItem }}</span>
        <span>{{ t('components.common.pagination.to') }}</span>
        <span class="font-medium">{{ endItem }}</span>
        <span>{{ t('components.common.pagination.of') }}</span>
        <span class="font-medium">{{ totalItems }}</span>
        <span>{{ t('components.common.pagination.results') }}</span>
      </p>
    </div>

    <!-- Pagination buttons -->
    <div class="flex items-center gap-2">
      <!-- Previous button -->
      <button
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn btn-sm btn-ghost"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        :aria-label="t('components.common.pagination.previous')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Page numbers -->
      <div class="join">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="handlePageChange(page)"
          :disabled="page === '...'"
          class="join-item btn btn-sm"
          :class="{
            'btn-primary': page === currentPage,
            'btn-ghost': page !== currentPage && page !== '...',
            'btn-disabled cursor-default hover:bg-transparent': page === '...'
          }"
          :aria-label="page === '...' ? '' : `${t('components.common.pagination.page')} ${page}`"
        >
          {{ page }}
        </button>
      </div>

      <!-- Next button -->
      <button
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn btn-sm btn-ghost"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
        :aria-label="t('components.common.pagination.next')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template> 