import { ref, watch } from 'vue'
import { usePermissions } from './usePermissions'
import { useUserStore } from '@/stores/useUserStore'
import { navigateTo } from 'nuxt/app'

export const usePagePermissions = (requiredPermissions: string[], fallbackRoute = '/settings') => {
  const { isSuperAdmin, hasPermission, hasAnyPermission } = usePermissions()
  const userStore = useUserStore()
  
  // Permission checking state
  const isLoadingPermissions = ref(true)
  const hasPermissionAccess = ref(false)
  
  // Check if user has required permissions
  const checkPermissions = () => {
    if (isSuperAdmin.value) {
      return true
    }
    
    if (requiredPermissions.length === 1) {
      return hasPermission(requiredPermissions[0])
    }
    
    return hasAnyPermission(requiredPermissions)
  }
  
  // Watch for user data changes and check permissions
  watch(() => userStore.user, (user) => {
    if (user) {
      // Check permissions once user data is available
      hasPermissionAccess.value = checkPermissions()
      isLoadingPermissions.value = false
      
      if (!hasPermissionAccess.value) {
        console.log('User does not have required permissions:', requiredPermissions)
        navigateTo(fallbackRoute)
      }
    }
  }, { immediate: true })
  
  // Also check if user store is not loading
  watch(() => userStore.isLoading, (loading) => {
    if (!loading && !userStore.user) {
      // User finished loading but no user data - redirect to login
      navigateTo('/auth/login')
    }
  })
  
  // Ensure user data is loaded
  const ensureUserData = async () => {
    if (!userStore.user && !userStore.isLoading) {
      try {
        await userStore.fetchUser()
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
  }
  
  return {
    isLoadingPermissions,
    hasPermissionAccess,
    ensureUserData,
    checkPermissions
  }
} 