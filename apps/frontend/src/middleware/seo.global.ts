import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';

type RouterOutput = inferRouterOutputs<AppRouter>;
type SeoOutput = RouterOutput['seo']['getSeoByPath'];

export default defineNuxtRouteMiddleware(async (to) => {
  const { $trpc } = useNuxtApp();
  
  try {
    const seo = await $trpc.seo.getSeoByPath.query(to.path || '/');
    if (!seo) return;

    useSeoMeta({
      title: seo.title || undefined,
      description: seo.description || undefined,
      // Open Graph
      ogTitle: seo.ogTitle || seo.title || undefined,
      ogDescription: seo.ogDescription || seo.description || undefined,
      ogImage: seo.ogImage || undefined,
      // Keywords
      keywords: seo.keywords || undefined,
      // Robots
      robots: seo.robotsTxt || undefined,
      // Canonical
      ...(seo.canonicalUrl ? { canonical: seo.canonicalUrl } : {}),
    });
  } catch (err) {
    console.error('Error updating SEO tags:', err);
  }
}); 