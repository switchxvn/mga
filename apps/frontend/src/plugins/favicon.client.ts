import { useFavicon } from '~/composables/useFavicon';

export default defineNuxtPlugin(() => {
  const { refreshFavicon, updateFaviconUrl } = useFavicon();

  // Provide global favicon refresh functionality
  const faviconApi = {
    refresh: refreshFavicon,
    updateUrl: updateFaviconUrl
  };

  // Make it globally available
  return {
    provide: {
      favicon: faviconApi
    }
  };
}); 