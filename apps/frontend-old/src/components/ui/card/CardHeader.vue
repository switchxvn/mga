<script setup lang="ts">
defineOptions({
  name: 'CardHeaderComponent'
})
</script>

<template>
  <div class="flex flex-col space-y-1.5 p-6">
    <slot />
  </div>
</template> 