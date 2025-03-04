import { defineNuxtPlugin, useRoute, useHead } from 'nuxt/app';
import { watch } from 'vue';
import { useSeo } from '../composables/useSeo';

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute();
  const { getSeoByPath } = useSeo();

  // Function to update SEO tags
  const updateSeoTags = async (path: string) => {
    const seo = await getSeoByPath(path);
    if (!seo) return;

    useHead({
      title: seo.title ?? undefined,
      meta: [
        { name: 'description', content: seo.description ?? undefined },
        // Open Graph
        { property: 'og:title', content: seo.ogTitle ?? seo.title ?? undefined },
        { property: 'og:description', content: seo.ogDescription ?? seo.description ?? undefined },
        { property: 'og:image', content: seo.ogImage ?? undefined },
        // Keywords
        { name: 'keywords', content: seo.keywords ?? undefined },
        // Robots
        { name: 'robots', content: seo.robotsTxt ?? undefined },
      ].filter(meta => meta.content), // Only include meta tags with content
      link: [
        ...(seo.canonicalUrl ? [{ rel: 'canonical', href: seo.canonicalUrl }] : []),
      ],
    });
  };

  // Initial SEO update
  await updateSeoTags(route.path);

  // Watch for route changes
  watch(
    () => route.path,
    async (newPath) => {
      await updateSeoTags(newPath);
    }
  );
}); 