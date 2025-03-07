export default {
  lazy: true,
  langDir: 'src/i18n/locales',
  defaultLocale: 'vi',
  locales: [
    {
      code: 'vi',
      name: 'Tiếng Việt',
      file: 'vi.json',
    },
    {
      code: 'en',
      name: 'English',
      file: 'en.json',
    },
  ],
  strategy: 'prefix_except_default',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_locale',
    redirectOn: 'root',
  },
  vueI18n: './src/plugins/i18n.ts'
} 