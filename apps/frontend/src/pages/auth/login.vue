<script setup lang="ts">
// Auto-imported by Nuxt 3;
import FormInput from '@/components/ui/form/FormInput.vue';
import { useAuth, type LoginCredentials } from '@/composables/useAuth';

definePageMeta({
  layout: 'auth',
});

const { login, isLoading, error } = useAuth();

const credentials = ref<LoginCredentials>({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  await login(credentials.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormInput
      v-model="credentials.email"
      label="Email"
      type="email"
      placeholder="Enter your email"
      required
    />
    <FormInput
      v-model="credentials.password"
      label="Password"
      type="password"
      placeholder="Enter your password"
      required
    />
    <div v-if="error" class="text-sm text-destructive">
      {{ error }}
    </div>
    <button
      type="submit"
      class="form-button primary w-full h-10"
      :disabled="isLoading"
    >
      {{ isLoading ? 'Signing in...' : 'Sign in' }}
    </button>
    <div class="text-center text-sm">
      <span class="text-muted-foreground">Don't have an account?</span>
      <a href="/auth/register" class="ml-1 text-primary hover:underline">
        Sign up
      </a>
    </div>
  </form>
</template> 