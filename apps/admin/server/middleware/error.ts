import { defineEventHandler, createError, H3Error } from 'h3'

export default defineEventHandler((event) => {
  try {
    return
  } catch (error) {
    // Xử lý các loại lỗi khác nhau
    if (error instanceof H3Error) {
      throw error // Giữ nguyên H3Error
    }

    // Xử lý JWT errors
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        message: 'Invalid token'
      })
    }

    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        message: 'Token expired'
      })
    }

    // Xử lý validation errors
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        message: error.message
      })
    }

    // Xử lý các lỗi không xác định
    console.error('Unhandled error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
}) 