<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRouter } from 'vue-router';
import { useTrpc } from '../composables/useTrpc';
import { ref } from '../composables/useVueComposables';

const router = useRouter();
const trpc = useTrpc();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

async function handleLogin() {
  try {
    if (!email.value || !password.value) {
      error.value = 'Vui lòng nhập email và mật khẩu';
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    // Gọi tRPC endpoint để đăng nhập
    const result = await trpc.auth.login.mutate({
      email: email.value,
      password: password.value,
    });
    
    // Lưu token vào localStorage
    if (result.tokenData) {
      localStorage.setItem('token', result.tokenData.sub);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Chuyển hướng đến trang chủ
      router.push('/');
    } else {
      throw new Error('Không nhận được token từ server');
    }
  } catch (err: any) {
    console.error('Login failed:', err);
    error.value = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập
        </h2>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Mật khẩu"
            />
          </div>
        </div>

        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </button>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Chưa có tài khoản? 
            <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
              Đăng ký
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template> 