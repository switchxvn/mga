<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Dashboard - Admin Panel'
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor your business metrics and recent activities
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-calendar"
        >
          This Week
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-document-arrow-down"
        >
          Download Report
        </UButton>
      </div>
    </header>

    <main class="space-y-6">
      <StatsGrid />
      <RecentActivity />
    </main>
  </div>
</template> 