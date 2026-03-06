<template>
  <div class="language-switcher inline-block">
    <button 
      @click.stop="toggleDropdown"
      class="inline-flex items-center justify-between space-x-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-white/20 dark:hover:bg-white/30 transition-[background] duration-150 text-gray-800 dark:text-white"
      type="button"
      :title="t('common.language')"
    >
      <div class="w-5 h-5 flex items-center justify-center">
        <ClientOnly>
          <template #default>
            <img
              v-if="currentLocaleOption?.flag && !showFallback"
              :src="currentLocaleOption.flag"
              :alt="currentLocaleOption.name"
              class="w-5 h-5 rounded-sm object-cover"
              @error="handleImageError"
            />
            <span v-else class="text-xs font-bold">{{ locale?.toUpperCase().substring(0, 2) }}</span>
          </template>
          <template #fallback>
            <span class="text-xs font-bold">{{ locale?.toUpperCase().substring(0, 2) }}</span>
          </template>
        </ClientOnly>
      </div>
      <span class="text-sm font-medium">{{ currentLocaleDisplay }}</span>
      <ChevronDown 
        class="h-4 w-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown menu -->
    <div 
      v-if="isOpen" 
      class="absolute z-[120] mt-1 min-w-[160px] rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none"
    >
      <div class="py-1">
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          @click="handleSelectLanguage(loc.code)"
          class="flex items-center w-full px-4 py-2 text-sm text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-[background] duration-150"
          :class="{ 'bg-gray-100 dark:bg-gray-700': locale === loc.code }"
        >
          <div class="w-5 h-5 flex items-center justify-center mr-2">
            <ClientOnly>
              <img
                v-if="loc.flag"
                :src="loc.flag"
                :alt="loc.name"
                class="w-5 h-5 rounded-sm object-cover"
                @error="handleDropdownImageError"
              />
              <span v-else class="text-xs font-bold">{{ loc.code.toUpperCase().substring(0, 2) }}</span>
            </ClientOnly>
          </div>
          <span>{{ loc.nativeName }}</span>
          <Check
            v-if="locale === loc.code"
            class="h-4 w-4 ml-auto"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocalization } from '@/composables/useLocalization';
import { computed, onMounted, ref, onBeforeUnmount, watch, nextTick } from 'vue';
import { Globe, Check, ChevronDown } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
// @ts-ignore
import { ClientOnly } from '#components';

const { t } = useI18n();
const { locale, availableLocales, switchLanguage, initLocale } = useLocalization();

const isOpen = ref(false);
const showFallback = ref(false);

// Computed
const currentLocaleOption = computed(() => availableLocales.value.find(loc => loc.code === locale.value));

// Get current locale display
const currentLocaleDisplay = computed(() => {
  if (!availableLocales.value?.length || !locale.value) {
    return t('common.language');
  }
  const current = availableLocales.value.find(loc => loc.code === locale.value);
  return current ? current.nativeName : t('common.language');
});

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Close dropdown when clicking outside
const closeDropdown = () => {
  isOpen.value = false;
};

// Handle language selection and save to localStorage
const handleSelectLanguage = async (code: string) => {
  if (!code || code === locale.value) {
    closeDropdown();
    return;
  }
  
  try {
    await switchLanguage(code);
    showFallback.value = false;
    closeDropdown();
    
    // Đảm bảo DOM đã cập nhật trước khi tiếp tục
    await nextTick();
  } catch (error) {
    console.error('Error switching language:', error);
    closeDropdown();
  }
};

// Handle click outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    closeDropdown();
  }
};

// Handle image error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
    showFallback.value = true;
  }
};

// Handle flag image error in dropdown
const handleDropdownImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};

// Preload images to ensure they're in cache
const preloadImages = () => {
  if (!process.client) return;

  availableLocales.value.forEach((localeOption) => {
    if (!localeOption.flag) return;
    const img = new Image();
    img.src = localeOption.flag;
  });
};

// Initialize
onMounted(async () => {
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
    await initLocale();
    preloadImages();
  }
});

// Cleanup
onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
  width: auto;
}

/* Dropdown menu */
.absolute {
  z-index: 1200 !important;
}

/* Only enable transitions for specific properties we want to animate */
.transition-transform {
  transition-property: transform !important;
}

.transition-\[background\] {
  transition-property: background-color !important;
}
</style> 
