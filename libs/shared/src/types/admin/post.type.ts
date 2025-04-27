import { z } from 'zod';
import { PostStatus } from '../common/post.constant';
import type { BasePost } from '../common/post.type';

export const AdminPostTranslationSchema = z.object({
  locale: z.string().min(2, 'Mã ngôn ngữ không hợp lệ'),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  slug: z.string().min(1, 'Đường dẫn không được để trống'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  shortDescription: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional()
});

export type AdminPostTranslation = z.infer<typeof AdminPostTranslationSchema>;

export const CreateAdminPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED]),
  thumbnail: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  translations: z.array(AdminPostTranslationSchema).min(1, 'Cần ít nhất một bản dịch'),
  tags: z.array(z.string()).optional(),
  categoryIds: z.array(z.number()).optional(),
});

export type CreateAdminPostInput = z.infer<typeof CreateAdminPostSchema>;

export const UpdateAdminPostSchema = z.object({
  id: z.number(),
  data: CreateAdminPostSchema
});

export type UpdateAdminPostInput = z.infer<typeof UpdateAdminPostSchema>;

export const UpdateAdminPostStatusSchema = z.object({
  id: z.number(),
  status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED])
});

export type UpdateAdminPostStatusInput = z.infer<typeof UpdateAdminPostStatusSchema>;

export interface AdminPost extends BasePost {
  translations: AdminPostTranslation[];
  categories: {
    id: number;
    name: string;
    type: string;
    translations: {
      name: string;
      locale: string;
    }[];
  }[];
  postTags: {
    id: number;
    name: string;
    slug: string;
  }[];
  author: {
    id: number;
    name: string;
    email: string;
  } | null;
} 