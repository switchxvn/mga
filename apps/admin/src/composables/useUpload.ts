import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useTrpc } from './useTrpc'

export interface UploadOptions {
  file: File
  folder?: string
  onProgress?: (percent: number) => void
}

export interface UploadResult {
  url: string
  public_id: string
  width: number
  height: number
  format: string
  resource_type: string
}

export function useUpload() {
  const { $trpc } = useNuxtApp()
  const trpc = useTrpc()
  const isUploading = ref(false)

  const uploadFile = async ({
    file,
    folder = 'general',
    onProgress = () => {}
  }: UploadOptions): Promise<UploadResult> => {
    try {
      isUploading.value = true
      
      // Create a FormData instance to handle the file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Simulate onProgress for now
      onProgress(30)
      
      // Use trpc upload endpoint
      const result = await trpc.upload.uploadFile.mutate({
        file: await fileToBase64(file),
        folder
      })
      
      onProgress(100)
      
      return result
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    } finally {
      isUploading.value = false
    }
  }

  const uploadImage = async (file: File, folder = 'products'): Promise<string> => {
    try {
      isUploading.value = true
      const result = await uploadFile({ file, folder })
      return result.url
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    } finally {
      isUploading.value = false
    }
  }

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  return {
    uploadFile,
    uploadImage,
    isUploading
  }
} 