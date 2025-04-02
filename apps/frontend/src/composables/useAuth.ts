// Auto-imported by Nuxt 3;
import { useRouter } from 'vue-router';
import { TRPCClientError } from '@trpc/client';
import { useTrpc } from './useTrpc';
import { ref } from './useVueComposables';
import type { User, UserProfile, AuthLoginResponse } from '../types/User';
import { useCookie } from 'nuxt/app';

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
  const tokenCookie = useCookie('token', {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const result = await trpc.auth.login.mutate(credentials) as AuthLoginResponse;
      
      if (result.accessToken) {
        // Set token in cookie
        tokenCookie.value = result.accessToken;
        
        // Set user data in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Call me API to get full user data
        const meData = await trpc.profile.getMyProfile.query() as UserProfile;
        console.log('Profile API response:', meData);
        
        user.value = {
          id: result.user.id,
          email: result.user.email,
          username: result.user.email.split('@')[0],
          isActive: true,
          isEmailVerified: false,
          lastLoginAt: new Date().toISOString(),
          posts: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: meData
        };
        
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
      
      // Remove token from cookie
      tokenCookie.value = null;
      
      // Remove user data from localStorage
      if (typeof window !== 'undefined') {
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
      
      const token = tokenCookie.value;
      if (!token) {
        user.value = null;
        return false;
      }

      try {
        const currentUser = await trpc.profile.getMyProfile.query() as UserProfile;
        console.log('Profile API response in checkAuth:', currentUser);
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          user.value = {
            id: parsedUser.id,
            email: parsedUser.email,
            username: parsedUser.email.split('@')[0],
            isActive: true,
            isEmailVerified: false,
            lastLoginAt: new Date().toISOString(),
            posts: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profile: currentUser
          };
        }
        return true;
      } catch (error) {
        // Nếu token không hợp lệ hoặc hết hạn
        tokenCookie.value = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        user.value = null;
        return false;
      }
    } catch (e) {
      user.value = null;
      tokenCookie.value = null;
      if (typeof window !== 'undefined') {
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