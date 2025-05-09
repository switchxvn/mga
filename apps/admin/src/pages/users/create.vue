<template>
  <div class="min-h-screen bg-slate-50 dark:bg-neutral-900">
    <!-- Loading State -->
    <div v-if="loading.submit" class="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div class="flex flex-col items-center gap-2">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-r-transparent"></div>
        <p class="text-sm text-slate-500 dark:text-neutral-400">Đang xử lý...</p>
      </div>
    </div>

    <!-- Content Area -->
    <div class="container mx-auto py-6 space-y-6">
      <!-- Header -->
      <PageHeader 
        title="Tạo người dùng mới" 
        description="Thêm và quản lý người dùng mới trong hệ thống"
      >
        <template #actions>
          <NuxtLink 
            to="/users" 
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-600"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Quay lại
          </NuxtLink>
        </template>
      </PageHeader>

      <!-- Tabs Navigation -->
      <nav class="flex items-center space-x-1 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-1 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
          :class="{
            'bg-primary-600 text-white': currentTab === tab.id,
            'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700': currentTab !== tab.id
          }"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.name }}
        </button>
      </nav>

      <!-- Tab Contents -->
      <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
        <form @submit.prevent="createUser">
          <!-- Thông tin cơ bản -->
          <div v-show="currentTab === 'basic'">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Thông tin cơ bản</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Email -->
              <div class="col-span-1 md:col-span-2">
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="Nhập email người dùng"
                  required
                  class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  :class="{ 'border-red-500 dark:border-red-500': validationErrors.email }"
                  @input="handleEmailChange"
                />
                <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ validationErrors.email }}
                </p>
              </div>

              <!-- Username -->
              <div class="col-span-1">
                <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên người dùng
                </label>
                <div class="relative">
                  <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    placeholder="Nhập tên người dùng dạng slug không dấu"
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.username }"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    @click="generateUsername"
                    title="Tự động tạo từ email"
                  >
                    <RefreshCw class="w-4 h-4" />
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Sử dụng các ký tự a-z, 0-9, gạch ngang (-), không dấu, không khoảng trắng (vd: john-doe)
                </p>
                <p v-if="validationErrors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ validationErrors.username }}
                </p>
              </div>

              <!-- Password -->
              <div class="col-span-1">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Nhập mật khẩu"
                    required
                    class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    :class="{ 'border-red-500 dark:border-red-500': validationErrors.password }"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      class="px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 border-r border-gray-300 dark:border-neutral-600 h-full"
                      @click="generatePassword"
                      title="Tạo mật khẩu ngẫu nhiên"
                    >
                      <RefreshCw class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      class="px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      @click="showPassword = !showPassword"
                      title="Hiện/ẩn mật khẩu"
                    >
                      <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ validationErrors.password }}
                </p>
              </div>
            </div>
          </div>

          <!-- Thông tin cá nhân -->
          <div v-show="currentTab === 'profile'">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Thông tin cá nhân</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- First Name -->
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  placeholder="Nhập tên"
                  class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                />
              </div>

              <!-- Last Name -->
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Họ
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  placeholder="Nhập họ"
                  class="bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                />
              </div>
            </div>
          </div>

          <!-- Phân quyền -->
          <div v-show="currentTab === 'permissions'">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Phân quyền</h3>
            
            <!-- Roles -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Vai trò
              </label>
              <div class="mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-if="loading.roles" class="text-gray-500 dark:text-gray-400 col-span-3">
                  <Loader2 class="w-4 h-4 mr-2 inline-block animate-spin" />
                  Đang tải vai trò...
                </div>
                <template v-else>
                  <div
                    v-for="role in roles"
                    :key="role.id"
                    class="inline-flex items-center p-2 border border-gray-200 dark:border-neutral-700 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700"
                  >
                    <input
                      :id="`role-${role.id}`"
                      type="checkbox"
                      :value="role.id"
                      v-model="form.roleIds"
                      class="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-primary-500"
                    />
                    <label :for="`role-${role.id}`" class="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer w-full">
                      {{ role.name }}
                    </label>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Cài đặt -->
          <div v-show="currentTab === 'settings'">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">Cài đặt tài khoản</h3>
            
            <!-- Send Welcome Email -->
            <div class="mb-6">
              <div class="flex items-center p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                <input
                  id="welcomeEmail"
                  type="checkbox"
                  v-model="form.sendWelcomeEmail"
                  class="h-4 w-4 text-primary-600 bg-gray-100 dark:bg-neutral-600 rounded border-gray-300 dark:border-neutral-500 focus:ring-primary-500"
                />
                <div class="ml-3">
                  <label for="welcomeEmail" class="font-medium text-gray-700 dark:text-gray-300">
                    Gửi email chào mừng
                  </label>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Gửi email thông báo tạo tài khoản thành công cho người dùng</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Nút điều hướng và nút submit -->
          <div class="mt-8 border-t border-gray-200 dark:border-neutral-700 pt-6 flex justify-between">
            <div>
              <button
                type="button"
                v-if="getPreviousTab()"
                @click="currentTab = getPreviousTab()"
                class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-600 dark:hover:bg-neutral-600"
              >
                <ChevronLeft class="w-4 h-4 mr-2" />
                Quay lại
              </button>
            </div>
            
            <div class="flex space-x-3">
              <button
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-600 dark:hover:bg-neutral-600"
                @click="$router.push('/users')"
              >
                Hủy
              </button>
              
              <button
                v-if="getNextTab()"
                type="button"
                @click="currentTab = getNextTab()"
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Tiếp theo
                <ChevronRight class="w-4 h-4 ml-2" />
              </button>
              
              <button
                v-else
                type="submit"
                :disabled="loading.submit"
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Loader2 v-if="loading.submit" class="w-4 h-4 mr-2 animate-spin" />
                <span v-else>Tạo người dùng</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useTrpc } from '~/composables/useTrpc'
