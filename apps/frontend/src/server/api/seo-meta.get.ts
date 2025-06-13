export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const path = query.path as string

    if (!path) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Path parameter is required'
      })
    }

    const config = useRuntimeConfig()
    
    // Make direct HTTP request to tRPC endpoint
    const tRpcUrl = `${config.public.apiBase}/api/trpc/seo.getSeoByPath?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: path }))}`
    
    const response = await fetch(tRpcUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (response.ok) {
      const tRpcData = await response.json()
      const seoData = tRpcData?.[0]?.result?.data

      return {
        success: true,
        data: seoData
      }
    }

    return {
      success: false,
      data: null,
      error: 'Failed to fetch from tRPC'
    }

  } catch (error) {
    console.error('[SEO API] Error fetching SEO data:', error)
    
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}) 