import { createI18n } from 'vue-i18n';
import { defineNuxtPlugin } from 'nuxt/app';
import en from '../i18n/locales/en.json';
import vi from '../i18n/locales/vi.json';

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'vi', // Mặc định là tiếng Việt
    fallbackLocale: 'vi',
    messages: {
      en,
      vi
    }
  });

  // Khôi phục ngôn ngữ từ localStorage (chỉ ở phía client)
  if (process.client) {
    const savedLocale = localStorage.getItem('user-language');
    if (savedLocale) {
      i18n.global.locale.value = savedLocale;
    }
  }

  vueApp.use(i18n);
}); 