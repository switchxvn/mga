<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useTheme } from '../../composables/useTheme';
import { useRouter } from 'vue-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useSiteTitle } from '../../composables/useSiteTitle';

definePageMeta({
  layout: 'auth'
});

// Set page title with i18n support
useSiteTitle('authSignIn');

const { t } = useI18n();
const router = useRouter();
const { login } = useAuth();
const { theme, isDark, initializeTheme } = useTheme();
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const isThemeLoading = ref(true);
const error = ref<string | null>(null);
const showPassword = ref(false);

onBeforeMount(async () => {
  try {
    await initializeTheme();
  } catch (error) {
    console.error('Failed to initialize theme in login page (onBeforeMount):', error);
  }
});

onMounted(async () => {
  try {
    await initializeTheme();
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Failed to initialize theme in login page (onMounted):', error);
  } finally {
    isThemeLoading.value = false;
  }
});

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    await login({ 
      email: email.value, 
      password: password.value
    });
  } catch (err: any) {
    error.value = err.message || t('messages.failedToLogin');
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
    <div v-if="isThemeLoading" class="text-center p-4">
      <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('auth.loadingTheme') }}</p>
    </div>
    
    <div v-else>
      <h2 class="text-2xl font-bold text-center mb-2 text-red-500">
        {{ t('auth.signInToAdmin') }}
      </h2>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-8">
        {{ t('auth.enterCredentials') }}
      </p>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-1.5">
          <label for="email" class="block text-gray-700 dark:text-gray-200 text-base mb-1">{{ t('auth.email') }}</label>
          <div class="relative flex items-center">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail class="h-5 w-5 text-gray-400" :stroke-width="1.5" />
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              autocomplete="email"
              required
              class="w-full h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-shadow text-base pl-12 pr-4"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="password" class="block text-gray-700 dark:text-gray-200 text-base mb-1">{{ t('auth.password') }}</label>
          <div class="relative flex items-center">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock class="h-5 w-5 text-gray-400" :stroke-width="1.5" />
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              required
              class="w-full h-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-shadow text-base pl-12 pr-11"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button 
                type="button"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                @click="togglePassword"
              >
                <component :is="showPassword ? Eye : EyeOff" class="h-5 w-5" :stroke-width="1.5" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="inline-flex items-center">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="form-checkbox h-5 w-5 text-red-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-200">{{ t('auth.rememberMe') }}</span>
          </label>
          <button
            type="button"
            class="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium focus:outline-none focus:underline"
            @click="handleForgotPassword"
          >
            {{ t('auth.forgotPassword') }}
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
          <span :class="{ 'opacity-0': isLoading }">{{ t('auth.signIn') }}</span>
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
          {{ t('auth.dontHaveAccount') }}
          <button
            type="button"
            class="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium focus:outline-none focus:underline"
            @click="router.push('/auth/register')"
          >
            {{ t('auth.contactAdmin') }}
          </button>
        </p>
      </form>
    </div>
  </div>
</template>

<style>
.form-checkbox:checked {
  background-color: #ef4444;
  border-color: #ef4444;
}

.dark .form-checkbox:checked {
  background-color: #f87171;
  border-color: #f87171;
}
</style> 