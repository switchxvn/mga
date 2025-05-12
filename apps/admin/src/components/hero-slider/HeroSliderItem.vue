<template>
  <div class="flex items-center gap-4 p-2 border rounded mb-2">
    <img :src="slider.imageUrl" alt="" class="w-24 h-16 object-cover rounded" />
    <div class="flex-1">
      <div class="font-bold">{{ slider.title }}</div>
      <div class="text-xs text-gray-500">Order: {{ slider.order }}</div>
    </div>
    <button @click="$emit('edit', slider)" class="btn btn-sm btn-primary">Edit</button>
    <button @click="$emit('delete', slider)" class="btn btn-sm btn-danger">Delete</button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ slider: any }>()
</script> 