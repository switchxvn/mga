export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on server side for SSR optimization
  if (process.client) return

  try {
    // Get tRPC instance
    const { $trpc } = nuxtApp
    if (!$trpc) {
      console.warn('SEO Server Plugin: tRPC not available')
      return
    }

    // Get current route path
    const path = nuxtApp.ssrContext?.url || '/'
    
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
    ]

    if (skipPatterns.some(pattern => pattern.test(path))) {
      return
    }

    // Preload SEO data for the current path
    try {
      const seoData = await ($trpc as any).seo.getSeoByPath.query(path)
      
      if (seoData) {
        // Store in global state for middleware to use
        const seoState = useState(`seo-${path}`, () => seoData)
        console.log('SEO Server Plugin: Preloaded SEO data for', path)
      }
    } catch (apiError) {
      console.warn('SEO Server Plugin: Failed to preload SEO data:', apiError)
    }

  } catch (error) {
    console.error('SEO Server Plugin: Error:', error)
  }
}) 