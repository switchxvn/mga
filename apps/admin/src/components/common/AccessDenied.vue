<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps({
  requiredPermissions: {
    type: Array as () => string[],
    default: () => []
  },
  title: {
    type: String,
    default: 'Quyền truy cập bị từ chối'
  },
  description: {
    type: String,
    default: ''
  }
});

// Tạo mô tả mặc định nếu không được cung cấp
const defaultDescription = computed(() => {
  if (!props.requiredPermissions.length) {
    return 'Bạn không có quyền truy cập vào trang này';
  }

  if (props.requiredPermissions.length === 1) {
    return `Bạn không có quyền truy cập: ${props.requiredPermissions[0]}`;
  }

  return `Bạn cần có một trong các quyền sau: ${props.requiredPermissions.join(', ')}`;
});
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <ShieldAlert class="h-8 w-8 text-amber-500" />
      </div>
      <div class="ml-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ description || defaultDescription }}
        </p>
      </div>
    </div>
  </div>
</template> 