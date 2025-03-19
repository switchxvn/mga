<script setup lang="ts">
import { useLocalization } from '../composables/useLocalization';
import { computed, onMounted, ref, watch } from 'vue';
import { useAsyncData } from '#imports';
import { useLanguageInitializer } from '../composables/useLanguageInitializer';
import { useTransitionControl } from '../composables/useTransitionControl';

const { t, locale, locales, switchLanguage } = useLocalization();
const { initializeOnce, isInitializing, hasInitialized } = useLanguageInitializer();
const { disableTransitions } = useTransitionControl();

const isOpen = ref(false);
const flagLoaded = ref(false);
const flagLoadError = ref(false);

// Sử dụng useAsyncData để load danh sách ngôn ngữ trong quá trình SSR
const { pending: isLoadingLanguages } = useAsyncData(
  'languages-list',
  async () => {
    await initializeOnce();
  },
  {
    server: true,
    lazy: false,
    // Cache kết quả trong 5 phút
    watch: false,
    maxAge: 300
  }
);

// Computed
const availableLocales = computed(() => locales.value);

// Get current locale display
const currentLocaleDisplay = computed(() => {
  const current = availableLocales.value.find(loc => loc.code === locale.value);
  return current ? current.nativeName : 'Language';
});

// Function to get flag image path
const getFlagPath = (langCode: string) => {
  const lang = availableLocales.value.find(loc => loc.code === langCode);
  const flagCode = lang ? lang.flagCode : langCode;
  return `/images/flag/${flagCode}.svg`;
};

// Preload flag images
const preloadFlags = () => {
  if (!process.client || !locale.value) return;
  
  const currentLang = availableLocales.value.find(loc => loc.code === locale.value);
  if (!currentLang) return;

  const img = new Image();
  img.onload = () => {
    flagLoaded.value = true;
    flagLoadError.value = false;
  };
  img.onerror = () => {
    flagLoadError.value = true;
  };
  img.src = getFlagPath(locale.value);
};

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
  if (code === locale.value) {
    closeDropdown();
    return;
  }

  // Reset flag states before changing language
  flagLoaded.value = false;
  flagLoadError.value = false;
  
  await switchLanguage(code);
  closeDropdown();
  
  // Preload the new flag
  if (process.client) {
    const img = new Image();
    img.onload = () => {
      flagLoaded.value = true;
      flagLoadError.value = false;
    };
    img.onerror = () => {
      flagLoadError.value = true;
    };
    img.src = getFlagPath(code);
  }
};

// Handle click outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    closeDropdown();
  }
};

// Handle image load success
const handleImageLoad = () => {
  flagLoaded.value = true;
  flagLoadError.value = false;
};

// Handle image error
const handleImageError = () => {
  flagLoadError.value = true;
};

// Handle flag image error in dropdown
const handleDropdownImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};

// Watch for locale and locales changes to update flag
watch([locale, locales], () => {
  if (process.client && locale.value && locales.value.length > 0) {
    preloadFlags();
  }
}, { immediate: true });

// Initialize
onMounted(() => {
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
    if (locale.value && locales.value.length > 0) {
      preloadFlags();
    }
  }
});

// Cleanup
onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<template>
  <div class="language-switcher relative">
    <button 
      @click.stop="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 transition-[background] duration-150"
      type="button"
      :title="t('language')"
      :disabled="isLoadingLanguages"
    >
      <div v-if="isLoadingLanguages" class="w-4 h-4 flex items-center justify-center">
        <span class="animate-pulse !transition-none">...</span>
      </div>
      <div v-else class="w-4 h-4 flex items-center justify-center">
        <!-- Hiển thị flag khi đã tải xong -->
        <img 
          v-if="locale && !isLoadingLanguages && flagLoaded && !flagLoadError"
          :src="getFlagPath(locale)" 
          :alt="`${currentLocaleDisplay} flag`" 
          class="w-4 h-4 rounded-sm object-cover !transition-none"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        <!-- Hiển thị mã ngôn ngữ khi chưa tải được flag -->
        <span v-else class="text-xs font-bold !transition-none">{{ locale?.toUpperCase().substring(0, 2) }}</span>
      </div>
      <span class="text-sm font-medium !transition-none">{{ currentLocaleDisplay }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition-transform !transition-none" :class="{ 'rotate-180': isOpen }">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div 
      v-if="isOpen" 
      class="absolute z-50 mt-1 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none !transition-none"
    >
      <div v-if="isLoadingLanguages" class="py-4 px-4 text-center text-sm text-gray-500 !transition-none">
        <span>Loading...</span>
      </div>
      <div v-else class="py-1">
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          @click="handleSelectLanguage(loc.code)"
          class="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-[background] duration-150"
          :class="{ 'bg-gray-100 dark:bg-gray-700': locale === loc.code }"
        >
          <div class="w-4 h-4 flex items-center justify-center mr-2">
            <!-- Hiển thị flag trong dropdown -->
            <img 
              :src="getFlagPath(loc.code)" 
              :alt="`${loc.name} flag`" 
              class="w-4 h-4 rounded-sm object-cover !transition-none"
              @error="handleDropdownImageError"
            />
          </div>
          <span class="!transition-none">{{ loc.nativeName }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
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