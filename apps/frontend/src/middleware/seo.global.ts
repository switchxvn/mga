import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';
import { useTrpc } from '../composables/useTrpc';
import { defineNuxtRouteMiddleware, useRuntimeConfig, useState } from 'nuxt/app';
import { useHead, useSeoMeta } from '@unhead/vue';
import type { RouteLocationNormalized } from 'vue-router';
import { useGTM } from '../composables/useGTM';
import { nextTick } from 'vue';

type RouterOutput = inferRouterOutputs<AppRouter>;
type SeoOutput = RouterOutput['seo']['getSeoByPath'];

const defaultSeo = {
  title: 'Trang chủ',
  description: 'Trang chủ của chúng tôi',
  keywords: 'trang chủ, website',
  ogTitle: 'Trang chủ',
  ogDescription: 'Trang chủ của chúng tôi',
  ogImage: '/images/og-default.jpg',
  robotsTxt: 'index, follow',
  canonicalUrl: ''
} as const;

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip for static resources and API routes
  if (to.path.match(/\.(svg|png|jpg|jpeg|gif|css|js|ico|woff|woff2|ttf|eot|json|xml)$/i) || 
      to.path.startsWith('/api/')) {
    return;
  }
  
  // Skip detail pages as they have their own SEO handling
  const detailPagePatterns = [
    /^\/posts\/[^/]+$/,
    /^\/products\/[^/]+$/,
    /^\/bai-viet\/[^/]+$/,
    /^\/san-pham\/[^/]+$/,
    /^\/dich-vu\/[^/]+$/,
    /^\/services\/[^/]+$/,
    /^\/tickets\/[^/]+$/,
    /^\/categories\/[^/]+$/,
    /^\/danh-muc\/[^/]+$/,
  ];
  
  if (detailPagePatterns.some(pattern => pattern.test(to.path))) {
    return;
  }

  // Only run on server-side for SSR
  if (process.server) {
    await handleServerSideSEO(to.path);
  } else {
    // Client-side: track page view after navigation
    await handleClientSideSEO(to.path);
  }
});

/**
 * Handle server-side SEO rendering
 */
async function handleServerSideSEO(path: string) {
  try {
    // First try to get preloaded SEO data from server plugin
    const preloadedSeoState = useState(`seo-${path}`, () => null)
    let seoData: SeoOutput | null = preloadedSeoState.value
    
    // If no preloaded data, fetch directly
    if (!seoData) {
      const trpc = useTrpc();
      
      if (trpc) {
        try {
          seoData = await trpc.seo.getSeoByPath.query(path || '/');
        } catch (apiError) {
          console.error('SEO Middleware: API error on server:', apiError);
        }
      }
    }

    // Transform and apply SEO data (handles null case)
    const seo = transformSeoData(seoData);
    applySeoMeta(seo, path);
    
    console.log(`SEO Middleware: Server-side SEO applied for ${path}`, seo.title);

  } catch (error) {
    console.error('SEO Middleware: Server-side error:', error);
    applySeoMeta(transformSeoData(null), path);
  }
}

/**
 * Handle client-side tracking and hydration
 */
async function handleClientSideSEO(path: string) {
  try {
    // Get current SEO state (should be hydrated from server)
    const currentTitle = document?.title;
    
    // Track page view for GTM
    nextTick(() => {
      try {
        const { trackPageView } = useGTM();
        trackPageView(path, currentTitle);
      } catch (gtmError) {
        console.error('SEO Middleware: GTM tracking error:', gtmError);
      }
    });

  } catch (error) {
    console.error('SEO Middleware: Client-side error:', error);
  }
}

/**
 * Transform SEO data with fallbacks
 */
function transformSeoData(result: SeoOutput | null): {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsTxt: string;
  canonicalUrl: string;
} {
  if (!result) return { ...defaultSeo };
  
  return {
    title: result.title || defaultSeo.title,
    description: result.description || defaultSeo.description,
    keywords: result.keywords || defaultSeo.keywords,
    ogTitle: result.ogTitle || result.title || defaultSeo.ogTitle,
    ogDescription: result.ogDescription || result.description || defaultSeo.ogDescription,
    ogImage: result.ogImage || defaultSeo.ogImage,
    robotsTxt: result.robotsTxt || defaultSeo.robotsTxt,
    canonicalUrl: result.canonicalUrl || ''
  };
}

/**
 * Apply SEO meta tags - CRITICAL for SSR
 */
function applySeoMeta(seo: {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsTxt: string;
  canonicalUrl: string;
}, path: string) {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase?.replace('/api', '') || 'http://localhost:3000';
  
  // Build canonical URL
  const canonicalUrl = seo.canonicalUrl || `${baseUrl}${path}`;
  const fullOgImage = seo.ogImage.startsWith('http') ? seo.ogImage : `${baseUrl}${seo.ogImage}`;
  
  // Apply SEO meta tags - MUST be synchronous for SSR
  useSeoMeta({
    title: seo.title,
    ogTitle: seo.ogTitle,
    description: seo.description,
    ogDescription: seo.ogDescription,
    ogImage: fullOgImage,
    keywords: seo.keywords,
    robots: seo.robotsTxt,
    ogUrl: canonicalUrl,
    ogType: 'website',
    ogSiteName: 'Website',
    twitterCard: 'summary_large_image',
    twitterTitle: seo.ogTitle,
    twitterDescription: seo.ogDescription,
    twitterImage: fullOgImage,
  });

  // Set document head - CRITICAL for SSR
  useHead({
    title: seo.title,
    htmlAttrs: {
      lang: 'vi'
    },
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    meta: [
      { name: 'format-detection', content: 'telephone=no' },
      { property: 'og:locale', content: 'vi_VN' },
      { name: 'revisit-after', content: '1 days' },
      { name: 'author', content: 'Website' },
    ]
  });
} 