import { createI18n } from 'vue-i18n';
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import en from '../i18n/locales/en.json';
import vi from '../i18n/locales/vi.json';

interface LanguageResponse {
  code: string;
}

export default defineNuxtPlugin(async ({ vueApp }) => {
  const config = useRuntimeConfig();
  const baseUrl = process.server ? config.public.apiBase : '';
  const savedLocale = process.client ? localStorage.getItem('locale') : null;

  let defaultLocale = savedLocale || 'vi';

  if (!savedLocale) {
    try {
      const language = await $fetch<LanguageResponse>('/languages/default', {
        baseURL: baseUrl,
      });

      if (language?.code) {
        defaultLocale = language.code;
      }
    } catch (error) {
      console.warn('Failed to load default language from database, using fallback locale:', error);
    }
  }

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
    messages: {
      en,
      vi
    }
  });

  if (process.client) {
    localStorage.setItem('locale', i18n.global.locale.value);
    document.documentElement.setAttribute('lang', i18n.global.locale.value);
  }

  vueApp.use(i18n);
});
