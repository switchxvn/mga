import { createError } from 'h3'
import fetch from 'node-fetch'

interface UploadResult {
  url: string
  key: string
  uploadId: number
}

export default defineEventHandler(async (event) => {
  try {
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || !formData[0]) {
      throw createError({
        statusCode: 400,
        message: 'No file provided'
      })
    }

    const file = formData[0]
    
    // Get presigned info from form data
    const presignedUrl = formData.find(item => item.name === 'presignedUrl')?.data.toString()
    const key = formData.find(item => item.name === 'key')?.data.toString()
    const uploadId = Number(formData.find(item => item.name === 'uploadId')?.data.toString())
    const url = formData.find(item => item.name === 'url')?.data.toString()

    if (!presignedUrl || !key || !uploadId || !url) {
      throw createError({
        statusCode: 400,
        message: 'Missing required presigned upload information'
      })
    }
    
    // Validate mime type
    if (!file.type?.includes('image/')) {
      throw createError({
        statusCode: 400,
        message: 'Only image files are allowed'
      })
    }

    // Upload to S3 using presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file.data,
      headers: {
        'Content-Type': file.type || 'image/jpeg',
        'Content-Length': file.data.length.toString(),
        'x-amz-acl': 'public-read'
      }
    })

    if (!uploadResponse.ok) {
      console.error('Upload failed:', await uploadResponse.text())
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    // Return the upload result
    const result: UploadResult = {
      url,
      key,
      uploadId
    }

    return result

  } catch (error: unknown) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to upload image'
    })
  }
}) 