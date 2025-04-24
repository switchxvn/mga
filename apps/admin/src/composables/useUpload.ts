import { useNuxtApp } from '#app'

export interface UploadOptions {
  file: File
  folder?: string
  onProgress?: (progress: number) => void
}

export interface UploadResult {
  url: string
  key: string
  uploadId: number
}

export const useUpload = () => {
  const { $trpc } = useNuxtApp()

  const uploadFile = async ({ file, folder = 'posts', onProgress }: UploadOptions): Promise<UploadResult> => {
    try {
      // Get presigned URL from backend
      const presignedData = await $trpc.upload.getPresignedUrl.mutate({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        folder
      })

      // Create form data with presigned info
      const formData = new FormData()
      formData.append('file', file)
      formData.append('presignedUrl', presignedData.presignedUrl)
      formData.append('key', presignedData.key)
      formData.append('uploadId', presignedData.uploadId.toString())
      formData.append('url', presignedData.url)
      
      // Upload through server endpoint
      const response = await $fetch('/api/local/upload-image', {
        method: 'POST',
        body: formData
      })

      return response as UploadResult
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  return {
    uploadFile
  }
} 