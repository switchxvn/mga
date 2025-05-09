<script setup lang="ts">
import { computed } from 'vue';
import { ShieldAlert } from 'lucide-vue-next';

const props = defineProps({
  /**
   * Danh sách các quyền cần thiết
   */
  requiredPermissions: {
    type: Array as () => string[],
    default: () => []
  },
  /**
   * Tiêu đề tùy chỉnh 
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * Mô tả tùy chỉnh
   */
  description: {
    type: String,
    default: ''
  },
  /**
   * Loại cảnh báo (error, warning, info)
   */
  type: {
    type: String,
    default: 'warning',
    validator: (value: string) => ['error', 'warning', 'info'].includes(value)
  }
});

// Xác định màu dựa trên loại
const alertColor = computed(() => {
  switch (props.type) {
    case 'error': return 'text-red-500';
    case 'info': return 'text-blue-500';
    default: return 'text-amber-500';
  }
});

// Tiêu đề mặc định
const defaultTitle = computed(() => {
  switch (props.type) {
    case 'error': return 'Quyền truy cập bị từ chối';
    case 'info': return 'Thông tin quyền truy cập';
    default: return 'Cần quyền truy cập';
  }
});

// Mô tả mặc định
const defaultDescription = computed(() => {
  if (!props.requiredPermissions.length) {
    return 'Bạn không có quyền truy cập vào nội dung này';
  }

  if (props.requiredPermissions.length === 1) {
    return `Bạn cần có quyền: ${props.requiredPermissions[0]}`;
  }

  return `Bạn cần có một trong các quyền sau: ${props.requiredPermissions.join(', ')}`;
});
</script>

<template>
  <div class="rounded-md border bg-opacity-20 p-4 mb-6"
       :class="{
         'bg-amber-50 border-amber-200 dark:bg-amber-900 dark:bg-opacity-10 dark:border-amber-800': type === 'warning',
         'bg-red-50 border-red-200 dark:bg-red-900 dark:bg-opacity-10 dark:border-red-800': type === 'error',
         'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:bg-opacity-10 dark:border-blue-800': type === 'info'
       }">
    <div class="flex">
      <div class="flex-shrink-0">
        <ShieldAlert class="h-5 w-5" :class="alertColor" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium"
            :class="{
              'text-amber-800 dark:text-amber-300': type === 'warning',
              'text-red-800 dark:text-red-300': type === 'error',
              'text-blue-800 dark:text-blue-300': type === 'info'
            }">
          {{ title || defaultTitle }}
        </h3>
        <div class="mt-2 text-sm"
             :class="{
              'text-amber-700 dark:text-amber-200': type === 'warning',
              'text-red-700 dark:text-red-200': type === 'error',
              'text-blue-700 dark:text-blue-200': type === 'info'
             }">
          <p>{{ description || defaultDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template> 