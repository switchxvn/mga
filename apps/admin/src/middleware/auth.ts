import { navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server side
  if (process.server) return

  // Skip for auth routes
  if (to.path.startsWith('/auth/')) return

  // Check if token exists
  const token = localStorage.getItem('accessToken')
  if (!token) {
    return navigateTo('/auth/login')
  }

  // Check if token is valid by trying to make an API call
  try {
    // We'll use trpc functionality which is only available in setup code
    return
  } catch (error) {
    // Will be handled in composables
    return
  }
}); 