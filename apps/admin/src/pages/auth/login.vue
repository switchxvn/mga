<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth';

definePageMeta({
  layout: 'auth'
});

const { login } = useAuth();
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    await login({ email: email.value, password: password.value });
  } catch (err: any) {
    error.value = err.message || 'Failed to login';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
      Admin Login
    </h2>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            autocomplete="email"
            required
          />
        </UFormGroup>
      </div>

      <div>
        <UFormGroup label="Password" name="password">
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </UFormGroup>
      </div>

      <div v-if="error" class="text-red-500 text-sm text-center">
        {{ error }}
      </div>

      <div>
        <UButton
          type="submit"
          color="primary"
          block
          :loading="isLoading"
        >
          Sign In
        </UButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style> 