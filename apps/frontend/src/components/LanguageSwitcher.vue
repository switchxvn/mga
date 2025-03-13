<script setup lang="ts">
import { useLocalization } from '../composables/useLocalization';
import { computed, onMounted, ref, watch } from 'vue';

const { t, locale, locales, switchLanguage } = useLocalization();
const isOpen = ref(false);
const flagLoaded = ref(false); // Bắt đầu với trạng thái chưa tải
const flagLoadError = ref(false); // Theo dõi lỗi tải hình ảnh

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
  availableLocales.value.forEach(loc => {
    const img = new Image();
    img.onload = () => {
      if (loc.code === locale.value) {
        flagLoaded.value = true;
        flagLoadError.value = false;
      }
    };
    img.onerror = () => {
      if (loc.code === locale.value) {
        flagLoadError.value = true;
      }
    };
    img.src = getFlagPath(loc.code);
  });
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
const handleSelectLanguage = (code: string) => {
  // Reset flag states before changing language
  flagLoaded.value = false;
  flagLoadError.value = false;
  
  switchLanguage(code);
  closeDropdown();
  
  // Preload the new flag
  const img = new Image();
  img.onload = () => {
    flagLoaded.value = true;
    flagLoadError.value = false;
  };
  img.onerror = () => {
    flagLoadError.value = true;
  };
  img.src = getFlagPath(code);
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

// Watch for locale changes to update flag
watch(locale, () => {
  preloadFlags();
});

// Initialize
onMounted(() => {
  // Add event listener for click outside
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
  }
  
  // Preload flag images
  preloadFlags();
});
</script>

<template>
  <div class="language-switcher relative">
    <button 
      @click.stop="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 transition-colors"
      type="button"
      :title="t('language')"
    >
      <div class="w-4 h-4 flex items-center justify-center">
        <!-- Hiển thị flag khi đã tải xong -->
        <img 
          v-if="locale && flagLoaded && !flagLoadError"
          :src="getFlagPath(locale)" 
          :alt="`${currentLocaleDisplay} flag`" 
          class="w-4 h-4 rounded-sm object-cover"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        <!-- Hiển thị mã ngôn ngữ khi chưa tải được flag -->
        <span v-else class="text-xs font-bold">{{ locale?.toUpperCase().substring(0, 2) }}</span>
      </div>
      <span class="text-sm font-medium">{{ currentLocaleDisplay }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition-transform" :class="{ 'rotate-180': isOpen }">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div 
      v-if="isOpen" 
      class="absolute z-50 mt-1 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div class="py-1">
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          @click="handleSelectLanguage(loc.code)"
          class="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :class="{ 'bg-gray-100 dark:bg-gray-700': locale === loc.code }"
        >
          <div class="w-4 h-4 flex items-center justify-center mr-2">
            <!-- Hiển thị flag trong dropdown -->
            <img 
              v-if="loc.code === locale ? (flagLoaded && !flagLoadError) : true"
              :src="getFlagPath(loc.code)" 
              :alt="`${loc.name} flag`" 
              class="w-4 h-4 rounded-sm object-cover"
              @error="handleDropdownImageError"
            />
            <!-- Hiển thị mã ngôn ngữ khi không có flag -->
            <span v-else class="text-xs font-bold">{{ loc.code.toUpperCase().substring(0, 2) }}</span>
          </div>
          <span>{{ loc.nativeName }}</span>
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
</style> 