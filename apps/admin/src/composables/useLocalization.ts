import { ref, computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

// Define locale interface
export interface Locale {
  code: string;
  name: string;
  nativeName: string;
}

// Available locales
const availableLocales: Locale[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt'
  }
];

// Create singleton state
const state = {
  locale: useLocalStorage('admin-locale', 'en'),
  locales: ref<Locale[]>(availableLocales),
  isLoading: ref(false),
  error: ref<string | null>(null)
};

export function useLocalization() {
  const { locale: i18nLocale, t } = useI18n();
  
  // Sync i18n locale with our state
  if (i18nLocale.value !== state.locale.value) {
    i18nLocale.value = state.locale.value;
  }

  // Computed
  const currentLocale = computed(() => {
    return state.locales.value.find(l => l.code === state.locale.value) || state.locales.value[0];
  });

  // Methods
  const switchLanguage = async (code: string) => {
    if (code === state.locale.value) return;
    
    const isValidLocale = state.locales.value.some(locale => locale.code === code);
    if (!isValidLocale) {
      console.warn(`Locale ${code} is not available`);
      return;
    }
    
    // Update our state
    state.locale.value = code;
    
    // Update i18n locale
    i18nLocale.value = code;
    
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', code);
    }
  };

  return {
    // State
    locale: state.locale,
    locales: state.locales,
    isLoading: state.isLoading,
    error: state.error,
    currentLocale,
    
    // Methods
    switchLanguage,
    t
  };
} 