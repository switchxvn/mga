import { ref, computed, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useTrpc } from './useTrpc';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';

// Import local translations
import viLocalTranslations from '../i18n/locales/vi.json';
import enLocalTranslations from '../i18n/locales/en.json';

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

// Local translations mapping
const localTranslations: { [key: string]: any } = {
  vi: viLocalTranslations,
  en: enLocalTranslations
};

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

  // Merge translations from database and local files
  const mergeTranslations = (dbTranslations: Record<string, Record<string, string>>, langCode: string) => {
    const result: { [namespace: string]: { [key: string]: string } } = {};
    
    // First, load all translations from local JSON file
    const localTranslationData = localTranslations[langCode] || {};
    console.log('Raw local translations:', localTranslationData);
    
    // Deep merge function for nested objects
    const deepMerge = (target: any, source: any, namespace = '') => {
      Object.entries(source).forEach(([key, value]) => {
        const currentPath = namespace ? `${namespace}.${key}` : key;
        
        if (value && typeof value === 'object') {
          // If it's an object, create namespace and recurse
          if (!target[key]) target[key] = {};
          deepMerge(target[key], value, currentPath);
        } else {
          // It's a value, assign it directly
          target[key] = value;
        }
      });
    };

    // Process local translations first
    Object.entries(localTranslationData).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        // Create namespace if it doesn't exist
        if (!result[key]) result[key] = {};
        deepMerge(result[key], value);
      } else {
        // Handle root level strings in common namespace
        if (!result['common']) result['common'] = {};
        result['common'][key] = value as string;
      }
    });

    console.log('After processing local translations:', JSON.stringify(result, null, 2));

    // Then merge database translations, overriding local ones if they exist
    Object.entries(dbTranslations).forEach(([namespace, translations]) => {
      if (!result[namespace]) {
        result[namespace] = {};
      }
      Object.assign(result[namespace], translations);
    });

    console.log('Final merged translations:', JSON.stringify(result, null, 2));
    return result;
  };

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
      
      // First set local translations
      state.translations.value = {
        [langCode]: mergeTranslations({}, langCode)
      };

      // Then try to get and merge database translations
      try {
        const translations = await trpc.language.getAllTranslations.query({ languageCode: langCode });
        state.translations.value = {
          [langCode]: mergeTranslations(translations, langCode)
        };
      } catch (dbErr) {
        console.warn('Failed to fetch database translations, using local translations only:', dbErr);
      }

      state.isInitialized.value = true;
    } catch (err) {
      console.error('Failed to initialize localization:', err);
      // Fallback to local translations if everything fails
      const langCode = state.locale.value || 'en';
      state.translations.value = {
        [langCode]: mergeTranslations({}, langCode)
      };
      state.error.value = 'Failed to initialize localization';
    } finally {
      state.isLoading.value = false;
    }
  };

  const fetchTranslations = async (languageCode: string) => {
    if (state.translations.value[languageCode]) return; // Skip if already loaded
    
    state.isLoading.value = true;
    state.error.value = null;
    
    // First set local translations
    state.translations.value = {
      ...state.translations.value,
      [languageCode]: mergeTranslations({}, languageCode)
    };

    try {
      const dbTranslations = await trpc.language.getAllTranslations.query({ languageCode });
      state.translations.value = {
        ...state.translations.value,
        [languageCode]: mergeTranslations(dbTranslations, languageCode)
      };
    } catch (err) {
      console.warn(`Failed to fetch database translations for ${languageCode}, using local translations only:`, err);
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
  const t = (key: string, params?: Record<string, any>, namespace = 'common') => {
    if (!state.locale.value || !state.translations.value[state.locale.value]) {
      return key;
    }
    
    // Split key by dots to handle nested translations
    const parts = key.split('.');
    if (parts.length > 1) {
      // If key contains dots, first part is namespace
      namespace = parts[0];
      key = parts.slice(1).join('.');
    }
    
    const translations = state.translations.value[state.locale.value];
    const ns = translations[namespace];
    
    if (!ns) {
      console.warn(`Namespace "${namespace}" not found for key "${key}"`);
      return key;
    }
    
    let value = ns[key];
    if (!value) {
      console.warn(`Translation not found for key "${key}" in namespace "${namespace}"`);
      return key;
    }

    // Replace parameters in the translation string
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
      });
    }
    
    return value;
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