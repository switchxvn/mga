import { useUserStore } from '@/stores/useUserStore'

export const usePermissions = () => {
  const userStore = useUserStore()

  return {
    // Direct access to store getters
    isSuperAdmin: userStore.isSuperAdmin,
    isAdmin: userStore.isAdmin,
    
    // Permission checking methods
    hasPermission: (permission: string) => userStore.hasPermission(permission),
    hasAnyPermission: (permissions: string[]) => userStore.hasAnyPermission(permissions),
    hasAllPermissions: (permissions: string[]) => userStore.hasAllPermissions(permissions),
  }
} 