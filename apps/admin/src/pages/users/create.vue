<template>
  <div class="container mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Tạo người dùng mới</h1>
      <NuxtLink 
        to="/users" 
        class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
      >
        Quay lại
      </NuxtLink>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <form @submit.prevent="createUser">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Email -->
          <div class="col-span-1 md:col-span-2">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Nhập email người dùng"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': validationErrors.email }"
            />
            <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
              {{ validationErrors.email }}
            </p>
          </div>

          <!-- Username -->
          <div class="col-span-1">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Tên người dùng
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Nhập tên người dùng"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': validationErrors.username }"
            />
            <p v-if="validationErrors.username" class="mt-1 text-sm text-red-600">
              {{ validationErrors.username }}
            </p>
          </div>

          <!-- Password -->
          <div class="col-span-1">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Nhập mật khẩu"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': validationErrors.password }"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600">
              {{ validationErrors.password }}
            </p>
          </div>

          <!-- First Name -->
          <div class="col-span-1">
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              Tên
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              placeholder="Nhập tên"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Last Name -->
          <div class="col-span-1">
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              Họ
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              placeholder="Nhập họ"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Roles -->
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <div class="mt-1 flex flex-wrap gap-2">
              <div v-if="loading.roles" class="text-gray-500">
                Đang tải vai trò...
              </div>
              <template v-else>
                <div
                  v-for="role in roles"
                  :key="role.id"
                  class="inline-flex items-center"
                >
                  <input
                    :id="`role-${role.id}`"
                    type="checkbox"
                    :value="role.id"
                    v-model="form.roleIds"
                    class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label :for="`role-${role.id}`" class="ml-2 text-sm text-gray-700">
                    {{ role.name }}
                  </label>
                </div>
              </template>
            </div>
          </div>

          <!-- Send Welcome Email -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center">
              <input
                id="welcomeEmail"
                type="checkbox"
                v-model="form.sendWelcomeEmail"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="welcomeEmail" class="ml-2 text-sm text-gray-700">
                Gửi email chào mừng đến người dùng
              </label>
            </div>
          </div>
        </div>

        <!-- Submit button -->
        <div class="mt-8 flex justify-end">
          <button
            type="button"
            class="mr-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            @click="$router.push('/users')"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            :disabled="loading.submit"
          >
            <span v-if="loading.submit">Đang xử lý...</span>
            <span v-else>Tạo người dùng</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useTrpc } from '~/composables/useTrpc'
import { useToast } from '~/composables/useToast'
import { useRouter } from 'vue-router'

const router = useRouter()
const trpc = useTrpc()
const toast = useToast()

const form = reactive({
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  roleIds: [],
  sendWelcomeEmail: true
})

const validationErrors = reactive({
  email: '',
  username: '',
  password: ''
})

const roles = ref([])
const showPassword = ref(false)

const loading = reactive({
  roles: false,
  submit: false
})

// Fetch roles
const fetchRoles = async () => {
  loading.roles = true
  try {
    roles.value = await trpc.admin.users.getRoles.query()
  } catch (error) {
    console.error('Error fetching roles:', error)
    toast.error('Không thể tải danh sách vai trò')
  } finally {
    loading.roles = false
  }
}

// Validate form
const validateForm = () => {
  let isValid = true
  
  // Reset validation errors
  validationErrors.email = ''
  validationErrors.username = ''
  validationErrors.password = ''
  
  // Email validation
  if (!form.email) {
    validationErrors.email = 'Email là bắt buộc'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    validationErrors.email = 'Email không hợp lệ'
    isValid = false
  }
  
  // Username validation (if provided)
  if (form.username && form.username.length < 3) {
    validationErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự'
    isValid = false
  }
  
  // Password validation
  if (!form.password) {
    validationErrors.password = 'Mật khẩu là bắt buộc'
    isValid = false
  } else if (form.password.length < 6) {
    validationErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    isValid = false
  }
  
  return isValid
}

// Create user
const createUser = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.submit = true
  try {
    await trpc.admin.users.createUser.mutate({
      email: form.email,
      username: form.username,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      roleIds: form.roleIds,
      sendWelcomeEmail: form.sendWelcomeEmail
    })
    
    toast.success('Tạo người dùng thành công')
    router.push('/users')
  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error.message === 'Email đã được sử dụng') {
      validationErrors.email = 'Email đã được sử dụng bởi người dùng khác'
    } else {
      toast.error(error.message || 'Không thể tạo người dùng')
    }
  } finally {
    loading.submit = false
  }
}

onMounted(() => {
  fetchRoles()
})
</script> 