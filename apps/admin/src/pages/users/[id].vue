<template>
  <div class="container mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">
        {{ isEditing ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng' }}
      </h1>
      <div class="flex space-x-3">
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Chỉnh sửa
        </button>
        <NuxtLink 
          to="/users" 
          class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
        >
          Quay lại
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow-md p-8 flex justify-center">
      <LoadingIcon class="w-10 h-10 text-blue-600" />
    </div>

    <div v-else-if="error" class="bg-white rounded-lg shadow-md p-8">
      <div class="text-center text-red-600">
        <p>{{ error }}</p>
        <button
          @click="fetchUser"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Read-only view -->
      <div v-if="!isEditing" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center space-x-4">
            <div class="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold">
              {{ getUserInitials(user) }}
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-800">
                {{ user.username || 'N/A' }}
              </h2>
              <p class="text-gray-600">{{ user.email }}</p>
            </div>
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Thông tin tài khoản</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-500">ID</p>
                <p class="font-medium">{{ user.id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Trạng thái</p>
                <p class="font-medium">
                  <span 
                    :class="[
                      'px-2 py-1 text-xs rounded-full', 
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ user.isActive ? 'Hoạt động' : 'Bị khóa' }}
                  </span>
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email đã xác thực</p>
                <p class="font-medium">
                  <span 
                    :class="[
                      'px-2 py-1 text-xs rounded-full', 
                      user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực' }}
                  </span>
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Lần đăng nhập cuối</p>
                <p class="font-medium">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Chưa đăng nhập' }}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Thông tin cá nhân</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-500">Họ và tên</p>
                <p class="font-medium">
                  {{ 
                    (user.profile && (user.profile.firstName || user.profile.lastName))
                      ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
                      : 'N/A'
                  }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Vai trò</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="role in user.roles" 
                    :key="role.id" 
                    class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {{ role.name }}
                  </span>
                  <span v-if="!user.roles || !user.roles.length" class="text-gray-500">
                    Không có vai trò
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Thông tin hệ thống</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p class="text-sm text-gray-500">Ngày tạo</p>
                <p class="font-medium">{{ formatDate(user.createdAt) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Cập nhật lần cuối</p>
                <p class="font-medium">{{ formatDate(user.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex gap-2">
          <button
            @click="sendPasswordResetEmail"
            class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            :disabled="loading"
          >
            Gửi email đặt lại mật khẩu
          </button>
          
          <button
            v-if="user.isActive"
            @click="updateUserStatus(false)"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            :disabled="loading"
          >
            Khóa tài khoản
          </button>
          
          <button
            v-else
            @click="updateUserStatus(true)"
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            :disabled="loading"
          >
            Kích hoạt tài khoản
          </button>
        </div>
      </div>

      <!-- Edit form -->
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="updateUser">
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

            <!-- Password (optional for update) -->
            <div class="col-span-1">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span class="text-sm text-gray-500">(để trống nếu không thay đổi)</span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu mới"
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

            <!-- Active status -->
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    v-model="form.isActive"
                    :value="true"
                    class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Hoạt động</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    v-model="form.isActive"
                    :value="false"
                    class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Khóa</span>
                </label>
              </div>
            </div>

            <!-- Email verified status -->
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái xác thực email
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    v-model="form.isEmailVerified"
                    :value="true"
                    class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Đã xác thực</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    v-model="form.isEmailVerified"
                    :value="false"
                    class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Chưa xác thực</span>
                </label>
              </div>
            </div>

            <!-- Roles -->
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <div class="mt-1 flex flex-wrap gap-2">
                <div v-if="rolesLoading" class="text-gray-500">
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
          </div>

          <!-- Submit buttons -->
          <div class="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              @click="cancelEdit"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Đang xử lý...</span>
              <span v-else>Cập nhật</span>
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '~/composables/useTrpc'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const router = useRouter()
const trpc = useTrpc()
const toast = useToast()

const userId = computed(() => route.params.id)
const user = ref(null)
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const isSubmitting = ref(false)
const rolesLoading = ref(false)
const showPassword = ref(false)
const roles = ref([])

const form = reactive({
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  isActive: true,
  isEmailVerified: false,
  roleIds: []
})

const validationErrors = reactive({
  email: '',
  username: '',
  password: ''
})

// Fetch user details
const fetchUser = async () => {
  loading.value = true
  error.value = null
  
  try {
    user.value = await trpc.admin.users.getUserById.query(userId.value)
    
    // Initialize form with user data
    form.email = user.value.email
    form.username = user.value.username || ''
    form.isActive = user.value.isActive
    form.isEmailVerified = user.value.isEmailVerified
    
    // Handle profile data
    if (user.value.profile) {
      form.firstName = user.value.profile.firstName || ''
      form.lastName = user.value.profile.lastName || ''
    }
    
    // Handle roles
    if (user.value.roles) {
      form.roleIds = user.value.roles.map(role => role.id)
    }
  } catch (err) {
    console.error('Error fetching user:', err)
    error.value = 'Không thể tải thông tin người dùng'
  } finally {
    loading.value = false
  }
}

// Fetch available roles
const fetchRoles = async () => {
  rolesLoading.value = true
  try {
    roles.value = await trpc.admin.users.getRoles.query()
  } catch (err) {
    console.error('Error fetching roles:', err)
    toast.error('Không thể tải danh sách vai trò')
  } finally {
    rolesLoading.value = false
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Get user initials for avatar
const getUserInitials = (user) => {
  if (user.username) {
    return user.username.charAt(0).toUpperCase()
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase()
  }
  return 'U'
}

// Cancel edit mode
const cancelEdit = () => {
  isEditing.value = false
  
  // Reset form to current user data
  form.email = user.value.email
  form.username = user.value.username || ''
  form.password = ''
  form.isActive = user.value.isActive
  form.isEmailVerified = user.value.isEmailVerified
  
  if (user.value.profile) {
    form.firstName = user.value.profile.firstName || ''
    form.lastName = user.value.profile.lastName || ''
  } else {
    form.firstName = ''
    form.lastName = ''
  }
  
  if (user.value.roles) {
    form.roleIds = user.value.roles.map(role => role.id)
  } else {
    form.roleIds = []
  }
  
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
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
  
  // Password validation (only if provided)
  if (form.password && form.password.length < 6) {
    validationErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    isValid = false
  }
  
  return isValid
}

// Update user
const updateUser = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  try {
    const updateData = {
      id: userId.value,
      email: form.email,
      username: form.username || undefined,
      isActive: form.isActive,
      isEmailVerified: form.isEmailVerified,
      roleIds: form.roleIds,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined
    }
    
    // Only include password if it was changed
    if (form.password) {
      updateData.password = form.password
    }
    
    await trpc.admin.users.updateUser.mutate(updateData)
    
    toast.success('Cập nhật người dùng thành công')
    
    // Reload user data and exit edit mode
    await fetchUser()
    isEditing.value = false
  } catch (err) {
    console.error('Error updating user:', err)
    
    if (err.message === 'Email đã được sử dụng bởi người dùng khác') {
      validationErrors.email = 'Email đã được sử dụng bởi người dùng khác'
    } else {
      toast.error(err.message || 'Không thể cập nhật người dùng')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Send password reset email
const sendPasswordResetEmail = async () => {
  try {
    await trpc.admin.users.sendPasswordResetEmail.mutate(userId.value)
    toast.success('Đã gửi email đặt lại mật khẩu')
  } catch (err) {
    console.error('Error sending password reset email:', err)
    toast.error('Không thể gửi email đặt lại mật khẩu')
  }
}

// Update user status (active/inactive)
const updateUserStatus = async (isActive) => {
  try {
    await trpc.admin.users.updateUser.mutate({
      id: userId.value,
      isActive
    })
    
    toast.success(`Đã ${isActive ? 'kích hoạt' : 'khóa'} tài khoản người dùng`)
    
    // Reload user data
    await fetchUser()
  } catch (err) {
    console.error('Error updating user status:', err)
    toast.error(`Không thể ${isActive ? 'kích hoạt' : 'khóa'} tài khoản người dùng`)
  }
}

onMounted(async () => {
  await fetchUser()
  await fetchRoles()
})
</script> 