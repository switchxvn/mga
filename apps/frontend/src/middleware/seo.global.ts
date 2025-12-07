import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';
import { useTrpc } from '../composables/useTrpc';
import { defineNuxtRouteMiddleware, useRuntimeConfig, useState, useRequestURL } from 'nuxt/app';
import { useHead, useSeoMeta } from '#imports';
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

/**
 * Get base URL in a safe way that works in all contexts (Nuxt SSR best practice)
 * - On server: use useRequestURL() to get the real request origin (see Nuxt docs)
 * - On client: use window.location as before
 */
function getSafeBaseUrl(): string {
  if (process.server) {
    try {
      // Debug: log env and runtimeConfig in SSR
      const config = useRuntimeConfig();
      // eslint-disable-next-line no-console
      console.log('[SEO][SSR] runtimeConfig.public.apiBase:', config.public.apiBase);
      // eslint-disable-next-line no-console
      console.log('[SEO][SSR] process.env.NUXT_PUBLIC_API_BASE:', process.env.NUXT_PUBLIC_API_BASE);
      const url = useRequestURL();
      return url.origin;
    } catch {
      // Fallback if no request context (should rarely happen)
      return 'https://yourdomain.com';
    }
  }
  // Client-side: try various methods
  try {
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      if (origin.includes(':4200')) {
        return 'http://localhost:3000';
      }
      return origin;
    }
  } catch {
    // Fallback if window access fails
  }
  // Try runtime config as last resort on client
  try {
    const config = useRuntimeConfig();
    return config.public.apiBase?.replace('/api', '') || 'http://localhost:3000';
  } catch {
    return 'http://localhost:3000';
  }
}

// Use tRPC type instead of custom interface
// interface SeoMeta will be replaced by SeoOutput from tRPC

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip API routes, static assets, and internal paths to prevent infinite loops
  if (
    to.path.startsWith('/api/') ||
    to.path.startsWith('/internal-api/') ||
    to.path.startsWith('/_nuxt/') ||
    to.path.startsWith('/static/') ||
    to.path.startsWith('/images/') ||
    to.path.startsWith('/favicon') ||
    to.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt)$/)
  ) {
    return;
  }

  // Skip if running on client-side navigation (to avoid double loading)
  if (process.client) {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.isHydrating === false) {
      return;
    }
  }

  try {
    const config = useRuntimeConfig();
    
    // Get current URL safely
    const currentUrl = process.client 
      ? window.location.href 
      : `${config.public.siteUrl}${to.fullPath}`;

    // Fetch SEO data directly from tRPC (works in all environments)
    let seoData = null;
    
    try {
      const trpc = useTrpc();
      seoData = await trpc.seo.getSeoByPath.query(to.path);
    } catch (error) {
      console.warn('SEO: Failed to fetch SEO data:', error);
      seoData = null;
    }

    // Apply SEO meta tags
    if (seoData) {
      useHead({
        title: seoData.title,
        meta: [
          { name: 'description', content: seoData.description },
          { name: 'keywords', content: seoData.keywords || '' },
          { property: 'og:type', content: 'website' },
          { property: 'og:title', content: seoData.ogTitle || seoData.title },
          { property: 'og:description', content: seoData.ogDescription || seoData.description },
          { property: 'og:image', content: seoData.ogImage || '/images/og-default.jpg' },
          { property: 'og:url', content: currentUrl },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: seoData.ogTitle || seoData.title },
          { name: 'twitter:description', content: seoData.ogDescription || seoData.description },
          { name: 'twitter:image', content: seoData.ogImage || '/images/og-default.jpg' }
        ],
        link: [
          { rel: 'canonical', href: seoData.canonicalUrl || currentUrl }
        ]
      });

      // Also use useSeoMeta for additional optimization
      useSeoMeta({
        title: seoData.title,
        description: seoData.description,
        ogType: 'website',
        ogTitle: seoData.ogTitle || seoData.title,
        ogDescription: seoData.ogDescription || seoData.description,
        ogImage: seoData.ogImage,
        ogUrl: currentUrl,
        twitterCard: 'summary_large_image',
        twitterTitle: seoData.ogTitle || seoData.title,
        twitterDescription: seoData.ogDescription || seoData.description,
        twitterImage: seoData.ogImage
      });
    }

  } catch (error) {
    // Silently fail - default meta will be used from nuxt.config.ts
    console.warn('SEO middleware: Failed to load SEO data, using defaults:', error);
  }
});

/**
 * Handle server-side SEO rendering
 */
async function handleServerSideSEO(path: string) {
  try {
    // Check if we're in a valid Nuxt context first
    try {
      const nuxtApp = useNuxtApp();
      if (!nuxtApp) {
        console.warn('SEO Middleware: Nuxt app context not available');
        return;
      }
    } catch (contextError) {
      console.warn('SEO Middleware: Cannot access Nuxt context:', contextError);
      return;
    }

    // First try to get preloaded SEO data from server plugin
    const preloadedSeoState = useState(`seo-${path}`, () => null);
    let seoData: SeoOutput | null = preloadedSeoState.value;
    
    // If no preloaded data, try to fetch directly from API
    if (!seoData) {
      console.log('SEO Middleware: No preloaded data, fetching from API for', path);
      try {
        const trpc = useTrpc();
        
        if (trpc) {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SEO API timeout')), 3000)
          );
          
          const seoPromise = trpc.seo.getSeoByPath.query(path || '/');
          seoData = await Promise.race([seoPromise, timeoutPromise]) as SeoOutput;
          
          if (seoData) {
            console.log('✅ SEO Middleware: Successfully fetched dynamic SEO data from API for', path);
          }
        } else {
          console.warn('SEO Middleware: tRPC not available, using defaults');
        }
      } catch (apiError) {
        console.warn('SEO Middleware: API error on server:', apiError);
        console.log('SEO Middleware: Falling back to defaults for', path);
      }
    } else {
      console.log('✅ SEO Middleware: Using preloaded SEO data for', path);
    }

    // Transform and apply SEO data (handles null case)
    const seo = transformSeoData(seoData);
    applySeoMeta(seo, path);
    
    console.log(`SEO Middleware: Server-side SEO applied for ${path}`, seo.title);

  } catch (error) {
    console.error('SEO Middleware: Server-side error:', error);
    // Apply default SEO as fallback
    try {
      applySeoMeta(transformSeoData(null), path);
    } catch (fallbackError) {
      console.error('SEO Middleware: Failed to apply fallback SEO:', fallbackError);
    }
  }
}

/**
 * Handle client-side tracking and hydration
 */
async function handleClientSideSEO(path: string) {
  try {
    // Check if we're in a valid client context
    if (!process.client || typeof window === 'undefined') {
      return;
    }

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
  try {
    // Get base URL using the safe method
    const baseUrl = getSafeBaseUrl();
    
    // Build canonical URL
    const canonicalUrl = seo.canonicalUrl || `${baseUrl}${path}`;
    const fullOgImage = seo.ogImage.startsWith('http') ? seo.ogImage : `${baseUrl}${seo.ogImage}`;
    
    // Apply SEO meta tags - wrap in try-catch for safety
    try {
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
    } catch (seoMetaError) {
      console.warn('SEO Middleware: useSeoMeta failed:', seoMetaError);
    }

    // Set document head - wrap in try-catch for safety
    try {
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
    } catch (headError) {
      console.warn('SEO Middleware: useHead failed:', headError);
    }
  } catch (error) {
    console.error('SEO Middleware: Error applying SEO meta:', error);
  }
} 
