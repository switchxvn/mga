import { useToast as useVueToast, TYPE } from 'vue-toastification'

interface ToastOptions {
  title: string
  description: string
  type?: TYPE
}

const toast = useVueToast()

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    toast(options.description, {
      type: options.type
    })
  }

  return {
    showToast
  }
} 