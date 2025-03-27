<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDarkMode } from '~/composables/useDarkMode';
import Icon from '~/components/ui/Icon.vue';
import { onClickOutside } from '@vueuse/core';
import { useLocalization } from '~/composables/useLocalization';

const { t } = useLocalization();
const { isDark, currentMode, setMode } = useDarkMode();
const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

onClickOutside(menuRef, () => {
  isOpen.value = false;
});

type ThemeMode = 'light' | 'dark' | 'auto';
type IconName = 'Sun' | 'Moon' | 'Monitor' | 'ChevronDown' | 'Check';

interface ThemeModeOption {
  value: ThemeMode;
  label: string;
  icon: IconName;
}

// Define mode configurations
const modeConfigs: { [key in ThemeMode]: { icon: IconName, labelKey: string } } = {
  light: { icon: 'Sun', labelKey: 'theme.light' },
  dark: { icon: 'Moon', labelKey: 'theme.dark' },
  auto: { icon: 'Monitor', labelKey: 'theme.system' }
};

// Make modes reactive using computed
const modes = computed<ThemeModeOption[]>(() => 
  Object.entries(modeConfigs).map(([value, config]) => ({
    value: value as ThemeMode,
    label: t(config.labelKey),
    icon: config.icon
  }))
);

const getCurrentIcon = computed(() => {
  if (currentMode.value === 'auto') return modeConfigs.auto.icon;
  return isDark.value ? modeConfigs.dark.icon : modeConfigs.light.icon;
});

const getCurrentLabel = computed(() => {
  const mode = modes.value.find(m => m.value === currentMode.value);
  return mode ? mode.label : t('theme.title');
});
</script>

<template>
  <div ref="menuRef" class="relative">
    <button 
      class="w-full md:w-auto flex items-center justify-between space-x-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-[background] duration-150 text-gray-900 dark:text-gray-100"
      @click="isOpen = !isOpen"
      :title="t('theme.title')"
    >
      <div class="w-4 h-4 flex items-center justify-center">
        <Icon
          :name="getCurrentIcon"
          class="h-4 w-4"
        />
      </div>
      <span class="text-sm font-medium">{{ getCurrentLabel }}</span>
      <Icon 
        name="ChevronDown"
        class="h-4 w-4 transition-transform !transition-none"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 z-[120]"
    >
      <div class="py-1">
        <button
          v-for="mode in modes"
          :key="mode.value"
          class="flex items-center w-full px-4 py-2 text-sm text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-[background] duration-150"
          :class="{ 'bg-gray-100 dark:bg-gray-700': currentMode === mode.value }"
          @click="() => { setMode(mode.value); isOpen = false; }"
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
/* Dropdown menu */
.absolute {
  z-index: 1200 !important;
}

/* Disable all transitions when switching between light/dark modes */
:root[class*='dark'] * {
  transition: none !important;
}

/* Only enable transitions for specific properties we want to animate */
.transition-transform {
  transition-property: transform !important;
}

.transition-\[background\] {
  transition-property: background-color !important;
}
</style> 