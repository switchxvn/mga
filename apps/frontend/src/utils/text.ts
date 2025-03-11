/**
 * Truncate text content with ellipsis
 */
export function truncateContent(content: string, maxLength: number = 150): string {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  
  return content.substring(0, maxLength) + '...';
}

/**
 * Create URL friendly slug from text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // convert diacritics
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/--+/g, '-') // remove consecutive hyphens
    .trim();
} 