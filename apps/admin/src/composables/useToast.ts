import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export const useToast = () => {
  const addToast = (message: string, type: Toast['type'], duration = 3000) => {
    const id = nextId++
    const toast: Toast = {
      id,
      message,
      type,
      duration
    }
    toasts.value.push(toast)
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }
  
  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const success = (message: string, duration = 3000) => {
    return addToast(message, 'success', duration)
  }
  
  const error = (message: string, duration = 3000) => {
    return addToast(message, 'error', duration)
  }
  
  const info = (message: string, duration = 3000) => {
    return addToast(message, 'info', duration)
  }
  
  const warning = (message: string, duration = 3000) => {
    return addToast(message, 'warning', duration)
  }
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
} 