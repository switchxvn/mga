<script setup lang="ts">
import { computed } from 'vue';
import { useLocalization } from '../../../composables/useLocalization';

interface StatusFilterOption<T = any> {
  value: T;
  label: string;
}

const { t } = useLocalization();

const props = defineProps<{
  modelValue?: any;
  options?: StatusFilterOption[];
  publishedLabel?: string;
  unpublishedLabel?: string;
  anyLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

// Provide default options for published/unpublished for backward compatibility
const defaultOptions = computed<StatusFilterOption[]>(() => [
  { value: undefined, label: props.anyLabel || t('components.common.filter.statusFilter.allStatus') },
  { value: true, label: props.publishedLabel || t('components.common.filter.statusFilter.published') },
  { value: false, label: props.unpublishedLabel || t('components.common.filter.statusFilter.unpublished') }
]);

// Use provided options or default boolean options
const filterOptions = computed(() => props.options || defaultOptions.value);

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  let value = target.value;
  
  // Convert string 'true' and 'false' to actual boolean values for backwards compatibility
  if (value === 'true') value = true;
  else if (value === 'false') value = false;
  else if (value === 'undefined') value = undefined;
  
  emit('update:modelValue', value === 'undefined' ? undefined : value);
};
</script>

<template>
  <div>
    <select
      id="status-filter"
      :value="modelValue === undefined ? 'undefined' : modelValue"
      @change="handleChange"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
    >
      <option v-for="option in filterOptions" :key="String(option.value)" :value="option.value === undefined ? 'undefined' : option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template> 