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
import { useProfile } from '~/composables/useProfile'

const toast = useToast()
const { updateName, updatePassword, isUpdatingName, isUpdatingPassword, error } = useProfile()

const nameForm = ref({
  newName: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleUpdateName = async () => {
  const success = await updateName(nameForm.value.newName)
  
  if (success) {
    toast.success('Cập nhật tên thành công')
    nameForm.value.newName = ''
  } else {
    toast.error(error.value || 'Có lỗi xảy ra khi cập nhật tên')
  }
}

const handleUpdatePassword = async () => {
  // Reset error state
  error.value = null;

  // Validate empty fields
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    toast.error('Vui lòng điền đầy đủ thông tin');
    return;
  }

  // Validate password length
  if (passwordForm.value.newPassword.length < 6) {
    toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    return;
  }

  // Validate password match
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Mật khẩu xác nhận không khớp');
    return;
  }

  try {
    const success = await updatePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    );

    if (success) {
      toast.success('Cập nhật mật khẩu thành công');
      // Reset form
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  } catch (err: any) {
    // Hiển thị thông báo lỗi từ API
    const errorMessage = err?.message || error.value || 'Có lỗi xảy ra khi cập nhật mật khẩu';
    toast.error(errorMessage, {
      timeout: 5000, // Hiển thị lâu hơn cho người dùng đọc
      position: 'top-center'
    });
    
    // Focus vào field có lỗi
    if (errorMessage.includes('Mật khẩu hiện tại không đúng')) {
      const currentPasswordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (currentPasswordInput) {
        currentPasswordInput.focus();
      }
    }
  }
}
</script> 