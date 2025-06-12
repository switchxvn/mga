// Fetch polyfill plugin - loads early to ensure fetch is available
export default defineNuxtPlugin({
  name: 'fetch-polyfill',
  enforce: 'pre', // Run before other plugins
  async setup() {
    // Only run on server side
    if (process.client) return;

    // Check if fetch is already available (native Node.js 18+ or already polyfilled)
    if (typeof globalThis.fetch !== 'undefined') {
      console.log('Fetch polyfill: Native fetch already available');
      return;
    }

    try {
      // Use dynamic import to avoid bundling node-fetch in client build
      const nodeFetch = await import('node-fetch');
      
      // Only polyfill if fetch doesn't exist
      if (typeof globalThis.fetch === 'undefined') {
        // Store original reference to avoid recursion
        const originalFetch = nodeFetch.default;
        
        // Polyfill fetch globally with proper binding
        // @ts-expect-error - Adding fetch polyfill to globalThis
        globalThis.fetch = (url, options) => originalFetch(url, options);
        // @ts-expect-error - Adding Headers polyfill to globalThis
        globalThis.Headers = nodeFetch.Headers;
        // @ts-expect-error - Adding Request polyfill to globalThis
        globalThis.Request = nodeFetch.Request;
        // @ts-expect-error - Adding Response polyfill to globalThis  
        globalThis.Response = nodeFetch.Response;

        console.log('Fetch polyfill: Successfully loaded node-fetch polyfill');
      }
    } catch (error) {
      console.error('Fetch polyfill: Failed to load node-fetch:', error);
      
      // Don't provide a fallback that could cause issues
      console.warn('Fetch polyfill: Skipping fetch polyfill due to error');
    }
  }
}); 