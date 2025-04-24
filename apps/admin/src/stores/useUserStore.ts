import { defineStore } from 'pinia';
import { useTrpc } from '@/composables/useTrpc';
import type { ProfileResponse } from '@ew/shared';
interface State {
  user: ProfileResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('admin-user', {
  state: (): State => ({
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state: State) => !!state.user,
    userEmail: (state: State) => state.user?.email,
    userRoles: (state: State) => state.user?.roles,
    userId: (state: State) => state.user?.id,
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

    async updateProfile(profileData: {
      email?: string;
      role?: string;
      isActive?: boolean;
    }) {
      const trpc = useTrpc();
      this.isLoading = true;
      this.error = null;

      try {
        // Since we don't have updateProfile, we'll need to implement this endpoint in the backend first
        throw new Error('Update profile endpoint not implemented yet');
      } catch (err: any) {
        this.error = err?.message || 'Không thể cập nhật thông tin người dùng';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    setUser(user: AdminUser | null) {
      this.user = user;
    },

    clearUser() {
      this.user = null;
      this.error = null;
    },
  },
}); 