import { defineEventHandler, createError, getRequestHeader } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // Bỏ qua authentication cho một số routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  if (publicRoutes.includes(event.path)) {
    return
  }

  try {
    const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized - No token provided'
      })
    }

    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret)
    
    // Lưu thông tin user vào context để sử dụng ở các handlers
    event.context.auth = decoded

  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Invalid token'
    })
  }
}) 