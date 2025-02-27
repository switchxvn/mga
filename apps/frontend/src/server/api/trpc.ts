import { defineEventHandler, proxyRequest } from 'h3';
import { useRuntimeConfig } from '#imports';

/**
 * Server middleware để xử lý các request tRPC
 * Chuyển tiếp các request từ /api/trpc đến backend
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  
  // Chuyển tiếp request đến backend
  return proxyRequest(event, `${apiBase}/api/trpc`);
}); 