import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';
import { useTrpc } from '../composables/useTrpc';
import { defineNuxtRouteMiddleware } from 'nuxt/app';
import { useAsyncData } from 'nuxt/app';
import { useHead } from '@unhead/vue';
import type { RouteLocationNormalized } from 'vue-router';

type RouterOutput = inferRouterOutputs<AppRouter>;
type SeoOutput = RouterOutput['seo']['getSeoByPath'];

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
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

  try {
    // Initialize tRPC client
    const trpc = useTrpc();
    if (!trpc) {
      console.error('tRPC client not initialized');
      return;
    }

    // Force refresh cache on each navigation
    const { data: seo } = await useAsyncData(
      `seo-${to.path}`,
      async () => {
        try {
          console.log('Fetching SEO data for path:', to.path);
          const result = await trpc.seo.getSeoByPath.query(to.path || '/');
          console.log('SEO data result:', result);
          return result;
        } catch (err) {
          console.error('Error in tRPC query:', err);
          return null;
        }
      },
      {
        server: false, // Run on client-side to ensure fresh data
        lazy: false,
        immediate: true,
        default: () => ({
          title: 'Cáp Treo Núi Sam | Trọn Vẹn Trải Nghiệm Tâm Linh Từ Trên Cao',
          description: 'Cáp Treo Núi Sam | Trọn Vẹn Trải Nghiệm Tâm Linh Từ Trên Cao',
          keywords: 'Cáp Treo Núi Sam, Trọn Vẹn Trải Nghiệm Tâm Linh Từ Trên Cao',
          ogTitle: 'Cáp Treo Núi Sam | Trọn Vẹn Trải Nghiệm Tâm Linh Từ Trên Cao',
          ogDescription: 'Cáp Treo Núi Sam | Trọn Vẹn Trải Nghiệm Tâm Linh Từ Trên Cao',
          ogImage: '',
          robotsTxt: 'index, follow',
          canonicalUrl: ''
        })
      }
    );

    if (!seo.value) {
      console.warn('No SEO data returned for path:', to.path);
      return;
    }

    useHead({
      title: seo.value.title,
      meta: [
        { name: 'description', content: seo.value.description },
        { name: 'keywords', content: seo.value.keywords },
        { property: 'og:title', content: seo.value.ogTitle || seo.value.title },
        { property: 'og:description', content: seo.value.ogDescription || seo.value.description },
        { property: 'og:image', content: seo.value.ogImage },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: seo.value.robotsTxt }
      ],
      ...(seo.value.canonicalUrl ? {
        link: [{ rel: 'canonical', href: seo.value.canonicalUrl }]
      } : {})
    });
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    // Set default SEO if API fails
    useHead({
      title: 'Default Title',
      meta: [
        { name: 'description', content: 'Default Description' },
        { name: 'keywords', content: 'default, keywords' },
        { property: 'og:title', content: 'Default Title' },
        { property: 'og:description', content: 'Default Description' },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index, follow' }
      ]
    });
  }
}); 