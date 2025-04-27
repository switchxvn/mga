/**
 * Tạo mã hoàn trả đơn hàng
 * Format: RF-YYYYMMDD-XXXXX (X là các ký tự ngẫu nhiên)
 */
export function generateRefundCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  
  // Tạo 5 ký tự ngẫu nhiên
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `RF-${datePart}-${randomPart}`;
} 