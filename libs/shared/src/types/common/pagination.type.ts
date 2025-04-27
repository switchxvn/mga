/**
 * Generic pagination response type
 * @template T - Type of items being paginated
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
} 