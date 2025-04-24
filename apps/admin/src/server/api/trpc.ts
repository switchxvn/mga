import { defineEventHandler, proxyRequest } from 'h3';
import { useRuntimeConfig } from '#imports';

/**
 * Server middleware to handle API requests
 * Forwards requests from /api to backend
 */
export default defineEventHandler(async (event) => {
  // Only handle /api requests
  if (!event.path?.startsWith('/api')) {
    return;
  }

  const config = useRuntimeConfig();
  const target = config.public.apiBase;
  
  console.log('Proxying API request to:', target);
  console.log('Request path:', event.path);
  
  return proxyRequest(event, target, {
    headers: {
      host: new URL(target).host
    }
  });
}); 