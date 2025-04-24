import { defineNuxtPlugin } from '#app'
import ToastPlugin from 'vue-toast-notification'
// Sử dụng theme sugar để tránh xung đột CSS
import 'vue-toast-notification/dist/theme-sugar.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Đăng ký plugin với các tùy chọn
  nuxtApp.vueApp.use(ToastPlugin, {
    position: 'top-right',
    duration: 3000,
    dismissible: true,
    pauseOnHover: true,
  })
}) 