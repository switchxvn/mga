<script lang="ts">
export default {
  name: 'Loader',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    color: {
      type: String,
      default: null
    }
  }
}
</script>

<template>
  <div 
    class="spinner" 
    :class="{
      'h-6 w-6': size === 'sm', 
      'h-8 w-8': size === 'md',
      'h-12 w-12': size === 'lg'
    }"
  ></div>
</template>

<style scoped>
.spinner {
  @apply rounded-full border-4 border-primary-300 border-t-primary-600 animate-spin;
}
</style> 