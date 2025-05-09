import { TRPCClientError } from '@trpc/client'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ProfileResponseExtended, User } from '../types/user'
import { useTrpc } from './useTrpc'

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
        const userInfo = await trpc.profile.getMyProfile.query() as ProfileResponseExtended;
        
        // Kiểm tra và log thông tin userInfo để debug
        console.log('User info from login:', JSON.stringify(userInfo, null, 2));
        
        // Xác định role từ API response
        let userRole = 'user'; // Mặc định là user
        
        // Kiểm tra roles từ API
        if (userInfo.roles && Array.isArray(userInfo.roles)) {
          // Nếu có SUPER_ADMIN trong danh sách roles, set role là SUPER_ADMIN
          if (userInfo.roles.some(role => 
            (typeof role === 'string' && role === 'SUPER_ADMIN') || 
            (typeof role === 'object' && role && 'code' in role && role.code === 'SUPER_ADMIN')
          )) {
            userRole = 'SUPER_ADMIN';
          } 
          // Nếu có ADMIN trong danh sách roles, set role là ADMIN
          else if (userInfo.roles.some(role => 
            (typeof role === 'string' && role === 'ADMIN') || 
            (typeof role === 'object' && role && 'code' in role && role.code === 'ADMIN')
          )) {
            userRole = 'ADMIN';
          }
        }
        
        user.value = {
          id: String(userInfo.id),
          email: userInfo.email,
          name: userInfo.profile?.firstName || 'Unknown',
          role: userRole, // Set role based on API response
          permissions: userInfo.permissions?.map(p => p.code) || [],
          roles: userInfo.roles || [], // Lưu trữ roles từ API
          profile: userInfo.profile || null, // Lưu profile thông tin
          createdAt: userInfo.createdAt instanceof Date ? userInfo.createdAt.toISOString() : String(userInfo.createdAt),
          updatedAt: userInfo.updatedAt instanceof Date ? userInfo.updatedAt.toISOString() : String(userInfo.updatedAt)
        }

        console.log('User role set to:', userRole);
        console.log('User permissions:', user.value.permissions);

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
        const userInfo = await trpc.profile.getMyProfile.query() as ProfileResponseExtended;
        console.log('Profile response:', userInfo);
        
        // If we got a successful response
        if (userInfo?.id) {
          // Xác định role từ API response
          let userRole = 'user'; // Mặc định là user
          
          // Kiểm tra roles từ API
          if (userInfo.roles && Array.isArray(userInfo.roles)) {
            // Nếu có SUPER_ADMIN trong danh sách roles, set role là SUPER_ADMIN
            if (userInfo.roles.some(role => 
              (typeof role === 'string' && role === 'SUPER_ADMIN') || 
              (typeof role === 'object' && role && 'code' in role && role.code === 'SUPER_ADMIN')
            )) {
              userRole = 'SUPER_ADMIN';
            } 
            // Nếu có ADMIN trong danh sách roles, set role là ADMIN
            else if (userInfo.roles.some(role => 
              (typeof role === 'string' && role === 'ADMIN') || 
              (typeof role === 'object' && role && 'code' in role && role.code === 'ADMIN')
            )) {
              userRole = 'ADMIN';
            }
          }
          
          user.value = {
            id: String(userInfo.id),
            email: userInfo.email,
            name: userInfo.email.split('@')[0], // Use email as name if no profile
            role: userRole, // Use actual role instead of hardcoded 'admin'
            permissions: userInfo.permissions?.map(p => p.code) || [],
            roles: userInfo.roles || [], // Lưu trữ roles từ API
            profile: userInfo.profile || null, // Lưu profile thông tin
            createdAt: userInfo.createdAt instanceof Date ? userInfo.createdAt.toISOString() : String(userInfo.createdAt),
            updatedAt: userInfo.updatedAt instanceof Date ? userInfo.updatedAt.toISOString() : String(userInfo.updatedAt)
          };
          console.log('Auth check successful, user role:', userRole);
          return true;
        }
        console.log('No user ID in response');
        return false;
      } catch (profileError: any) {
        console.error('Error fetching profile:', profileError);
        
        // Handle token expired error
        const errorMessage = profileError?.message || '';
        const isAuthError = profileError instanceof TRPCClientError && 
                           (errorMessage.includes('unauthorized') || 
                            errorMessage.includes('unauthenticated') ||
                            errorMessage.includes('expired'));
                           
        if (isAuthError) {
          // Clear invalid token
          console.log('Auth error detected, removing token and redirecting to login');
          storage.removeItem('accessToken');
          user.value = null;
          
          // Redirect to login page if not already there
          if (process.client && window.location.pathname !== '/auth/login') {
            router.push('/auth/login');
          }
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