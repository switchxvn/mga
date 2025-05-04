import { ref } from 'vue'
import axios from 'axios'
import { useTrpc } from './useTrpc'
import { useToast } from './useToast'

export interface UploadOptions {
  file: File
  folder?: string
  onProgress?: (percent: number) => void
}

export interface UploadResult {
  url: string
  key?: string
  uploadId?: number
}

export function useUpload() {
  const trpc = useTrpc()
  const isUploading = ref(false)
  const toast = useToast()

  const uploadFile = async ({
    file,
    folder = 'general',
    onProgress = () => {}
  }: UploadOptions): Promise<UploadResult> => {
    try {
      isUploading.value = true
      
      // Báo cáo tiến trình bắt đầu
      onProgress(10)
      
      // 1. Lấy presigned URL từ API
      console.log(`Getting presigned URL for: ${file.name}, type: ${file.type}, size: ${file.size} bytes, folder: ${folder}`)
      const presignedData = await trpc.upload.getPresignedUrl.mutate({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        folder
      })
      
      if (!presignedData?.presignedUrl || !presignedData?.url) {
        const errorMsg = 'Failed to get presigned URL from server'
        console.error(errorMsg, presignedData)
        throw new Error(errorMsg)
      }
      
      console.log('Presigned URL obtained successfully', {
        uploadId: presignedData.uploadId,
        hasUrl: !!presignedData.url,
        hasKey: !!presignedData.key
      })
      
      onProgress(30)
      
      // 2. Upload trực tiếp sử dụng presignedUrl thay vì thông qua server middleware
      try {
        onProgress(50)
        
        // Upload trực tiếp đến S3 với presignedUrl
        const uploadResponse = await axios.put(presignedData.presignedUrl, file, {
          headers: {
            'Content-Type': file.type,
            'Content-Length': file.size.toString(),
            'x-amz-acl': 'public-read'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(50 + percentCompleted * 0.5) // 50% -> 100%
            }
          }
        })
        
        console.log('Upload completed successfully', uploadResponse)
        onProgress(100)
        
        const uploadResult = {
          url: presignedData.url,
          key: presignedData.key,
          uploadId: presignedData.uploadId
        }
        
        return uploadResult
      } catch (uploadError: any) {
        console.error('Error during upload to S3:', uploadError)
        
        // Hiển thị lỗi chi tiết hơn để debug
        const errorMessage = uploadError?.response?.data?.message || 
                            uploadError?.message || 
                            'Unknown upload error'
        const statusCode = uploadError?.response?.status || 'unknown'
        
        toast.error(`Upload failed (${statusCode}): ${errorMessage}`)
        throw new Error(`Upload failed: ${errorMessage}`)
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(`Upload failed: ${errorMessage}`)
      throw error
    } finally {
      isUploading.value = false
    }
  }

  const uploadImage = async (file: File, folder = 'avatars'): Promise<string> => {
    try {
      isUploading.value = true
      const result = await uploadFile({ file, folder })
      return result.url
    } catch (error: any) {
      console.error('Image upload failed:', error)
      throw error
    } finally {
      isUploading.value = false
    }
  }

  return {
    uploadFile,
    uploadImage,
    isUploading
  }
} 