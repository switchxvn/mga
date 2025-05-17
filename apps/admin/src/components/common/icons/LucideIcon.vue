<script setup lang="ts">
defineProps<{
  icon: any;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}>();
</script>

<template>
  <component 
    :is="icon" 
    :size="size || 24" 
    :color="color"
    :stroke-width="strokeWidth || 2"
    class="lucide-icon"
  />
</template>

<style scoped>
.lucide-icon {
  display: inline-block;
  vertical-align: middle;
  min-width: 1em;
  min-height: 1em;
}
</style> 