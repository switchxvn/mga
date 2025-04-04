export default defineNuxtConfig({
  srcDir: 'src/',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss'
  ],

  css: [
    '~/assets/scss/main.scss'
  ],


  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/abstracts/_variables.scss" as *;'
        }
      }
    },
  },

  // @ts-ignore
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },

  ui: {
    global: true,
    icons: ['heroicons']
  },

  app: {
    head: {
      title: 'Admin Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Admin Dashboard for E-commerce Website' }
      ]
    }
  },

  typescript: {
    strict: true,
    shim: false
  },

  compatibilityDate: '2025-04-04'
})