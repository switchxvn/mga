import { defineNuxtPlugin, useRuntimeConfig } from '#imports';
import { createI18n } from 'vue-i18n';
import i18nConfig from '../i18n.config';

interface LanguageResponse {
  code: string;
}

export default defineNuxtPlugin(async ({ vueApp }) => {
  const config = useRuntimeConfig();
  const baseUrl = process.server ? config.public.apiBase : '';
  const savedLocale = process.client ? localStorage.getItem('locale') : null;

  let defaultLocale = savedLocale || i18nConfig.locale;

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
    ...i18nConfig,
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
  });

  if (process.client) {
    localStorage.setItem('locale', String(i18n.global.locale.value));
    document.documentElement.setAttribute('lang', String(i18n.global.locale.value));
  }

  vueApp.use(i18n);
});
