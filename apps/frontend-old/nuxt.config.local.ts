import { defineNuxtConfig } from 'nuxt/config';

// Cấu hình Nuxt cho môi trường phát triển local
export default defineNuxtConfig({
  // Ghi đè cấu hình devServer
  devServer: {
    host: process.env.NUXT_HOST || 'localhost',
    port: process.env.NUXT_PORT ? parseInt(process.env.NUXT_PORT) : 4200,
  },
}); 