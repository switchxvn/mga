<script setup lang="ts">
// FilterContainer.vue - Container component cho các filter với các slots riêng biệt
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Slot cho search filter -->
      <slot name="search"></slot>
      
      <!-- Slot cho status filter -->
      <slot name="status"></slot>
      
      <!-- Slot cho page size filter -->
      <slot name="pageSize"></slot>
      
      <!-- Slot mặc định cho các filter tùy chỉnh khác -->
      <slot></slot>
    </div>
  </div>
</template> 