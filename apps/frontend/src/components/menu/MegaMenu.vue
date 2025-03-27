<!-- MegaMenu component -->
<script setup lang="ts">
import { computed } from 'vue';
import type { MenuItem } from '@ew/shared';

interface Props {
  item: MenuItem;
  isActive: boolean;
  onClose?: () => void;
}

const props = defineProps<Props>();

// Computed property for flattened menu items
const flattenedItems = computed(() => {
  if (!props.item.megaMenuColumns) return [];
  return props.item.megaMenuColumns.flatMap(column => column.items);
});
</script>

<template>
  <div
    class="absolute left-1/2 z-50 mt-4 w-screen max-w-max -translate-x-1/2"
  >
    <!-- Arrow -->
    <div class="absolute -top-[10px] left-1/2 h-[20px] w-[28px] -translate-x-1/2">
      <div 
        class="absolute h-full w-full bg-white dark:bg-neutral-900"
        style="clip-path: polygon(50% 20%, 0 100%, 100% 100%); border-left: 1px solid var(--navbar-border); border-right: 1px solid var(--navbar-border); border-bottom: 1px solid var(--navbar-border);"
      ></div>
    </div>
    
    <!-- Content -->
    <div class="relative mt-2 rounded-lg bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5">
      <div class="relative p-2 min-w-[200px]">
        <ul class="divide-y divide-neutral-200 dark:divide-neutral-700">
          <li
            v-for="(item, index) in flattenedItems"
            :key="item.href"
            class="[&:last-child]:border-none"
          >
            <NuxtLink
              :to="item.href"
              class="group flex items-center justify-between px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800 transition duration-150 ease-in-out"
              @click="onClose?.()">
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(-50%);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0) translateX(-50%);
}
</style> 