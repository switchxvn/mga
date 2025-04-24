import { defineEventHandler, proxyRequest } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  // Only proxy /trpc requests
  if (!event.path.startsWith('/trpc')) {
    return;
  }

  // Remove /api prefix when forwarding to backend
  return proxyRequest(event, config.public.apiBase.replace('/api', ''));
}); 