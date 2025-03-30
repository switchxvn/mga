<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import type { ServiceFilter } from '../../composables/useService';

const { t } = useLocalization();

const props = defineProps<{
  categories: Array<{
    id: number;
    icon: string;
    translations: Array<{
      locale: string;
      title: string;
      slug: string;
    }>;
  }>;
  locale: string;
}>();

const emit = defineEmits<{
  (e: 'filter-change', filters: ServiceFilter): void;
}>();

// Local state
const selectedCategories = ref<number[]>([]);
const isFeatured = ref(false);
const isNew = ref(false);

// Watch for filter changes
watch([selectedCategories, isFeatured, isNew], () => {
  emit('filter-change', {
    categories: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
    isFeatured: isFeatured.value || undefined,
    isNew: isNew.value || undefined,
  });
}, { deep: true });
</script>

<template>
  <aside class="w-64 lg:block">
    <div class="sticky top-24 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('services.filters') }}
      </h2>
      
      <!-- Categories -->
      <div class="mb-6">
        <h3 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('services.categories') }}
        </h3>
        <div class="space-y-2">
          <label
            v-for="category in categories"
            :key="category.id"
            class="flex items-center"
          >
            <input
              type="checkbox"
              :value="category.id"
              v-model="selectedCategories"
              class="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {{ category.translations.find(t => t.locale === locale)?.title }}
            </span>
          </label>
        </div>
      </div>

      <!-- Featured -->
      <div class="mb-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="isFeatured"
            class="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('services.featured') }}
          </span>
        </label>
      </div>

      <!-- New -->
      <div class="mb-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="isNew"
            class="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('services.new') }}
          </span>
        </label>
      </div>
    </div>
  </aside>
</template> 