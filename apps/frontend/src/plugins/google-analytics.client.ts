declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface Setting {
  key: string
  value: string
}

// Initialize gtag function
function initializeGtag() {
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag
  return gtag
}

export default defineNuxtPlugin(async (nuxtApp: any) => {
  // Only run on client side
  if (process.server) {
    console.log('Google Analytics plugin: Skipping on server side')
    return
  }

  console.log('Google Analytics plugin: Starting initialization...')

  try {
    // Check if tRPC is available
    if (!nuxtApp.$trpc) {
      console.error('Google Analytics plugin: tRPC not available')
      return
    }

    console.log('Google Analytics plugin: tRPC available, fetching settings...')
    
    // Get settings from the API
    const { $trpc } = nuxtApp
    const settings: Setting[] = await $trpc.settings.getPublicSettings.query()
    
    console.log('Google Analytics plugin: Settings received:', settings?.length || 0, 'items')
    
    const googleAnalyticsId = settings.find((s: Setting) => s.key === 'google_analytics_id')?.value
    const googleTagManagerId = settings.find((s: Setting) => s.key === 'google_tag_manager_id')?.value
    const googleAdsId = settings.find((s: Setting) => s.key === 'google_ads_id')?.value
    const googleAdsConversionLabel = settings.find((s: Setting) => s.key === 'google_ads_conversion_label')?.value
    const googleAdsRemarketingEnabled = settings.find((s: Setting) => s.key === 'google_ads_remarketing_enabled')?.value === 'true'

    console.log('Google Analytics Settings:', { 
      googleAnalyticsId, 
      googleTagManagerId, 
      googleAdsId, 
      googleAdsConversionLabel, 
      googleAdsRemarketingEnabled 
    })

    // Initialize Google Tag Manager if ID is provided
    if (googleTagManagerId && googleTagManagerId.trim()) {
      console.log('Initializing Google Tag Manager:', googleTagManagerId)
      
      // GTM script in head
      const gtmScript = document.createElement('script')
      gtmScript.async = true
      gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${googleTagManagerId}`
      document.head.appendChild(gtmScript)

      // GTM dataLayer initialization
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      })

      // GTM noscript iframe for body (fallback)
      const gtmNoscript = document.createElement('noscript')
      gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
      document.body.insertBefore(gtmNoscript, document.body.firstChild)
    }

    // Initialize Google Analytics 4 if ID is provided and GTM is not used
    if (googleAnalyticsId && googleAnalyticsId.trim() && !googleTagManagerId) {
      console.log('Initializing Google Analytics 4:', googleAnalyticsId)
      
      // GA4 gtag script
      const gtagScript = document.createElement('script')
      gtagScript.async = true
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`
      document.head.appendChild(gtagScript)

      // Initialize gtag function
      const gtag = initializeGtag()

      // Configure GA4
      gtag('js', new Date())
      gtag('config', googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href
      })
    }

    // Initialize Google Ads if ID is provided and GTM is not used
    if (googleAdsId && googleAdsId.trim() && !googleTagManagerId) {
      console.log('Initializing Google Ads:', googleAdsId)
      
      // Load gtag if not already loaded by GA4
      if (!window.gtag) {
        const gtagScript = document.createElement('script')
        gtagScript.async = true
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`
        document.head.appendChild(gtagScript)

        // Initialize gtag function
        initializeGtag()
      }

      // Configure Google Ads
      if (window.gtag) {
        window.gtag('js', new Date())
        window.gtag('config', googleAdsId)

        // Enable remarketing if configured
        if (googleAdsRemarketingEnabled) {
          window.gtag('config', googleAdsId, {
            allow_ad_personalization_signals: true,
            allow_google_signals: true
          })
        }
      }
    }

    // Provide gtag function to nuxt app
    nuxtApp.provide('gtag', window.gtag)

    // Helper function for tracking events
    const trackEvent = (eventName: string, parameters?: any) => {
      if (window.gtag) {
        window.gtag('event', eventName, parameters)
      }
      
      // Also push to dataLayer for GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: eventName,
          ...parameters
        })
      }
    }

    // Helper function for tracking conversions (Google Ads)
    const trackConversion = (conversionLabel?: string, conversionId?: string, value?: number) => {
      if (window.gtag) {
        const conversionData: any = {}
        
        if (value !== undefined) {
          conversionData.value = value
          conversionData.currency = 'VND'
        }
        
        // Use configured Google Ads ID and conversion label if not provided
        const adsId = conversionId || googleAdsId
        const label = conversionLabel || googleAdsConversionLabel
        
        if (adsId && label) {
          window.gtag('event', 'conversion', {
            send_to: `${adsId}/${label}`,
            ...conversionData
          })
          console.log('Google Ads conversion tracked:', `${adsId}/${label}`, conversionData)
        } else if (label) {
          // Generic conversion event
          window.gtag('event', 'conversion', {
            event_category: 'ecommerce',
            event_label: label,
            ...conversionData
          })
          console.log('Generic conversion tracked:', label, conversionData)
        }
      }
    }

    // Provide tracking functions to nuxt app
    nuxtApp.provide('trackEvent', trackEvent)
    nuxtApp.provide('trackConversion', trackConversion)

    console.log('Google Analytics plugin initialized successfully')
  } catch (error) {
    console.error('Error initializing Google Analytics:', error)
    
    // Fallback: Try to initialize GTM with hardcoded ID for testing
    console.log('Google Analytics plugin: Trying fallback GTM initialization...')
    try {
      const fallbackGtmId = 'GTM-T89X4CKH'
      console.log('Google Analytics plugin: Initializing fallback GTM:', fallbackGtmId)
      
      // GTM script in head
      const gtmScript = document.createElement('script')
      gtmScript.async = true
      gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${fallbackGtmId}`
      document.head.appendChild(gtmScript)

      // GTM dataLayer initialization
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      })

      // GTM noscript iframe for body (fallback)
      const gtmNoscript = document.createElement('noscript')
      gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${fallbackGtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
      document.body.insertBefore(gtmNoscript, document.body.firstChild)
      
      console.log('Google Analytics plugin: Fallback GTM initialized successfully')
    } catch (fallbackError) {
      console.error('Google Analytics plugin: Fallback initialization failed:', fallbackError)
    }
  }
}) 