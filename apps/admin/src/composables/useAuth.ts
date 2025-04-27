import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TRPCClientError } from '@trpc/client'
import { useTrpc } from './useTrpc'
import type { User } from '../types/user'

export interface LoginCredentials {
  email: string
  password: string
}

const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage
  }
  return null
}

export const useAuth = () => {
  const router = useRouter()
  const trpc = useTrpc()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const user = ref<User | null>(null)

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null

      const result = await trpc.auth.login.mutate(credentials)
      
      if (result.accessToken) {
        // Save token to localStorage
        const storage = getLocalStorage()
        if (storage) {
          storage.setItem('accessToken', result.accessToken)
        }
        
        // Get user info and transform to match User interface
        const userInfo = await trpc.profile.getMyProfile.query()
        user.value = {
          id: String(userInfo.id),
          email: userInfo.email,
          name: userInfo.profile?.firstName || 'Unknown',
          role: 'admin', // Set appropriate role based on your auth logic
          permissions: userInfo.permissions?.map(p => p.code) || [],
          createdAt: userInfo.createdAt,
          updatedAt: userInfo.updatedAt
        }

        // Redirect to dashboard
        router.push('/')
      }
    } catch (err: any) {
      if (err instanceof TRPCClientError) {
        error.value = err.message
      } else {
        error.value = 'An error occurred during login'
      }
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      await trpc.auth.logout.mutate()
      
      // Clear token and user info
      const storage = getLocalStorage()
      if (storage) {
        storage.removeItem('accessToken')
      }
      user.value = null

      // Redirect to login
      router.push('/auth/login')
    } catch (err: any) {
      error.value = 'An error occurred during logout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Wait for window to be defined
      await new Promise(resolve => setTimeout(resolve, 0));

      const storage = getLocalStorage();
      if (!storage) {
        console.log('No storage available');
        return false;
      }

      const token = storage.getItem('accessToken');
      console.log('Found token:', !!token);
      
      if (!token) {
        return false;
      }

      try {
        console.log('Fetching profile...');
        // Get user info and transform to match User interface
        const userInfo = await trpc.profile.getMyProfile.query();
        console.log('Profile response:', userInfo);
        
        // If we got a successful response
        if (userInfo?.id) {
          user.value = {
            id: String(userInfo.id),
            email: userInfo.email,
            name: userInfo.email.split('@')[0], // Use email as name if no profile
            role: 'admin',
            permissions: [], // We'll handle permissions later if needed
            createdAt: userInfo.createdAt || new Date().toISOString(),
            updatedAt: userInfo.updatedAt || new Date().toISOString()
          };
          console.log('Auth check successful');
          return true;
        }
        console.log('No user ID in response');
        return false;
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // Only remove token if it's an authentication error
        if (profileError instanceof TRPCClientError && 
            (profileError.message.includes('unauthorized') || 
             profileError.message.includes('unauthenticated'))) {
          storage.removeItem('accessToken');
          user.value = null;
        }
        return false;
      }
    } catch (err) {
      console.error('Auth check error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const getUser = () => {
    return user.value
  }

  return {
    login,
    logout,
    checkAuth,
    getUser,
    isLoading,
    error,
    user,
  }
} 