import { useToast } from '~/composables/useToast'
import { useRouter } from 'vue-router'
import PageHeader from "../../components/common/header/PageHeader.vue"
import { User, IdCard, Lock, Settings, ChevronLeft, ChevronRight, ArrowLeft, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-vue-next'

const router = useRouter()
const trpc = useTrpc()
const toast = useToast()

// Form data
const form = reactive({
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  roleIds: [],
  sendWelcomeEmail: true
})

// Form validation
const validationErrors = reactive({
  email: '',
  username: '',
  password: ''
})

// Tab management
const tabs = [
  { id: 'basic', name: 'Thông tin cơ bản', icon: User },
  { id: 'profile', name: 'Thông tin cá nhân', icon: IdCard },
  { id: 'permissions', name: 'Phân quyền', icon: Lock },
  { id: 'settings', name: 'Cài đặt', icon: Settings }
]
const currentTab = ref('basic')

// Helper functions for tab navigation
const getPreviousTab = () => {
  const currentIndex = tabs.findIndex(tab => tab.id === currentTab.value)
  return currentIndex > 0 ? tabs[currentIndex - 1].id : null
}

const getNextTab = () => {
  const currentIndex = tabs.findIndex(tab => tab.id === currentTab.value)
  return currentIndex < tabs.length - 1 ? tabs[currentIndex + 1].id : null
}

// UI state
const roles = ref([])
const showPassword = ref(false)
const loading = reactive({
  roles: false,
  submit: false
})

// Tạo slug từ chuỗi với các ký tự cho phép
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // tách các dấu ra khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ các dấu
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-') // thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, '') // loại bỏ các ký tự không phải chữ, số, gạch ngang
    .replace(/\-\-+/g, '-') // thay nhiều dấu gạch ngang liên tiếp bằng một dấu
    .replace(/^-+/, '') // cắt đầu chuỗi nếu bắt đầu bằng dấu gạch ngang
    .replace(/-+$/, ''); // cắt đuôi chuỗi nếu kết thúc bằng dấu gạch ngang
}

// Tạo username từ email
const generateUsername = () => {
  if (!form.email) {
    toast.error('Vui lòng nhập email trước')
    return
  }
  
  const username = form.email.split('@')[0] // Lấy phần trước @ trong email
  form.username = slugify(username)
  
  // Nếu có tên và họ, dùng tên và họ để tạo username
  if (form.firstName || form.lastName) {
    const fullName = `${form.firstName} ${form.lastName}`.trim()
    if (fullName) {
      form.username = slugify(fullName)
    }
  }
}

// Xử lý khi email thay đổi
const handleEmailChange = () => {
  // Nếu chưa có username và có email, tự động tạo username
  if (!form.username && form.email && form.email.includes('@')) {
    generateUsername()
  }
}

// Tạo mật khẩu ngẫu nhiên
const generatePassword = () => {
  // Tạo mật khẩu mạnh với 12 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specialChars = '!@#$%^&*()_-+=<>?'
  const allChars = lowerChars + upperChars + numbers + specialChars
  
  // Đảm bảo có ít nhất 1 ký tự của mỗi loại
  let password = ''
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length))
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length))
  
  // Thêm 8 ký tự ngẫu nhiên khác
  for (let i = 0; i < 8; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // Trộn ngẫu nhiên các ký tự trong mật khẩu
  password = password.split('').sort(() => 0.5 - Math.random()).join('')
  
  form.password = password
  showPassword.value = true // Hiện mật khẩu để người dùng có thể thấy
  
  // Tự động ẩn mật khẩu sau 5 giây
  setTimeout(() => {
    showPassword.value = false
  }, 5000)
  
  // Hiển thị thông báo mật khẩu đã được tạo
  toast.success('Đã tạo mật khẩu ngẫu nhiên')
}

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
  if (form.username) {
    if (form.username.length < 3) {
      validationErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự'
      isValid = false
    } else if (!/^[a-z0-9-]+$/.test(form.username)) {
      validationErrors.username = 'Tên người dùng chỉ chấp nhận chữ thường a-z, số 0-9 và dấu gạch ngang (-)'
      isValid = false
    }
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
    currentTab.value = 'basic' // Return to basic tab if validation fails
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
      currentTab.value = 'basic' // Return to basic tab for email error
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