export default defineNuxtRouteMiddleware((to) => {
  // Only run on client-side
  if (process.server) return

  // Use nextTick to ensure page is fully loaded
  nextTick(() => {
    const { trackPageView } = useTracking()
    
    // Track page view with route information
    trackPageView(
      to.meta?.title as string || document.title,
      window.location.href
    )
  })
}) 