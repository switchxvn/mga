export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on server side for SEO and initial load
  if (process.client) return

  const fallbackGtmId = process.env.GTM_ID || 'GTM-T89X4CKH';
  const provideFallbackGtmId = () => {
    if (!fallbackGtmId) {
      return;
    }

    nuxtApp.provide('gtmId', fallbackGtmId);
    useState('gtm-id', () => fallbackGtmId);
  };

  try {
    // Check if we have a valid Nuxt context
    if (!nuxtApp || !nuxtApp.ssrContext) {
      console.warn('GTM Server Plugin: Invalid Nuxt context');
      return;
    }

    provideFallbackGtmId();
  } catch (error) {
    console.error('GTM Server Plugin: Error:', error);
    provideFallbackGtmId();
  }
});
