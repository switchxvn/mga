export const useError = () => {
  const error = useState('error', () => null)
  const toast = useToast()

  const handleError = (err: any) => {
    if (err?.statusCode === 401) {
      const { logout } = useAuth()
      logout()
      toast.add({
        title: 'Unauthorized',
        description: err.message || 'Please login again',
        color: 'red'
      })
      return
    }

    if (err?.statusCode === 400) {
      toast.add({
        title: 'Validation Error',
        description: err.message,
        color: 'orange'
      })
      return
    }

    // Handle other errors
    toast.add({
      title: 'Error',
      description: err?.message || 'An unexpected error occurred',
      color: 'red'
    })
    
    error.value = err
  }

  const clearError = () => {
    error.value = null
  }

  return {
    error,
    handleError,
    clearError
  }
} 