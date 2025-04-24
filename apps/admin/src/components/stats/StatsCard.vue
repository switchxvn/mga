<script setup lang="ts">
interface StatItem {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: string
}

defineProps<{
  stat: StatItem
}>()
</script>

<template>
  <UCard class="p-6 hover:shadow-lg transition-shadow duration-200">
    <div class="flex items-center justify-between">
      <div class="space-y-2">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ stat.name }}
        </p>
        <p class="text-2xl font-semibold tracking-tight">
          {{ stat.value }}
        </p>
        <p
          class="inline-flex items-center text-sm font-medium"
          :class="stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'"
        >
          <UIcon
            :name="stat.changeType === 'positive' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
            class="mr-1 h-4 w-4"
          />
          {{ stat.change }}
        </p>
      </div>
      <div class="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
        <UIcon
          :name="stat.icon"
          class="h-8 w-8 text-gray-600 dark:text-gray-300"
        />
      </div>
    </div>
  </UCard>
</template> 