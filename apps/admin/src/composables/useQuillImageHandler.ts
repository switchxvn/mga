import { useUpload } from './useUpload'
import { useToast } from './useToast'
import { ref } from 'vue'

export function useQuillImageHandler() {
  const { uploadImage } = useUpload()
  const { error: showError } = useToast()
  const isUploading = ref(false)

  const registerQuillImageHandler = (quill: any) => {
    const toolbar = quill.getModule('toolbar')
    toolbar.addHandler('image', handleImageUpload)
  }

  const handleImageUpload = () => {
    // Tạo input file ẩn để mở dialog chọn file
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    // Xử lý sự kiện khi chọn file
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      try {
        isUploading.value = true

        // Kiểm tra định dạng file
        if (!file.type.startsWith('image/')) {
          showError('Chỉ chấp nhận file hình ảnh')
          return
        }

        // Giới hạn kích thước file (5MB)
        if (file.size > 5 * 1024 * 1024) {
          showError('Kích thước file không được vượt quá 5MB')
          return
        }

        // Upload ảnh sử dụng useUpload composable
        const imageUrl = await uploadImage(file, 'posts')
        
        // Lấy instance của quill editor và chèn ảnh vào vị trí cursor hiện tại
        const quill = (window as any).currentQuillInstance
        const range = quill?.getSelection()
        
        if (quill && range) {
          quill.insertEmbed(range.index, 'image', imageUrl)
        }
      } catch (error: any) {
        console.error('Error uploading image:', error)
        showError(error.message || 'Không thể tải lên hình ảnh')
      } finally {
        isUploading.value = false
      }
    }
  }

  return {
    registerQuillImageHandler,
    isUploading
  }
} 