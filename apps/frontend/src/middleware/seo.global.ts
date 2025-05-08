import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';
import { useTrpc } from '../composables/useTrpc';
import { defineNuxtRouteMiddleware, useAsyncData, useRuntimeConfig } from 'nuxt/app';
import { useHead, useSeoMeta } from '@unhead/vue';
import type { RouteLocationNormalized } from 'vue-router';

type RouterOutput = inferRouterOutputs<AppRouter>;
type SeoOutput = RouterOutput['seo']['getSeoByPath'];

const defaultSeo = {
  title: 'Trang chủ',
  description: 'Trang chủ',
  keywords: 'Trang chủ',
  ogTitle: 'Trang chủ',
  ogDescription: 'Trang chủ',
  ogImage: '',
  robotsTxt: 'index, follow',
  canonicalUrl: ''
} as const;

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

    // Use useAsyncData with SSR-specific options
    const { data: seoData } = await useAsyncData(
      `seo-${to.path}`,
      () => trpc.seo.getSeoByPath.query(to.path || '/'),
      {
        server: true,
        lazy: false,
        immediate: true,
        transform: (result) => result || defaultSeo
      }
    );

    // Ensure we have SEO data
    const seo = seoData.value || defaultSeo;

    // Use useSeoMeta for better SEO handling
    useSeoMeta({
      title: () => seo.title,
      ogTitle: () => seo.ogTitle || seo.title,
      description: () => seo.description,
      ogDescription: () => seo.ogDescription || seo.description,
      ogImage: () => seo.ogImage,
      keywords: () => seo.keywords,
      robots: () => seo.robotsTxt,
    });

    // Set canonical URL if available
    if (seo.canonicalUrl) {
      useHead({
        link: [
          { rel: 'canonical', href: seo.canonicalUrl }
        ]
      });
    }
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    
    // Set default SEO values on error
    useSeoMeta({
      title: () => defaultSeo.title,
      ogTitle: () => defaultSeo.ogTitle,
      description: () => defaultSeo.description,
      ogDescription: () => defaultSeo.ogDescription,
      keywords: () => defaultSeo.keywords,
      robots: 'index, follow'
    });
  }
}); 