import { defineNuxtPlugin } from '#app'
import ToastPlugin from 'vue-toast-notification'
// Sử dụng theme default thay vì sugar để tránh xung đột CSS
import 'vue-toast-notification/dist/theme-default.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Đăng ký plugin với các tùy chọn
  nuxtApp.vueApp.use(ToastPlugin, {
    position: 'top-right',
    duration: 5000,
    dismissible: true,
    pauseOnHover: true,
    queue: true
  })
}) 