export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on server side for SEO and initial load
  if (process.client) return

  try {
    // Get tRPC instance to fetch settings
    const { $trpc } = nuxtApp
    if (!$trpc) {
      console.warn('GTM Server Plugin: tRPC not available')
      return
    }

    // Fetch GTM ID from database
    const settings = await ($trpc as any).settings.getPublicSettings.query()
    const gtmId = settings.find((s: any) => s.key === 'google_tag_manager_id')?.value

    if (gtmId && gtmId.trim()) {
      // Store GTM ID in global state for use across the app
      const gtmState = useState('gtm-id', () => gtmId)
      
      // Also provide it via nuxtApp for immediate access
      nuxtApp.provide('gtmId', gtmId)

      
    } else {
      console.warn('GTM Server Plugin: No GTM ID found in settings')
    }

  } catch (error) {
    console.error('GTM Server Plugin: Error fetching GTM settings:', error)
  }
}) 