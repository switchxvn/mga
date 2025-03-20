// Auto-imported by Nuxt 3;
import { useRouter } from 'vue-router';
import { TRPCClientError } from '@trpc/client';
import { useTrpc } from './useTrpc';
import { ref } from './useVueComposables';
import type { User } from '../types/User';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export function useAuth() {
  const router = useRouter();
  const trpc = useTrpc();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const user = ref<User | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const result = await trpc.auth.login.mutate(credentials);
      
      if (result.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', result.accessToken);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        user.value = result.user;
        await router.push('/');
      } else {
        throw new Error('Không nhận được token từ server');
      }
    } catch (e) {
      if (e instanceof TRPCClientError) {
        error.value = e.message;
      } else if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = 'Đã xảy ra lỗi không xác định';
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
      
      if (result.user) {
        // Đăng ký thành công, chuyển hướng đến trang đăng nhập
        await router.push('/login');
      } else {
        throw new Error('Đăng ký không thành công');
      }
    } catch (e) {
      if (e instanceof TRPCClientError) {
        error.value = e.message;
      } else if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = 'Đã xảy ra lỗi không xác định';
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
        localStorage.removeItem('user');
      }
      user.value = null;
      await router.push('/login');
    } catch (e) {
      if (e instanceof TRPCClientError) {
        error.value = e.message;
      } else if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = 'Đã xảy ra lỗi không xác định';
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

      try {
        const currentUser = await trpc.auth.me.query();
        user.value = currentUser;
        return true;
      } catch (error) {
        // Nếu token không hợp lệ hoặc hết hạn
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        user.value = null;
        return false;
      }
    } catch (e) {
      user.value = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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