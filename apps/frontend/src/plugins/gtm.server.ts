export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on server side
  if (process.client) return

  console.log('GTM Server Plugin: Starting...')

  try {
    // Get tRPC instance
    const { $trpc } = nuxtApp
    if (!$trpc) {
      console.log('GTM Server Plugin: tRPC not available, using fallback')
      return
    }

    // Fetch GTM ID from database
    console.log('GTM Server Plugin: Fetching settings...')
    const settings = await ($trpc as any).settings.getPublicSettings.query()
    const gtmId = settings.find((s: any) => s.key === 'google_tag_manager_id')?.value

    console.log('GTM Server Plugin: GTM ID from database:', gtmId)

    if (gtmId && gtmId.trim()) {
      // Use useHead to inject GTM script in server-side rendering
      // The key attribute will prevent duplicates automatically
      useHead({
        script: [
          // Google Tag Manager
          {
            key: 'gtm-script', // Unique key prevents duplicates
            innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
          }
        ],
        noscript: [
          // Google Tag Manager (noscript)
          {
            key: 'gtm-noscript', // Unique key prevents duplicates
            innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
          }
        ]
      })

      console.log('GTM Server Plugin: GTM script injected with ID:', gtmId)
    } else {
      console.log('GTM Server Plugin: No GTM ID found in settings')
    }

  } catch (error) {
    console.error('GTM Server Plugin: Error:', error)
  }
}) 