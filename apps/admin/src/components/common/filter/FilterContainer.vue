<script setup lang="ts">
// FilterContainer.vue - Container component cho các filter với các slots riêng biệt
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-4 mb-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Search Filter -->
      <div>
        <slot name="search"></slot>
      </div>
      
      <!-- Status Filter -->
      <div>
        <slot name="status"></slot>
      </div>
      
      <!-- Language Filter -->
      <div>
        <slot name="language"></slot>
      </div>
      
      <!-- Page Size Filter -->
      <div>
        <slot name="pageSize"></slot>
      </div>
    </div>
  </div>
</template> 