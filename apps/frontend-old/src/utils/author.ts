import type { Post } from '@ew/shared';

/**
 * Get formatted author name from author object
 */
export function getAuthorName(author: Post['author']): string {
  if (!author) return 'Không xác định';
  
  if (author.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  
  return author.email?.split('@')[0] || 'Không xác định';
} 