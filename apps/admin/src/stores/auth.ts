import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(email: string, password: string) {
      try {
        // TODO: Implement actual login logic with API
        const mockUser = {
          id: '1',
          email,
          name: 'Admin User',
          role: 'admin'
        }
        const mockToken = 'mock-jwt-token'

        this.user = mockUser
        this.token = mockToken
        this.isAuthenticated = true

        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      // TODO: Clear any stored tokens or session data
    }
  }
}) 