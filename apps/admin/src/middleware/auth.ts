export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Allow access to login page
  if (to.path === '/auth/login') {
    return
  }

  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
}) 