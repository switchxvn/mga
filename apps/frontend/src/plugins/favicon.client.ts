export default defineNuxtPlugin({
  name: 'favicon-client',
  dependsOn: ['trpc'],
  setup() {
    return {
      provide: {
        favicon: {
          refresh: async () => {
            const { useFavicon } = await import('~/composables/useFavicon');
            const { refreshFavicon } = useFavicon();
            return refreshFavicon();
          },
          updateUrl: async (url: string) => {
            const { useFavicon } = await import('~/composables/useFavicon');
            const { updateFaviconUrl } = useFavicon();
            updateFaviconUrl(url);
          },
        },
      },
    };
  },
});
