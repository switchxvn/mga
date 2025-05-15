import { defineNuxtPlugin } from '#app';
import { createI18n } from 'vue-i18n';
import en from '../../public/locales/en.json';
import vi from '../../public/locales/vi.json';

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en,
      vi
    }
  });

  vueApp.use(i18n);
}); 