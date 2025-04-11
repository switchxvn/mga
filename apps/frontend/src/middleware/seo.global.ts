import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';
import { useTrpc } from '../composables/useTrpc';

type RouterOutput = inferRouterOutputs<AppRouter>;
type SeoOutput = RouterOutput['seo']['getSeoByPath'];

export default defineNuxtRouteMiddleware(async (to) => {
  // Bỏ qua các tài nguyên tĩnh
  if (to.path.match(/\.(svg|png|jpg|jpeg|gif|css|js|ico|woff|woff2|ttf|eot|json|xml)$/i)) {
    return;
  }
  
  // Bỏ qua các trang chi tiết vì chúng đã có SEO riêng
  // Kiểm tra các mẫu URL của trang chi tiết
  const detailPagePatterns = [
    /^\/posts\/[^\/]+$/,  // Trang chi tiết bài viết: /posts/slug
    /^\/products\/[^\/]+$/,  // Trang chi tiết sản phẩm: /products/slug
    /^\/bai-viet\/[^\/]+$/,  // Trang chi tiết bài viết: /bai-viet/slug
    /^\/san-pham\/[^\/]+$/,  // Trang chi tiết sản phẩm: /san-pham/slug
    /^\/dich-vu\/[^\/]+$/,  // Trang chi tiết dịch vụ: /dich-vu/slug
    /^\/tickets\/[^\/]+$/,  // Trang chi tiết vé: /tickets/slug
    // Thêm các mẫu URL khác nếu cần
  ];
  
  // Nếu URL hiện tại khớp với bất kỳ mẫu nào, bỏ qua việc gọi API SEO
  if (detailPagePatterns.some(pattern => pattern.test(to.path))) {
    return;
  }
  
  const trpc = useTrpc();
  
  try {
    const seo = await trpc.seo.getSeoByPath.query(to.path || '/');
    if (!seo) return;

    useSeoMeta({
      title: seo.title || undefined,
      description: seo.description || undefined,
      // Open Graph
      ogTitle: seo.ogTitle || seo.title || undefined,
      ogDescription: seo.ogDescription || seo.description || undefined,
      ogImage: seo.ogImage || undefined,
      // Keywords
      keywords: seo.keywords || undefined,
      // Robots
      robots: seo.robotsTxt || undefined,
      // Canonical
      ...(seo.canonicalUrl ? { canonical: seo.canonicalUrl } : {}),
    });
  } catch (err) {
    console.error('Error updating SEO tags:', err);
  }
}); 