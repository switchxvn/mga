<script setup lang="ts">
import { ref, watch } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  search: string
  statusFilter: string
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:statusFilter', value: string): void
  (e: 'update:pageSize', value: number): void
  (e: 'search'): void
}>()

const searchInput = ref(props.search)
const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]
const pageSizeOptions = [10, 25, 50, 100]

watch(searchInput, (newValue) => {
  emit('update:search', newValue)
})

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    emit('search')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
    <!-- Search -->
    <div class="relative flex-1 max-w-sm">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
      </div>
      <input
        v-model="searchInput"
        type="text"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md leading-5 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
        placeholder="Search categories..."
        @keyup="handleKeyPress"
      >
    </div>

    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Status Filter -->
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Status:</label>
        <select
          :value="props.statusFilter"
          @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
          class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
        >
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Items per page -->
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Show:</label>
        <select
          :value="props.pageSize"
          @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
          class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
        >
          <option
            v-for="size in pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }} items
          </option>
        </select>
      </div>
    </div>
  </div>
</template> 