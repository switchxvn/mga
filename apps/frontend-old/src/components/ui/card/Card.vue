<script setup lang="ts">
defineOptions({
  name: 'CardComponent'
})
</script>

<template>
  <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
    <slot />
  </div>
</template> 