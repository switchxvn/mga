export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on server side for SSR optimization
  if (process.client) return

  try {
    // Check if we have a valid Nuxt context
    if (!nuxtApp || !nuxtApp.ssrContext) {
      console.warn('SEO Server Plugin: Invalid Nuxt context');
      return;
    }

    // Get tRPC instance
    const { $trpc } = nuxtApp;
    if (!$trpc) {
      console.warn('SEO Server Plugin: tRPC not available');
      return;
    }

    // Get current route path
    const path = nuxtApp.ssrContext?.url || '/';
    
    // Skip detail pages and static resources
    const skipPatterns = [
      /\.(svg|png|jpg|jpeg|gif|css|js|ico|woff|woff2|ttf|eot|json|xml)$/i,
      /^\/api\//,
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

    if (skipPatterns.some(pattern => pattern.test(path))) {
      return;
    }

    // Preload SEO data for the current path with timeout
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SEO fetch timeout')), 5000)
      );

      const seoDataPromise = ($trpc as any).seo.getSeoByPath.query(path);
      
      const seoData = await Promise.race([seoDataPromise, timeoutPromise]);
      
      if (seoData) {
        // Store in global state for middleware to use
        const seoState = useState(`seo-${path}`, () => seoData);
        console.log('✅ SEO Server Plugin: Successfully preloaded dynamic SEO data for', path);
      } else {
        console.log('SEO Server Plugin: No SEO data found for path:', path);
      }
    } catch (apiError) {
      console.warn('SEO Server Plugin: Failed to preload SEO data:', apiError);
    }

  } catch (error) {
    console.error('SEO Server Plugin: Error:', error);
  }
}); 