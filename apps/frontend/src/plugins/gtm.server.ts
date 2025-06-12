export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on server side for SEO and initial load
  if (process.client) return

  try {
    // Check if we have a valid Nuxt context
    if (!nuxtApp || !nuxtApp.ssrContext) {
      console.warn('GTM Server Plugin: Invalid Nuxt context');
      return;
    }

    // Check if fetch is available
    if (typeof globalThis.fetch === 'undefined') {
      console.warn('GTM Server Plugin: Fetch not available, skipping GTM settings fetch');
      return;
    }

    // Get tRPC instance to fetch settings
    const { $trpc } = nuxtApp;
    if (!$trpc) {
      console.warn('GTM Server Plugin: tRPC not available');
      return;
    }

    // Fetch GTM ID from database with timeout
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('GTM settings fetch timeout')), 5000)
      );

      const settingsPromise = ($trpc as any).settings.getPublicSettings.query();
      
      const settings = await Promise.race([settingsPromise, timeoutPromise]);
      const gtmId = settings.find((s: any) => s.key === 'google_tag_manager_id')?.value;

      if (gtmId && gtmId.trim()) {
        // Store GTM ID in global state for use across the app
        const gtmState = useState('gtm-id', () => gtmId);
        
        // Also provide it via nuxtApp for immediate access
        nuxtApp.provide('gtmId', gtmId);

        console.log('GTM Server Plugin: Successfully loaded GTM ID');
      } else {
        console.warn('GTM Server Plugin: No GTM ID found in settings');
      }
    } catch (apiError) {
      console.warn('GTM Server Plugin: Failed to fetch GTM settings:', apiError);
    }

  } catch (error) {
    console.error('GTM Server Plugin: Error:', error);
  }
}); 