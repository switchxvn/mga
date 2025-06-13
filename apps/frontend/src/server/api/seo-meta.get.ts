import { defineEventHandler, getQuery, createError, proxyRequest } from 'h3';

interface SeoMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl: string;
  twitterCard: string;
  keywords?: string;
  canonical?: string;
}

/**
 * Server API endpoint to get SEO meta information from database via tRPC
 * Falls back to default meta if no database entry found
 */
export default defineEventHandler(async (event): Promise<SeoMeta> => {
  const query = getQuery(event);
  const path = query.path as string;
  const fullUrl = query.url as string || '';
  const config = useRuntimeConfig();

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Path parameter is required'
    });
  }

  // Get site info from runtime config
  const siteName = config.public.siteName;
  const siteUrl = config.public.siteUrl;

  // Default SEO meta fallback
  const getDefaultMeta = (): SeoMeta => ({
    title: `${siteName} - Trang thương mại điện tử`,
    description: `Khám phá các sản phẩm chất lượng cao tại ${siteName}. Mua sắm online dễ dàng, giao hàng nhanh chóng.`,
    ogTitle: `${siteName} - Trang thương mại điện tử`,
    ogDescription: `Khám phá các sản phẩm chất lượng cao tại ${siteName}. Mua sắm online dễ dàng, giao hàng nhanh chóng.`,
    ogImage: '/images/og-default.jpg',
    ogUrl: fullUrl || siteUrl,
    twitterCard: 'summary_large_image',
    keywords: 'thương mại điện tử, mua sắm online, sản phẩm chất lượng',
    canonical: fullUrl || siteUrl
  });

  // Try to fetch SEO data from database via tRPC
  try {
    // Create tRPC request to get SEO data
    const tRpcUrl = `${config.public.apiBase}/api/trpc/seo.getSeoByPath?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: path }))}`;
    
    const response = await fetch(tRpcUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const tRpcData = await response.json();
      const seoData = tRpcData?.[0]?.result?.data;
      
      if (seoData) {
        // Transform database SEO data to our SeoMeta format
        return {
          title: seoData.title || getDefaultMeta().title,
          description: seoData.description || getDefaultMeta().description,
          ogTitle: seoData.ogTitle || seoData.title || getDefaultMeta().ogTitle,
          ogDescription: seoData.ogDescription || seoData.description || getDefaultMeta().ogDescription,
          ogImage: seoData.ogImage || '/images/og-default.jpg',
          ogUrl: fullUrl || siteUrl,
          twitterCard: 'summary_large_image',
          keywords: seoData.keywords || getDefaultMeta().keywords,
          canonical: seoData.canonicalUrl || fullUrl || siteUrl
        };
      }
    }
  } catch (error) {
    console.warn('Failed to fetch SEO data from database:', error);
  }

  // Return default meta if database fetch failed
  const defaultMeta = getDefaultMeta();

  try {
    // Enhance default meta based on route patterns when no database entry exists
    if (path === '/') {
      return {
        ...defaultMeta,
        title: `Trang chủ - ${siteName}`,
        description: `Chào mừng đến với ${siteName} - nơi cung cấp những sản phẩm chất lượng cao nhất.`,
        keywords: `trang chủ, ${siteName.toLowerCase()}, mua sắm online`
      };
    }

    // Product category pages
    if (path.startsWith('/products')) {
      return {
        ...defaultMeta,
        title: `Sản phẩm - ${siteName}`,
        description: `Danh sách các sản phẩm chất lượng cao tại ${siteName}.`,
        keywords: `sản phẩm, ${siteName.toLowerCase()}, mua sắm online`
      };
    }

    // Individual product pages
    if (path.startsWith('/product/')) {
      const productSlug = path.split('/product/')[1];
      return {
        ...defaultMeta,
        title: `${productSlug} - ${siteName}`,
        description: `Xem chi tiết sản phẩm ${productSlug} tại ${siteName}. Chất lượng cao, giá tốt.`,
        keywords: `${productSlug}, sản phẩm, mua sắm online`
      };
    }

    // About page
    if (path === '/about') {
      return {
        ...defaultMeta,
        title: `Giới thiệu - ${siteName}`,
        description: `Tìm hiểu về ${siteName} - thương hiệu uy tín với nhiều năm kinh nghiệm.`,
        keywords: `giới thiệu, về chúng tôi, ${siteName.toLowerCase()}`
      };
    }

    // Contact page
    if (path === '/contact') {
      return {
        ...defaultMeta,
        title: `Liên hệ - ${siteName}`,
        description: `Liên hệ với ${siteName} để được tư vấn và hỗ trợ tốt nhất.`,
        keywords: `liên hệ, hỗ trợ, tư vấn, ${siteName.toLowerCase()}`
      };
    }

    // Blog pages
    if (path.startsWith('/blog')) {
      if (path === '/blog') {
        return {
          ...defaultMeta,
          title: `Blog - ${siteName}`,
          description: `Đọc những bài viết hay và hữu ích từ ${siteName}.`,
          keywords: `blog, bài viết, tin tức, ${siteName.toLowerCase()}`
        };
      } else {
        const blogSlug = path.split('/blog/')[1];
        return {
          ...defaultMeta,
          title: `${blogSlug} - Blog ${siteName}`,
          description: `Đọc bài viết ${blogSlug} trên blog ${siteName}.`,
          keywords: `${blogSlug}, blog, bài viết`
        };
      }
    }

    // Default case
    return defaultMeta;

  } catch (error) {
    console.error('Error generating SEO meta:', error);
    return defaultMeta;
  }
}); 