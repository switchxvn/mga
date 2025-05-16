import { defineNuxtPlugin } from '#imports';
import { createI18n } from 'vue-i18n';
import i18nConfig from '../i18n.config';

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n(i18nConfig);
  vueApp.use(i18n);
}); 