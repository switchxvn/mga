import { useUserSession } from '~/composables/useUserSession'

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()

 
}) 