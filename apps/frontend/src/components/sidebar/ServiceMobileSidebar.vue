<script setup lang="ts">
import { ref } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import type { ServiceFilter } from '../../composables/useService';
import ServiceSidebar from './ServiceSidebar.vue';

const { t } = useLocalization();

const props = defineProps<{
  initialFilters: ServiceFilter;
}>();

const emit = defineEmits<{
  (e: 'filter-change', filters: ServiceFilter): void;
}>();

const isOpen = ref(false);

const handleFilterChange = (filters: ServiceFilter) => {
  emit('filter-change', filters);
};
</script>

<template>
  <div class="service-mobile-sidebar lg:hidden">
    <!-- Filter Button -->
    <button
      @click="isOpen = true"
      class="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
    >
      <i class="i-heroicons-funnel-20-solid h-5 w-5" />
      {{ t('common.filters') }}
    </button>

    <!-- Sidebar Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-hidden"
      @click="isOpen = false"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50" />

      <!-- Sidebar Panel -->
      <div
        class="absolute inset-y-0 right-0 flex max-w-full"
        @click.stop
      >
        <div class="relative w-screen max-w-md">
          <!-- Close Button -->
          <div class="absolute right-0 top-0 -ml-8 flex pr-2 pt-4">
            <button
              @click="isOpen = false"
              class="rounded-md text-gray-300 hover:text-white focus:outline-none"
            >
              <i class="i-heroicons-x-mark-20-solid h-6 w-6" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl dark:bg-gray-800">
            <div class="px-4 sm:px-6">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ t('common.filters') }}
              </h2>
            </div>
            <div class="relative mt-6 flex-1 px-4 sm:px-6">
              <ServiceSidebar
                :initial-filters="initialFilters"
                @filter-change="handleFilterChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 