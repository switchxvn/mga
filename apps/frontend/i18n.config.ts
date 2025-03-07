export default {
  lazy: false,
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
} 