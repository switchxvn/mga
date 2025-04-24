<template>
  <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Search Input -->
      <div class="relative rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input
          :value="search"
          type="text"
          :placeholder="searchPlaceholder"
          class="block w-full pl-10 pr-3 py-2 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Status Filter -->
      <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <select 
          :value="publishedFilter"
          class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
          @change="$emit('update:publishedFilter', ($event.target as HTMLSelectElement).value === '' ? undefined : ($event.target as HTMLSelectElement).value === 'true')"
        >
          <option value="">All Posts</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      <!-- Items per page -->
      <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <select 
          :value="pageSize"
          class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
          @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/vue/24/outline'

defineProps<{
  search: string
  publishedFilter: boolean | undefined
  pageSize: number
  searchPlaceholder?: string
}>()

defineEmits<{
  'update:search': [value: string]
  'update:publishedFilter': [value: boolean | undefined]
  'update:pageSize': [value: number]
}>()
</script> 