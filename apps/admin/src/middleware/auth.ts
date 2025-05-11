import { navigateTo } from 'nuxt/app'
import { useTheme } from '../composables/useTheme'
import type { RouteLocationNormalized } from 'vue-router'

// @ts-ignore - Nuxt runtime type
export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip middleware on server side
  if (process.server) return

  // Skip for auth routes
  if (to.path.startsWith('/auth/')) return

  // Check if token exists
  const token = localStorage.getItem('accessToken')
  if (!token) {
    // Đảm bảo theme được khởi tạo trước khi chuyển hướng
    if (process.client) {
      try {
        const { initializeTheme } = useTheme()
        // Đảm bảo theme được khởi tạo hoàn toàn
        await initializeTheme()
        // Thêm một khoảng thời gian nhỏ để đảm bảo CSS được áp dụng
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Failed to initialize theme before redirect:', error)
      }
    }
    
    // Sử dụng external: true để đảm bảo tải lại trang hoàn toàn và chuyển đổi layout
    // Kết hợp replace: true để tránh lịch sử trình duyệt
    return navigateTo('/auth/login', { replace: true, external: true })
  }

  // Check if token is valid by trying to make an API call
  try {
    // We'll use trpc functionality which is only available in setup code
    return
  } catch (error) {
    // Will be handled in composables
    return
  }
}) 