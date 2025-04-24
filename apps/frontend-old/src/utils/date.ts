/**
 * Format date to Vietnamese locale
 */
export function formatDate(dateInput: Date | string, options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}): string {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(dateInput: Date | string): string {
  return formatDate(dateInput, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 