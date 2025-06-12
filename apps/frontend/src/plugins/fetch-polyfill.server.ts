// Fetch polyfill plugin - loads early to ensure fetch is available
export default defineNuxtPlugin({
  name: 'fetch-polyfill',
  enforce: 'pre', // Run before other plugins
  setup() {
    // Only run on server side
    if (process.client) return;

    // Check if fetch is already available
    if (typeof globalThis.fetch !== 'undefined') {
      return;
    }

    try {
      // Try to require node-fetch synchronously for immediate availability
      const nodeFetch = require('node-fetch');
      
      // Polyfill fetch globally
      globalThis.fetch = nodeFetch.default;
      globalThis.Headers = nodeFetch.Headers;
      globalThis.Request = nodeFetch.Request;
      globalThis.Response = nodeFetch.Response;

      console.log('Fetch polyfill: Successfully loaded node-fetch');
    } catch (error) {
      console.error('Fetch polyfill: Failed to load node-fetch:', error);
      
      // Fallback: provide a minimal fetch implementation that rejects
      globalThis.fetch = () => {
        return Promise.reject(new Error('Fetch is not available in this environment'));
      };
    }
  }
}); 