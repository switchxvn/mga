import { ref } from 'vue'
import { useTrpc } from '@/composables/useTrpc'

export const useProfile = () => {
  const trpc = useTrpc()
  const isUpdatingName = ref(false)
  const isUpdatingPassword = ref(false)
  const error = ref<string | null>(null)

  const updateName = async (newName: string) => {
    try {
      isUpdatingName.value = true
      error.value = null
      
      await trpc.admin.users.updateName.mutate({ name: newName })
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật tên'
      return false
    } finally {
      isUpdatingName.value = false
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      isUpdatingPassword.value = true;
      error.value = null;

      const result = await trpc.admin.users.updatePassword.mutate({
        currentPassword,
        newPassword
      });

      console.log('result', result)

      if (!result) {
        throw new Error('Không thể cập nhật mật khẩu');
      }

      return true;
    } catch (err: any) {
      console.error('Error updating password:', err);
      
      if (err.message.includes('data and hash arguments required') || 
          err.message.includes('Mật khẩu hiện tại không đúng')) {
        error.value = 'Mật khẩu hiện tại không đúng';
      } else {
        error.value = err?.message || 'Có lỗi xảy ra khi cập nhật mật khẩu';
      }
      throw err;
    } finally {
      isUpdatingPassword.value = false;
    }
  }

  return {
    isUpdatingName,
    isUpdatingPassword,
    error,
    updateName,
    updatePassword
  }
} 