<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean | undefined;
  options?: { label: string; value: boolean | undefined }[];
  placeholder?: string;
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean | undefined];
}>()

// Default options if not provided
const defaultOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Published', value: true },
  { label: 'Draft', value: false }
]

const filterOptions = props.options || defaultOptions
</script>

<template>
  <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
    <select 
      :value="modelValue === true ? 'true' : modelValue === false ? 'false' : ''"
      class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value === '' ? undefined : ($event.target as HTMLSelectElement).value === 'true')"
    >
      <option v-for="option in filterOptions" 
        :key="String(option.value)" 
        :value="option.value === undefined ? '' : String(option.value)">
        {{ option.label }}
      </option>
    </select>
  </div>
</template> 