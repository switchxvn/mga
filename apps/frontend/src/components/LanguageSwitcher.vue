<script setup lang="ts">
import { useLocalization } from '../composables/useLocalization';
import { computed, onMounted, ref } from 'vue';

const { t, locale, locales, switchLanguage } = useLocalization();
const isOpen = ref(false);

// Debug: Log locales to console
onMounted(() => {
  console.log('Locales:', locales.value);
  console.log('Current locale:', locale.value);
});

// Define locale interface
interface Locale {
  code: string;
  name: string;
}

// Fallback locales if none are provided
const availableLocales = computed<Locale[]>(() => {
  if (locales.value && locales.value.length > 0) {
    return locales.value;
  }
  // Fallback locales
  return [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Tiếng Việt' }
  ];
});

// Map language codes to country flag codes
const languageToFlagMap: Record<string, string> = {
  en: 'us', // English -> USA flag
  vi: 'vn', // Vietnamese -> Vietnam flag
  // Add more mappings as needed
};

// Get current locale display
const currentLocaleDisplay = computed(() => {
  const current = availableLocales.value.find((loc: Locale) => loc.code === locale.value);
  return current ? current.name : 'Language';
});

// Function to get flag image path
const getFlagPath = (langCode: string) => {
  const flagCode = languageToFlagMap[langCode] || langCode;
  // Use relative path from public directory
  return `/images/flag/${flagCode}.svg`;
};

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Close dropdown when clicking outside
const closeDropdown = () => {
  isOpen.value = false;
};

// Handle language selection
const handleSelectLanguage = (code: string) => {
  switchLanguage(code);
  closeDropdown();
};

// Handle click outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    closeDropdown();
  }
};

// Add event listener for click outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="language-switcher relative">
    <button 
      @click.stop="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 transition-colors"
      type="button"
    >
      <img 
        v-if="locale" 
        :src="getFlagPath(locale)" 
        :alt="`${currentLocaleDisplay} flag`" 
        class="w-4 h-4 rounded-sm object-cover"
        onerror="this.style.display='none'"
      />
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
          <img 
            :src="getFlagPath(loc.code)" 
            :alt="`${loc.name} flag`" 
            class="w-4 h-4 rounded-sm object-cover mr-2"
            onerror="this.style.display='none'"
          />
          <span>{{ loc.name }}</span>
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