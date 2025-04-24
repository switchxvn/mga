import { useTheme } from '../composables/useTheme';

export default defineNuxtPlugin(async () => {
  const { initializeTheme } = useTheme();
  
  // Initialize theme when app starts
  await initializeTheme();
}); 