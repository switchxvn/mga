// Auto-imported by Nuxt 3;
import { useRouter } from 'vue-router';
import { TRPCClientError } from '@trpc/client';
import { trpc } from '@/utils/trpc';
import { ref } from 'vue';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export function useAuth() {
  const router = useRouter();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const user = ref(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const result = await trpc.auth.login.mutate(credentials);
      
      if (result.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', result.token);
        }
        user.value = result.user;
        await router.push('/dashboard');
      }
    } catch (e) {
      if (e instanceof TRPCClientError) {
        error.value = e.message;
      } else {
        error.value = 'An unexpected error occurred';
      }
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const result = await trpc.auth.register.mutate(credentials);
      
      if (result.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', result.token);
        }
        user.value = result.user;
        await router.push('/dashboard');
      }
    } catch (e) {
      if (e instanceof TRPCClientError) {
        error.value = e.message;
      } else {
        error.value = 'An unexpected error occurred';
      }
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      await trpc.auth.logout.mutate();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      user.value = null;
      await router.push('/auth/login');
    } catch (e) {
      if (e instanceof TRPCClientError) {
        error.value = e.message;
      } else {
        error.value = 'An unexpected error occurred';
      }
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        user.value = null;
        return false;
      }

      const currentUser = await trpc.auth.me.query();
      user.value = currentUser;
      return true;
    } catch (e) {
      user.value = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      return false;
    }
  };

  return {
    login,
    register,
    logout,
    checkAuth,
    isLoading,
    error,
    user,
  };
} 