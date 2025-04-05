import * as LucideIcons from 'lucide-vue-next';
import type { Icon as LucideIcon } from 'lucide-vue-next';

// Lấy tất cả tên icon từ Lucide
type LucideIconName = keyof typeof LucideIcons;

/**
 * Chuyển đổi các định dạng khác nhau sang PascalCase cho tên icon
 * @param str Chuỗi cần chuyển đổi (có thể ở dạng kebab-case, snake_case hoặc space separated)
 * @returns Chuỗi ở dạng PascalCase
 */
export const toPascalCase = (str: string): string => {
  if (!str) return '';
  // Xử lý nhiều định dạng: kebab-case, snake_case, space separated
  return str
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * Lấy tên icon chính xác từ thư viện Lucide
 * @param iconName Tên icon (có thể ở nhiều định dạng khác nhau)
 * @returns Tên icon chính xác từ thư viện Lucide hoặc icon mặc định nếu không tìm thấy
 */
export const getIconName = (iconName: string | null | undefined): LucideIconName => {
  if (!iconName) {
    console.log('Icon name is null or undefined, using HelpCircle');
    return 'HelpCircle';
  }
  
  // Loại bỏ phần mở rộng file nếu có
  const cleanName = iconName.replace(/\.[^/.]+$/, '');
  console.log('Clean icon name:', cleanName);
  
  // Thử khớp trực tiếp trước
  if (LucideIcons[cleanName as LucideIconName]) {
    console.log('Found direct match for icon:', cleanName);
    return cleanName as LucideIconName;
  }
  
  // Thử chuyển đổi sang PascalCase
  const pascalCaseName = toPascalCase(cleanName);
  console.log('PascalCase icon name:', pascalCaseName);
  
  if (LucideIcons[pascalCaseName as LucideIconName]) {
    console.log('Found match after PascalCase conversion:', pascalCaseName);
    return pascalCaseName as LucideIconName;
  }
  
  // Log available icons for debugging
  console.log('Available Lucide icons:', Object.keys(LucideIcons));
  console.warn(`Icon "${iconName}" không tìm thấy trong Lucide icons, sử dụng icon mặc định`);
  return 'HelpCircle';
}; 