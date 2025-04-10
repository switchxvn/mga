<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full animate-pulse">
    <!-- Image skeleton -->
    <div class="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
    
    <!-- Content skeleton -->
    <div class="p-4 space-y-4">
      <!-- Category skeleton -->
      <div class="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      
      <!-- Title skeleton -->
      <div class="space-y-2">
        <div class="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="w-1/2 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <!-- Description skeleton -->
      <div class="space-y-2">
        <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="w-4/6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <!-- Author and date skeleton -->
      <div class="flex items-center justify-between pt-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for this skeleton component
</script> 