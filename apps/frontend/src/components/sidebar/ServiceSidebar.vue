<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
import type { ServiceFilter } from '../../composables/useService';

const { t } = useLocalization();
const trpc = useTrpc();

const props = defineProps<{
  initialFilters: ServiceFilter;
}>();

const emit = defineEmits<{
  (e: 'filter-change', filters: ServiceFilter): void;
}>();

// Local state
const filters = ref<ServiceFilter>({ ...props.initialFilters });
const categories = ref<Array<{ id: number; name: string; slug: string }>>([]);
const isLoadingCategories = ref(false);

// Fetch categories
const fetchCategories = async () => {
  try {
    isLoadingCategories.value = true;
    const result = await trpc.category.getServiceCategories.query();
    categories.value = result;
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    isLoadingCategories.value = false;
  }
};

// Watch for filter changes
watch(filters, (newFilters) => {
  emit('filter-change', newFilters);
}, { deep: true });

// Fetch data on mount
fetchCategories();
</script>

<template>
  <div class="service-sidebar rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <!-- Search -->
    <div class="mb-6">
      <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
        {{ t('services.search') }}
      </h3>
      <div class="relative">
        <input
          v-model="filters.search"
          type="text"
          :placeholder="t('services.searchPlaceholder')"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        >
        <i class="i-heroicons-magnifying-glass-20-solid absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      </div>
    </div>

    <!-- Categories -->
    <div class="mb-6">
      <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
        {{ t('services.categories') }}
      </h3>
      <div v-if="isLoadingCategories" class="flex items-center justify-center py-4">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-r-transparent" />
      </div>
      <div v-else class="space-y-2">
        <label
          v-for="category in categories"
          :key="category.id"
          class="flex cursor-pointer items-center"
        >
          <input
            type="checkbox"
            :checked="filters.categories?.includes(category.id)"
            @change="
              filters.categories = filters.categories || [];
              if ($event.target.checked) {
                filters.categories.push(category.id);
              } else {
                filters.categories = filters.categories.filter((id) => id !== category.id);
              }
            "
            class="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          >
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ category.name }}</span>
        </label>
      </div>
    </div>

    <!-- Featured -->
    <div class="mb-6">
      <label class="flex cursor-pointer items-center">
        <input
          v-model="filters.isFeatured"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
        >
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ t('services.featured') }}</span>
      </label>
    </div>

    <!-- New -->
    <div class="mb-6">
      <label class="flex cursor-pointer items-center">
        <input
          v-model="filters.isNew"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
        >
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ t('services.new') }}</span>
      </label>
    </div>

    <!-- Reset Filters -->
    <button
      @click="
        filters.search = '';
        filters.categories = undefined;
        filters.isFeatured = false;
        filters.isNew = false;
      "
      class="mt-4 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
    >
      {{ t('common.resetFilters') }}
    </button>
  </div>
</template> 