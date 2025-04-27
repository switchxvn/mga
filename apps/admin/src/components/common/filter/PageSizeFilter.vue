<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
  options?: { label: string; value: number }[];
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>()

// Default options if not provided
const defaultOptions = [
  { label: '10 per page', value: 10 },
  { label: '25 per page', value: 25 },
  { label: '50 per page', value: 50 }
]

const pageSizeOptions = props.options || defaultOptions
</script>

<template>
  <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
    <select 
      :value="modelValue"
      class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
      @change="$emit('update:modelValue', Number(($event.target as HTMLSelectElement).value))"
    >
      <option v-for="option in pageSizeOptions" 
        :key="option.value" 
        :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template> 