import { defineNuxtPlugin } from 'nuxt/app';
import { useLanguageInitializer } from '../composables/useLanguageInitializer';

export default defineNuxtPlugin(async () => {
  const { initializeOnce } = useLanguageInitializer();

  await initializeOnce();
});
