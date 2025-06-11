export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on server side
  if (process.client) return

  console.log('GTM Server Plugin: Starting with hardcoded GTM ID...')

  // Hardcoded GTM ID as requested
  const gtmId = 'GTM-T89X4CKH'

  try {
    // Use useHead to inject GTM script in server-side rendering
    useHead({
      script: [
        // Google Tag Manager
        {
          key: 'gtm-script',
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
          key: 'gtm-noscript',
          innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
        }
      ]
    })

    console.log('GTM Server Plugin: GTM script injected with hardcoded ID:', gtmId)

  } catch (error) {
    console.error('GTM Server Plugin: Error:', error)
  }
}) 