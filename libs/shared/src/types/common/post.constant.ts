export const PostStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
} as const;

export type PostStatus = typeof PostStatus[keyof typeof PostStatus]; 