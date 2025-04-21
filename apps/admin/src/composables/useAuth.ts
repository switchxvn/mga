import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TRPCClientError } from '@trpc/client'
import { useTrpc } from './useTrpc'
import type { User, UserProfile } from '../types/User'

export interface LoginCredentials {
  email: string
  password: string
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
        localStorage.setItem('accessToken', result.accessToken)
        
        // Get user info
        const userInfo = await trpc.profile.getMyProfile.query()
        user.value = userInfo

        // Redirect to dashboard
        router.push('/dashboard')
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
      localStorage.removeItem('accessToken')
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
      isLoading.value = true
      error.value = null

      const token = localStorage.getItem('accessToken')
      console.log('token', token);
      if (!token) {
        throw new Error('No token found')
      }

      // Get user info
      const userInfo = await trpc.profile.getMyProfile.query()
      user.value = userInfo

      return true
    } catch (err) {
      localStorage.removeItem('accessToken')
      user.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

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