import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const start = Date.now()
  const { method, url } = event.node.req

  // Log request
  console.log(`[${new Date().toISOString()}] ${method} ${url} - Request started`)

  try {
    // Wait for the response
    await event.node.res.on('finish', () => {
      const duration = Date.now() - start
      const { statusCode } = event.node.res
      
      // Log response
      console.log(
        `[${new Date().toISOString()}] ${method} ${url} - Response: ${statusCode} (${duration}ms)`
      )
    })
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ${method} ${url} - Error:`,
      error
    )
  }
}) 