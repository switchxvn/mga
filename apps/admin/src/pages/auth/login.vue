<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useTheme } from '../../composables/useTheme';
import { useRouter } from 'vue-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth'
});

const router = useRouter();
const { login } = useAuth();
const { theme, isDark } = useTheme();
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const showPassword = ref(false);

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    await login({ 
      email: email.value, 
      password: password.value
    });
  } catch (err: any) {
    error.value = err.message || 'Failed to login';
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = () => {
  router.push('/auth/forgot-password');
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="w-full max-w-[420px]">
    <h2 class="text-2xl font-bold text-center mb-2 text-red-500">
      Sign In to Admin
    </h2>
    <p class="text-center text-gray-600 dark:text-gray-400 mb-8">
      Enter your credentials to access your account
    </p>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div class="space-y-1.5">
        <label for="email" class="block text-gray-700 dark:text-gray-200 text-base mb-1">Email</label>
        <div class="relative flex items-center">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail class="h-5 w-5 text-gray-400" strokeWidth={1.5} />
          </div>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            autocomplete="email"
            required
            class="w-full h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-shadow text-base [padding-left:45px_!important] [padding-right:1rem_!important]"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label for="password" class="block text-gray-700 dark:text-gray-200 text-base mb-1">Password</label>
        <div class="relative flex items-center">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock class="h-5 w-5 text-gray-400" strokeWidth={1.5} />
          </div>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            class="w-full h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-shadow text-base [padding-left:45px_!important] [padding-right:2.75rem_!important]"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button 
              type="button"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              @click="togglePassword"
            >
              <component :is="showPassword ? Eye : EyeOff" class="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <label class="inline-flex items-center">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="form-checkbox h-5 w-5 text-primary-500 dark:text-primary-400 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          />
          <span class="ml-2 text-gray-700 dark:text-gray-200">Remember me</span>
        </label>
        <button
          type="button"
          class="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium focus:outline-none focus:underline"
          @click="handleForgotPassword"
        >
          Forgot password?
        </button>
      </div>

      <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg text-center">
        <p class="text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors relative"
      >
        <span :class="{ 'opacity-0': isLoading }">Sign In</span>
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </button>

      <p class="text-center text-gray-600 dark:text-gray-400">
        Don't have an account? 
        <button
          type="button"
          class="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium focus:outline-none focus:underline"
          @click="router.push('/auth/register')"
        >
          Contact administrator
        </button>
      </p>
    </form>
  </div>
</template>

<style>
.form-checkbox:checked {
  background-color: var(--primary-500);
  border-color: var(--primary-500);
}

.dark .form-checkbox:checked {
  background-color: var(--primary-400);
  border-color: var(--primary-400);
}
</style> 