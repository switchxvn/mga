import { createError } from 'h3'
import axios from 'axios'
import https from 'https'

interface UploadResult {
  url: string
  key: string
  uploadId: number
}

export default defineEventHandler(async (event) => {
  try {
    console.log('Starting file upload process...')
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || !formData[0]) {
      console.error('No file provided in form data')
      throw createError({
        statusCode: 400,
        message: 'No file provided'
      })
    }

    const file = formData[0]
    console.log(`File received: ${file.filename}, type: ${file.type}, size: ${file.data.length} bytes`)
    
    // Get presigned info from form data
    const presignedUrl = formData.find(item => item.name === 'presignedUrl')?.data.toString()
    const key = formData.find(item => item.name === 'key')?.data.toString()
    const uploadId = Number(formData.find(item => item.name === 'uploadId')?.data.toString())
    const url = formData.find(item => item.name === 'url')?.data.toString()

    if (!presignedUrl || !key || !uploadId || !url) {
      console.error('Missing required upload information', {
        hasPresignedUrl: !!presignedUrl,
        hasKey: !!key,
        hasUploadId: !!uploadId,
        hasUrl: !!url
      })
      throw createError({
        statusCode: 400,
        message: 'Missing required presigned upload information'
      })
    }
    
    console.log(`Uploading to: ${key}, URL: ${url}, ID: ${uploadId}`)
    
    // Validate mime type
    if (!file.type?.includes('image/')) {
      console.error(`Invalid file type: ${file.type}`)
      throw createError({
        statusCode: 400,
        message: 'Only image files are allowed'
      })
    }

    console.log('Starting upload to storage service with axios...')
    
    // Cấu hình HTTPS agent với thời gian chờ dài hơn
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Tạm thời bỏ qua xác thực SSL
      timeout: 60000 // Tăng timeout lên 60 giây
    })
    
    try {
      // Sử dụng axios thay vì fetch với cấu hình nâng cao
      const uploadResponse = await axios.put(presignedUrl, file.data, {
        httpsAgent,
        headers: {
          'Content-Type': file.type || 'image/jpeg',
          'Content-Length': file.data.length.toString(),
          'x-amz-acl': 'public-read'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000 // 60 giây
      })

      console.log('Upload completed successfully with status:', uploadResponse.status)
    } catch (uploadError) {
      console.error('Error during axios upload operation:', uploadError)
      
      // Xử lý chi tiết lỗi axios
      if (uploadError.response) {
        // Server trả về response với status code nằm ngoài range 2xx
        console.error('Upload response error:', {
          status: uploadError.response.status,
          statusText: uploadError.response.statusText,
          data: uploadError.response.data
        })
      } else if (uploadError.request) {
        // Request được gửi nhưng không nhận được response
        console.error('No response received from storage service', uploadError.request)
      } else {
        // Lỗi trong quá trình thiết lập request
        console.error('Error setting up request:', uploadError.message)
      }
      
      throw createError({
        statusCode: 500,
        message: `Upload failed: ${uploadError.message}`
      })
    }

    // Return the upload result
    const result: UploadResult = {
      url,
      key,
      uploadId
    }

    console.log('Returning upload result:', result)
    return result

  } catch (error: unknown) {
    console.error('Upload error:', error)
    
    // Ensure we return a proper error response
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        message: `Failed to upload image: ${error.message}`,
        stack: error.stack
      })
    } else {
      throw createError({
        statusCode: 500,
        message: 'Failed to upload image due to unknown error'
      })
    }
  }
}) 