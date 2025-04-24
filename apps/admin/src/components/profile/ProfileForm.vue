<template>
  <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold mb-6">Thông tin cá nhân</h2>
    
    <!-- Change Name Form -->
    <div class="mb-8">
      <h3 class="text-lg font-medium mb-4">Đổi tên</h3>
      <form @submit.prevent="handleUpdateName" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Tên mới</label>
          <input
            v-model="nameForm.newName"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="isUpdatingName"
        >
          {{ isUpdatingName ? 'Đang cập nhật...' : 'Cập nhật tên' }}
        </button>
      </form>
    </div>

    <!-- Change Password Form -->
    <div>
      <h3 class="text-lg font-medium mb-4">Đổi mật khẩu</h3>
      <form @submit.prevent="handleUpdatePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="isUpdatingPassword"
        >
          {{ isUpdatingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const nameForm = ref({
  newName: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isUpdatingName = ref(false)
const isUpdatingPassword = ref(false)

const handleUpdateName = async () => {
  try {
    isUpdatingName.value = true
    // TODO: Implement API call to update name
    toast.success('Cập nhật tên thành công')
    nameForm.value.newName = ''
  } catch (error) {
    toast.error('Có lỗi xảy ra khi cập nhật tên')
  } finally {
    isUpdatingName.value = false
  }
}

const handleUpdatePassword = async () => {
  try {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    isUpdatingPassword.value = true
    // TODO: Implement API call to update password
    toast.success('Cập nhật mật khẩu thành công')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    toast.error('Có lỗi xảy ra khi cập nhật mật khẩu')
  } finally {
    isUpdatingPassword.value = false
  }
}
</script> 