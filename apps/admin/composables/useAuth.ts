import { ref } from 'vue'

export const useAuth = () => {
  const user = useState('auth.user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const token = useCookie('auth.token')

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })

      if (error.value) throw error.value

      if (data.value?.token) {
        token.value = data.value.token
        user.value = data.value.user
        return true
      }
      return false
    } catch (err) {
      console.error('Login error:', err)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    navigateTo('/login')
  }

  const checkAuth = async () => {
    try {
      if (!token.value) return false

      const { data } = await useFetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (data.value) {
        user.value = data.value
        return true
      }
      return false
    } catch (err) {
      console.error('Check auth error:', err)
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    token,
    login,
    logout,
    checkAuth
  }
} 