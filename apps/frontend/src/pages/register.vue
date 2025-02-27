<script setup lang="ts">
// Auto-imported by Nuxt 3;
import { useRouter } from 'vue-router';
import { useTrpc } from '../composables/useTrpc';
import { ref } from '../composables/useVueComposables';

const router = useRouter();
const trpc = useTrpc();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

async function handleRegister() {
  try {
    // Validate form
    if (!name.value || !email.value || !password.value) {
      error.value = 'Vui lòng điền đầy đủ thông tin';
      return;
    }
    
    if (password.value !== confirmPassword.value) {
      error.value = 'Mật khẩu xác nhận không khớp';
      return;
    }
    
    if (password.value.length < 6) {
      error.value = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    // Gọi tRPC endpoint để đăng ký
    const result = await trpc.auth.register.mutate({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    
    // Hiển thị thông báo thành công và chuyển hướng đến trang đăng nhập
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    router.push('/login');
  } catch (err: any) {
    console.error('Registration failed:', err);
    error.value = err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
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
          Đăng ký tài khoản
        </h2>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="name" class="sr-only">Họ tên</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              v-model="name"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Họ tên"
            />
          </div>
          <div>
            <label for="email-address" class="sr-only">Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Mật khẩu"
            />
          </div>
          <div>
            <label for="confirm-password" class="sr-only">Xác nhận mật khẩu</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              v-model="confirmPassword"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Xác nhận mật khẩu"
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
            {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Đã có tài khoản? 
            <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Đăng nhập
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template> 