<script setup lang="ts">
import { ref } from 'vue';

// Định nghĩa alias cho URL tiếng Việt
definePageMeta({
  alias: ['/san-pham']
});

const title = ref('Danh sách sản phẩm');
const products = ref([
  { id: 1, name: 'Sản phẩm 1', description: 'Mô tả ngắn về sản phẩm 1' },
  { id: 2, name: 'Sản phẩm 2', description: 'Mô tả ngắn về sản phẩm 2' },
  { id: 3, name: 'Sản phẩm 3', description: 'Mô tả ngắn về sản phẩm 3' },
  { id: 4, name: 'Sản phẩm 4', description: 'Mô tả ngắn về sản phẩm 4' },
  { id: 5, name: 'Sản phẩm 5', description: 'Mô tả ngắn về sản phẩm 5' },
  { id: 6, name: 'Sản phẩm 6', description: 'Mô tả ngắn về sản phẩm 6' },
]);
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">{{ title }}</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="h-48 bg-gray-200"></div>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2">{{ product.name }}</h2>
          <p class="text-gray-600 mb-4">{{ product.description }}</p>
          <NuxtLink :to="`/san-pham/san-pham-${product.id}`" class="text-blue-600 hover:underline">
            Xem chi tiết
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template> 