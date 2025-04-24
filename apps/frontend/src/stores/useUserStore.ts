import { defineStore } from 'pinia';
import { useTrpc } from '@/composables/useTrpc';
import type { User } from '@/types/User';

interface State {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state: State) => !!state.user,
    userProfile: (state: State) => state.user?.profile,
    userEmail: (state: State) => state.user?.email,
    userName: (state: State) => state.user?.profile?.firstName || state.user?.email?.split('@')[0] || '',
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
      firstName?: string;
      lastName?: string;
      phoneCode?: string;
      phoneNumber?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
      };
    }) {
      const trpc = useTrpc();
      this.isLoading = true;
      this.error = null;

      try {
        const updatedUser = await trpc.profile.updateProfile.mutate(profileData);
        this.user = updatedUser;
        return updatedUser;
      } catch (err: any) {
        this.error = err?.message || 'Không thể cập nhật thông tin người dùng';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    setUser(user: User | null) {
      this.user = user;
    },

    clearUser() {
      this.user = null;
      this.error = null;
    },
  },
}); 