<script setup lang="ts">
import { ref } from 'vue';

// Định nghĩa alias cho URL tiếng Việt
definePageMeta({
  alias: ['/san-pham/:slug']
});

const route = useRoute();
const slug = route.params.slug as string;
const title = ref(`Chi tiết sản phẩm: ${slug}`);
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="mb-4">
      <NuxtLink to="/san-pham" class="text-blue-600 hover:underline">
        &larr; Quay lại danh sách sản phẩm
      </NuxtLink>
    </div>
    
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="md:flex">
        <div class="md:w-1/2">
          <div class="h-64 md:h-full bg-gray-200"></div>
        </div>
        <div class="p-6 md:w-1/2">
          <h1 class="text-3xl font-bold mb-4">{{ title }}</h1>
          <div class="text-xl font-semibold text-red-600 mb-4">2.500.000 ₫</div>
          <p class="text-gray-600 mb-6">
            Đây là mô tả chi tiết về sản phẩm. Thông tin này sẽ giúp khách hàng hiểu rõ hơn về sản phẩm trước khi quyết định mua hàng.
          </p>
          <button class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 