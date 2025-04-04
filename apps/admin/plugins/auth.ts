export default defineNuxtPlugin(async () => {
  const { checkAuth, isAuthenticated } = useAuth()
  const route = useRoute()

  // Kiểm tra authentication khi plugin được load
  await checkAuth()

  // Watch route changes để kiểm tra authentication
  watch(
    () => route.path,
    async (path) => {
      const publicRoutes = ['/login', '/register']
      
      if (!publicRoutes.includes(path) && !isAuthenticated.value) {
        navigateTo('/login')
      }
      
      if (publicRoutes.includes(path) && isAuthenticated.value) {
        navigateTo('/')
      }
    },
    { immediate: true }
  )
}) 