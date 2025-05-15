<script setup lang="ts">
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/vue/24/outline'
import { useLocalization } from '../../../composables/useLocalization';

const { t } = useLocalization();

const props = defineProps<{
  search: string;
  searchPlaceholder?: string;
}>()

const emit = defineEmits<{
  'update:search': [value: string];
}>()

const defaultPlaceholder = t('components.common.filter.searchFilter.placeholder');
</script>

<template>
  <div class="relative rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <SearchIcon class="h-5 w-5 text-gray-400" />
    </div>
    <input
      :value="search"
      type="text"
      :placeholder="searchPlaceholder || defaultPlaceholder"
      class="block w-full pl-10 pr-3 py-2 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
      @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template> 