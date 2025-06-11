// Type declarations for GTM
declare global {
  interface Window {
    dataLayer: any[]
  }
}

/**
 * Composable to access GTM ID and utilities
 */
export const useGTM = () => {
  // Get GTM ID from global state (set by server plugin)
  const gtmId = useState<string | null>('gtm-id', () => null)
  
  // Get GTM ID from nuxtApp provide (for immediate access)
  const nuxtApp = useNuxtApp()
  const providedGtmId = nuxtApp.$gtmId

  /**
   * Push event to dataLayer
   */
  const pushToDataLayer = (event: Record<string, any>) => {
    if (process.client && window.dataLayer) {
      window.dataLayer.push(event)
    }
  }

  /**
   * Track page view
   */
  const trackPageView = (pagePath?: string, pageTitle?: string) => {
    pushToDataLayer({
      event: 'page_view',
      page_path: pagePath || useRoute().fullPath,
      page_title: pageTitle || (process.client ? document?.title : ''),
      page_location: process.client ? window.location.href : ''
    })
  }

  /**
   * Track custom event
   */
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    pushToDataLayer({
      event: eventName,
      ...parameters
    })
  }

  /**
   * Track ecommerce event
   */
  const trackEcommerce = (action: string, ecommerce: Record<string, any>) => {
    pushToDataLayer({
      event: action,
      ecommerce
    })
  }

  return {
    // GTM ID access
    gtmId: readonly(gtmId),
    providedGtmId,
    
    // GTM utilities
    pushToDataLayer,
    trackPageView,
    trackEvent,
    trackEcommerce,
    
    // Helper to check if GTM is loaded
    isGTMLoaded: computed(() => !!gtmId.value || !!providedGtmId)
  }
} 