/**
 * Format a number as a price string in VND currency
 * @param price The price to format
 * @returns The formatted price string
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return 'Liên hệ';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
} 