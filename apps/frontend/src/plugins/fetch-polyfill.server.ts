// Fetch polyfill plugin - loads early to ensure fetch is available
export default defineNuxtPlugin({
  name: 'fetch-polyfill',
  enforce: 'pre', // Run before other plugins
  async setup() {
    // Only run on server side
    if (process.client) return;

    // Check if fetch is already available
    if (typeof globalThis.fetch !== 'undefined') {
      return;
    }

    try {
      // Use dynamic import to avoid bundling node-fetch in client build
      const { default: fetch, Headers, Request, Response } = await import('node-fetch');
      
      // Polyfill fetch globally
      // @ts-expect-error - Adding fetch polyfill to globalThis
      globalThis.fetch = fetch;
      // @ts-expect-error - Adding Headers polyfill to globalThis
      globalThis.Headers = Headers;
      // @ts-expect-error - Adding Request polyfill to globalThis
      globalThis.Request = Request;
      // @ts-expect-error - Adding Response polyfill to globalThis  
      globalThis.Response = Response;

      console.log('Fetch polyfill: Successfully loaded node-fetch');
    } catch (error) {
      console.error('Fetch polyfill: Failed to load node-fetch:', error);
      
      // Fallback: provide a minimal fetch implementation that rejects
      // @ts-expect-error - Adding fallback fetch to globalThis
      globalThis.fetch = () => {
        return Promise.reject(new Error('Fetch is not available in this environment'));
      };
    }
  }
}); 