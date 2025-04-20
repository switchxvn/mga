import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';
import { useTrpc } from '../composables/useTrpc';

type RouterOutput = inferRouterOutputs<AppRouter>;
type SeoOutput = RouterOutput['seo']['getSeoByPath'];

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip for static resources
  if (to.path.match(/\.(svg|png|jpg|jpeg|gif|css|js|ico|woff|woff2|ttf|eot|json|xml)$/i)) {
    return;
  }
  
  // Skip detail pages as they have their own SEO
  const detailPagePatterns = [
    /^\/posts\/[^\/]+$/,
    /^\/products\/[^\/]+$/,
    /^\/bai-viet\/[^\/]+$/,
    /^\/san-pham\/[^\/]+$/,
    /^\/dich-vu\/[^\/]+$/,
    /^\/tickets\/[^\/]+$/,
  ];
  
  if (detailPagePatterns.some(pattern => pattern.test(to.path))) {
    return;
  }

  const trpc = useTrpc();
  
  try {
    const seo = await trpc.seo.getSeoByPath.query(to.path || '/');
    if (!seo) return;

    const head = {
      title: seo.title,
      meta: [
        { name: 'description', content: seo.description },
        // Open Graph
        { property: 'og:title', content: seo.ogTitle || seo.title },
        { property: 'og:description', content: seo.ogDescription || seo.description },
        { property: 'og:image', content: seo.ogImage },
        // Keywords
        { name: 'keywords', content: seo.keywords },
        // Robots
        { name: 'robots', content: seo.robotsTxt },
      ].filter(meta => meta.content), // Remove meta tags with undefined content
      link: seo.canonicalUrl ? [
        { rel: 'canonical', href: seo.canonicalUrl }
      ] : []
    };

    // Set SEO tags using both methods for maximum compatibility
    useHead(head);
    useSeoMeta({
      title: seo.title,
      description: seo.description,
      ogTitle: seo.ogTitle || seo.title,
      ogDescription: seo.ogDescription || seo.description,
      ogImage: seo.ogImage,
      keywords: seo.keywords,
      robots: seo.robotsTxt,
      ...(seo.canonicalUrl ? { canonical: seo.canonicalUrl } : {})
    });
  } catch (err) {
    console.error('Error updating SEO tags:', err);
  }
}); 