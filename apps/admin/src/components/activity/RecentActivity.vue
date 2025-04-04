<script setup lang="ts">
const isLoading = ref(false)

const handleRefresh = () => {
  isLoading.value = true
  // Add your refresh logic here
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
</script>

<template>
  <UCard class="overflow-hidden">
    <template #header>
      <div class="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <h2 class="text-lg font-semibold leading-6">
          Recent Activity
        </h2>
        <UButton
          color="gray"
          variant="ghost"
          :loading="isLoading"
          :icon="isLoading ? undefined : 'i-heroicons-arrow-path'"
          :disabled="isLoading"
          @click="handleRefresh"
        >
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <div class="space-y-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          No recent activity to display.
        </p>
      </div>
    </div>
  </UCard>
</template> 