<script setup lang="ts">
import { ref } from 'vue';
import { useDarkMode } from '~/composables/useDarkMode';
import Icon from '~/components/ui/Icon.vue';
import { onClickOutside } from '@vueuse/core';

const { isDark, currentMode, setMode } = useDarkMode();
const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

onClickOutside(menuRef, () => {
  isOpen.value = false;
});

const modes = [
  { value: 'light', label: 'Sáng', icon: 'Sun' },
  { value: 'dark', label: 'Tối', icon: 'Moon' },
  { value: 'auto', label: 'Hệ thống', icon: 'Monitor' }
] as const;

const getCurrentIcon = () => {
  if (currentMode.value === 'auto') return 'Monitor';
  return isDark.value ? 'Moon' : 'Sun';
};
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      class="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      @click="isOpen = !isOpen"
      aria-label="Chuyển đổi chế độ màu"
    >
      <Icon
        :name="getCurrentIcon()"
        class="h-5 w-5"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1" role="menu" aria-orientation="vertical">
        <button
          v-for="mode in modes"
          :key="mode.value"
          class="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          :class="{ 'bg-neutral-100 dark:bg-neutral-700': currentMode === mode.value }"
          @click="() => { setMode(mode.value); isOpen = false; }"
          role="menuitem"
        >
          <Icon :name="mode.icon" class="h-4 w-4 mr-2" />
          <span>{{ mode.label }}</span>
          <Icon
            v-if="currentMode === mode.value"
            name="Check"
            class="h-4 w-4 ml-auto"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-toggle {
  @apply p-2 rounded-full transition-colors;
  
  /* Light mode */
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  
  /* Dark mode */
  .dark & {
    @apply bg-gray-700 text-gray-200 hover:bg-gray-600;
  }
}
</style> 