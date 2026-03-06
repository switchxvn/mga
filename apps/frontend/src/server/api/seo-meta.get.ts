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

    // Use Nitro internal request to avoid SSR env/network mismatches.
    const tRpcData = await event.$fetch('/api/trpc/seo.getSeoByPath', {
      query: {
        batch: '1',
        input: JSON.stringify({ 0: path }),
      },
    })

    if (Array.isArray(tRpcData)) {
      const seoData = tRpcData?.[0]?.result?.data

      return {
        success: true,
        data: seoData || null
      }
    }

    return {
      success: false,
      data: null,
      error: 'Unexpected tRPC response format'
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
