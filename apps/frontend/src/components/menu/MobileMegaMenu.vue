<!-- MobileMegaMenu component -->
<script setup lang="ts">
import { computed } from 'vue';
import type { MenuItem } from '@ew/shared';

interface Props {
  item: MenuItem;
  isActive: boolean;
  onClose?: () => void;
}

const props = defineProps<Props>();

// Computed property for mega menu columns
const megaMenuColumns = computed(() => {
  if (!props.item.megaMenuColumns) return [];
  return props.item.megaMenuColumns;
});
</script>

<template>
  <div class="mobile-mega-menu pl-6 pr-3 py-2 space-y-2">
    <div
      v-for="(column, columnIndex) in megaMenuColumns"
      :key="columnIndex"
      class="space-y-2"
    >
      <div
        v-for="(subItem, subItemIndex) in column.items"
        :key="`${columnIndex}-${subItemIndex}`"
        class="mobile-submenu-item"
      >
        <NuxtLink
          :to="subItem.href"
          class="block py-2 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
          @click="onClose?.()">
          {{ subItem.label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-mega-menu {
  background-color: var(--navbar-menu-bg);
  border-left: 2px solid var(--navbar-border);
  margin-left: 1rem;
}

.mobile-submenu-item {
  @apply border-b border-neutral-200 dark:border-neutral-700;
  transition: all 0.3s ease;
}

.mobile-submenu-item:last-child {
  border-bottom: none;
}

.mobile-submenu-item:hover {
  transform: translateX(4px);
}

.mobile-submenu-item a {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
}
</style> 