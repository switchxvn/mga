import { ref, computed, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useTrpc } from './useTrpc';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';

// Define types for tRPC outputs
type RouterOutput = inferRouterOutputs<AppRouter>;
type LanguageOutput = RouterOutput['language']['getLanguages'][0];
type TranslationsOutput = RouterOutput['language']['getAllTranslations'];

// Define locale interface
export interface Locale {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flagCode: string;
  isActive: boolean;
  isDefault: boolean;
}

// Define translations interface
export interface Translations {
  [languageCode: string]: {
    [namespace: string]: {
      [key: string]: string;
    };
  };
}

// Create singleton state
const state = {
  locale: useLocalStorage('locale', ''),
  locales: ref<Locale[]>([]),
  translations: ref<Translations>({}),
  isLoading: ref(false),
  error: ref<string | null>(null),
  isInitialized: ref(false)
};

export function useLocalization() {
  const trpc = useTrpc();

  // Computed
  const currentTranslations = computed(() => {
    if (!state.locale.value || !state.translations.value[state.locale.value]) {
      return {};
    }
    return state.translations.value[state.locale.value];
  });

  // Methods
  const initializeLocalization = async () => {
    // Skip if already initialized
    if (state.isInitialized.value) return;

    state.isLoading.value = true;
    state.error.value = null;

    try {
      // Get all languages first
      const languages = await trpc.language.getLanguages.query();
      state.locales.value = languages;

      // Find default language
      const defaultLang = languages.find(lang => lang.isDefault);
      if (defaultLang && !state.locale.value) {
        state.locale.value = defaultLang.code;
      }

      // Get translations for default or current language
      const langCode = state.locale.value || defaultLang?.code || 'en';
      const translations = await trpc.language.getAllTranslations.query({ languageCode: langCode });
      
      state.translations.value = {
        [langCode]: translations
      };

      state.isInitialized.value = true;
    } catch (err) {
      console.error('Failed to initialize localization:', err);
      state.error.value = 'Failed to initialize localization';
    } finally {
      state.isLoading.value = false;
    }
  };

  const fetchTranslations = async (languageCode: string) => {
    if (state.translations.value[languageCode]) return; // Skip if already loaded
    
    state.isLoading.value = true;
    state.error.value = null;
    
    try {
      const result = await trpc.language.getAllTranslations.query({ languageCode });
      state.translations.value = {
        ...state.translations.value,
        [languageCode]: result,
      };
    } catch (err) {
      console.error(`Failed to fetch translations for ${languageCode}:`, err);
      state.error.value = `Failed to fetch translations for ${languageCode}`;
    } finally {
      state.isLoading.value = false;
    }
  };

  const switchLanguage = async (code: string) => {
    if (code === state.locale.value) return;
    
    // If we don't have translations for this language yet, fetch them
    if (!state.translations.value[code]) {
      await fetchTranslations(code);
    }
    
    state.locale.value = code;
    
    // Update HTML lang attribute
    if (process.client) {
      document.documentElement.setAttribute('lang', code);
    }
  };

  // Translation function
  const t = (key: string, namespace = 'common') => {
    if (!state.locale.value || !state.translations.value[state.locale.value]) {
      return key;
    }
    
    const ns = state.translations.value[state.locale.value][namespace] || {};
    return ns[key] || key;
  };

  // Watch for language changes to update HTML lang attribute
  watch(state.locale, (newLocale) => {
    if (process.client && newLocale) {
      document.documentElement.setAttribute('lang', newLocale);
    }
  });

  return {
    locale: state.locale,
    locales: state.locales,
    translations: state.translations,
    currentTranslations,
    isLoading: state.isLoading,
    error: state.error,
    t,
    switchLanguage,
    initializeLocalization,
  };
} 