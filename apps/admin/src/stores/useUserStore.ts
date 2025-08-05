import { defineStore } from 'pinia';
import { useTrpc } from '@/composables/useTrpc';
import type { ProfileResponse } from '@ew/shared';
import type { User } from '@/types/user';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('admin-user', {
  state: (): UserState => ({
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Authentication
    isAuthenticated: (state): boolean => !!state.user,
    
    // User info
    userEmail: (state): string => state.user?.email || '',
    userName: (state): string => state.user?.name || '',
    userRole: (state): string => state.user?.role || '',
    userRoles: (state): any[] => state.user?.roles || [],
    userPermissions: (state): string[] => state.user?.permissions || [],
    userId: (state): string => state.user?.id || '',
    
    // Profile
    userProfile: (state) => state.user?.profile,
    displayName: (state): string => {
      if (!state.user) return 'User'
      if (state.user.profile?.firstName) return state.user.profile.firstName
      return state.user.email?.split('@')[0] || 'User'
    },
    avatarInitial: (state): string => {
      if (!state.user) return 'U'
      if (state.user.profile?.firstName) return state.user.profile.firstName[0].toUpperCase()
      if (state.user.email) return state.user.email[0].toUpperCase()
      return 'U'
    },
    
    // Permissions
    isSuperAdmin: (state): boolean => {
      if (!state.user) return false
      
      // Check from role field
      const fromRole = state.user.role === 'SUPER_ADMIN'
      
      // Check from roles array
      let fromRoles = false
      if (state.user.roles && Array.isArray(state.user.roles)) {
        fromRoles = state.user.roles.some(role => 
          (typeof role === 'string' && role === 'SUPER_ADMIN') || 
          (typeof role === 'object' && role !== null && 'code' in role && role.code === 'SUPER_ADMIN')
        )
      }
      
      // Check from permissions
      const fromPermissions = state.user.permissions?.includes('SUPER_ADMIN') || false
      
      return fromRole || fromRoles || fromPermissions
    },
    
    isAdmin: (state): boolean => {
      if (!state.user) return false
      
      // SUPER_ADMIN is also admin
      const isSuperAdmin = state.user.role === 'SUPER_ADMIN' || 
        state.user.roles?.some(role => 
          (typeof role === 'string' && role === 'SUPER_ADMIN') || 
          (typeof role === 'object' && role !== null && 'code' in role && role.code === 'SUPER_ADMIN')
        )
      
      if (isSuperAdmin) return true
      
      // Check for ADMIN role
      const fromRole = state.user.role === 'ADMIN'
      let fromRoles = false
      if (state.user.roles && Array.isArray(state.user.roles)) {
        fromRoles = state.user.roles.some(role => 
          (typeof role === 'string' && role === 'ADMIN') || 
          (typeof role === 'object' && role !== null && 'code' in role && role.code === 'ADMIN')
        )
      }
      
      return fromRole || fromRoles
    }
  },

  actions: {
    async fetchUser() {
      const trpc = useTrpc();
      this.isLoading = true;
      this.error = null;

      try {
        const userInfo = await trpc.profile.getMyProfile.query();
        this.user = userInfo;
        return userInfo;
      } catch (err: any) {
        this.error = err?.message || 'Không thể tải thông tin người dùng';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },



    setUser(user: User | null) {
      this.user = user;
      this.error = null;
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    clearUser() {
      this.user = null;
      this.error = null;
    },

    // Helper method to check specific permission
    hasPermission(permission: string): boolean {
      if (!this.user) return false;
      if (this.isSuperAdmin) return true;
      return this.user.permissions?.includes(permission) || false;
    },

    // Helper method to check any of the permissions
    hasAnyPermission(permissions: string[]): boolean {
      if (!this.user) return false;
      if (this.isSuperAdmin) return true;
      if (!permissions.length) return true;
      return permissions.some(permission => this.user?.permissions?.includes(permission));
    },

    // Helper method to check all permissions
    hasAllPermissions(permissions: string[]): boolean {
      if (!this.user) return false;
      if (this.isSuperAdmin) return true;
      if (!permissions.length) return true;
      return permissions.every(permission => this.user?.permissions?.includes(permission));
    }
  },
}); 