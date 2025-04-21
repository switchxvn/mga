interface ToastOptions {
  title: string
  description: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    const { toast } = useNuxtApp()
    toast.add({
      title: options.title,
      description: options.description,
      color: options.type
    })
  }

  return {
    showToast
  }
} 