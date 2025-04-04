<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  loading: false,
  error: ''
})

async function handleLogin() {
  if (!form.email || !form.password) {
    form.error = 'Please fill in all fields'
    return
  }

  form.loading = true
  form.error = ''

  try {
    const success = await authStore.login(form.email, form.password)
    if (success) {
      router.push('/')
    } else {
      form.error = 'Invalid credentials'
    }
  } catch (error) {
    form.error = 'An error occurred during login'
  } finally {
    form.loading = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md p-8">
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Admin Login
        </h1>
      </template>

      <form @submit.prevent="handleLogin">
        <div class="space-y-4">
          <UFormGroup label="Email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="admin@example.com"
              autocomplete="email"
            />
          </UFormGroup>

          <UFormGroup label="Password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </UFormGroup>

          <p
            v-if="form.error"
            class="text-red-500 text-sm"
          >
            {{ form.error }}
          </p>

          <UButton
            type="submit"
            block
            :loading="form.loading"
          >
            Sign In
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style> 