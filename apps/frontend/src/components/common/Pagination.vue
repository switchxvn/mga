<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /**
   * Tổng số items
   */
  total: number;
  /**
   * Số items trên mỗi trang
   */
  itemsPerPage: number;
  /**
   * Trang hiện tại (1-based)
   */
  modelValue: number;
  /**
   * Số nút phân trang tối đa hiển thị
   * @default 5
   */
  maxVisibleButtons?: number;
  /**
   * Hiển thị thông tin về tổng số items
   * @default true
   */
  showTotal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleButtons: 5,
  showTotal: true
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

// Tính toán tổng số trang
const totalPages = computed(() => Math.ceil(props.total / props.itemsPerPage));

// Tính toán vị trí bắt đầu và kết thúc của items hiện tại
const currentRange = computed(() => {
  const start = (props.modelValue - 1) * props.itemsPerPage + 1;
  const end = Math.min(start + props.itemsPerPage - 1, props.total);
  return `${start}-${end}`;
});

// Tính toán danh sách các trang cần hiển thị
const pages = computed(() => {
  const total = totalPages.value;
  const current = props.modelValue;
  const maxButtons = props.maxVisibleButtons;

  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => ({
      type: 'number' as const,
      value: i + 1
    }));
  }

  const items: Array<{ type: 'number' | 'dots'; value: number }> = [];

  // Luôn hiển thị trang đầu
  items.push({ type: 'number', value: 1 });

  // Thêm dấu ... nếu không ở gần trang đầu
  if (current > 3) {
    items.push({ type: 'dots', value: -1 });
  }

  // Tính toán range của các trang ở giữa
  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);

  // Điều chỉnh range nếu ở gần đầu hoặc cuối
  if (current <= 3) {
    end = Math.min(4, total - 1);
  } else if (current >= total - 2) {
    start = Math.max(total - 3, 2);
  }

  // Thêm các trang ở giữa
  for (let i = start; i <= end; i++) {
    items.push({ type: 'number', value: i });
  }

  // Thêm dấu ... nếu không ở gần trang cuối
  if (current < total - 2) {
    items.push({ type: 'dots', value: -2 });
  }

  // Luôn hiển thị trang cuối
  if (total > 1) {
    items.push({ type: 'number', value: total });
  }

  return items;
});

// Xử lý khi click vào nút phân trang
const handlePageClick = (page: number) => {
  if (page === props.modelValue) return;
  emit('update:modelValue', page);
};

// Xử lý khi click vào nút Previous
const handlePrevClick = () => {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1);
  }
};

// Xử lý khi click vào nút Next
const handleNextClick = () => {
  if (props.modelValue < totalPages.value) {
    emit('update:modelValue', props.modelValue + 1);
  }
};
</script>

<template>
  <div v-if="totalPages > 1" class="flex flex-col items-center gap-4">
    <!-- Pagination info -->
    <div v-if="showTotal" class="text-sm text-gray-600 dark:text-gray-400">
      Hiển thị {{ currentRange }} trên tổng số {{ total }} kết quả
    </div>

    <!-- Pagination navigation -->
    <nav
      class="flex items-center justify-center gap-1"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      <!-- Previous button -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-md text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{
          'opacity-50 cursor-not-allowed': modelValue === 1,
          'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': modelValue !== 1
        }"
        :disabled="modelValue === 1"
        @click="handlePrevClick"
        aria-label="Previous Page"
      >
        <i class="i-heroicons-chevron-left-20-solid h-5 w-5" />
      </button>

      <!-- Page buttons -->
      <template v-for="(item, index) in pages" :key="index">
        <!-- Dots -->
        <span
          v-if="item.type === 'dots'"
          class="flex h-10 w-10 items-center justify-center text-gray-400"
          aria-hidden="true"
        >
          ...
        </span>

        <!-- Number -->
        <button
          v-else
          type="button"
          class="flex h-10 min-w-[2.5rem] items-center justify-center rounded-md px-3 text-sm transition-colors"
          :class="{
            'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-400 dark:hover:bg-primary-500': item.value === modelValue,
            'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800': item.value !== modelValue
          }"
          @click="handlePageClick(item.value)"
          :aria-label="'Go to page ' + item.value"
          :aria-current="item.value === modelValue ? 'page' : undefined"
        >
          {{ item.value }}
        </button>
      </template>

      <!-- Next button -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-md text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{
          'opacity-50 cursor-not-allowed': modelValue === totalPages,
          'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': modelValue !== totalPages
        }"
        :disabled="modelValue === totalPages"
        @click="handleNextClick"
        aria-label="Next Page"
      >
        <i class="i-heroicons-chevron-right-20-solid h-5 w-5" />
      </button>
    </nav>
  </div>
</template> 