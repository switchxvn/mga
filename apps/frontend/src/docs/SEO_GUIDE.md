# Hướng dẫn sử dụng hệ thống SEO

## Tổng quan

Hệ thống SEO mới được thiết kế để tự động xử lý SEO meta tags cho tất cả pages mà không cần code thêm trong từng page component.

## Cách hoạt động

### 1. Middleware Global (`middleware/seo.global.ts`)
- Tự động chạy cho tất cả routes
- Fetch SEO data từ database qua server API
- Apply meta tags tự động
- Fallback to default meta nếu không có data

### 2. Server API (`server/api/seo-meta.get.ts`)
- Lấy dữ liệu SEO từ database qua tRPC
- Handle fallback cho từng loại route
- Sử dụng runtime config (không hardcode)

### 3. Database-driven
- Sử dụng `seo.entity.ts` để lưu trữ SEO data
- Admin có thể quản lý SEO cho từng page
- Flexible và dễ maintain

## Cách sử dụng

### Cho Developer

**Không cần làm gì thêm!** SEO được handle tự động.

```vue
<script setup lang="ts">
// Không cần import hay config SEO
// Chỉ focus vào business logic của page
</script>

<template>
  <div>
    <!-- Page content -->
  </div>
</template>
```

### Cho Admin

1. Vào admin panel
2. Quản lý SEO entries trong database
3. Thiết lập cho từng `pagePath`:
   - `/` - Trang chủ
   - `/products` - Trang sản phẩm
   - `/product/[slug]` - Chi tiết sản phẩm
   - `/about` - Giới thiệu
   - Etc.

### Nếu cần custom SEO động

Trong trường hợp hiếm hoi cần custom SEO based on dynamic content:

```vue
<script setup lang="ts">
// Load dynamic data
const { data: product } = await $fetch(`/api/products/${route.params.slug}`);

// Override SEO với data động
if (product) {
  useHead({
    title: `${product.name} - Shop`,
    meta: [
      { name: 'description', content: product.description }
    ]
  });
}
</script>
```

## Configuration

### Environment Variables

```bash
# .env
SITE_URL=https://yourdomain.com
SITE_NAME=Your Site Name
API_BASE=https://api.yourdomain.com
```

### Default Meta

Được set trong `nuxt.config.ts`:
- Sẽ được dùng khi không có data từ database
- Và khi middleware fail

## Troubleshooting

### Không có SEO data
- Check database có entry cho route đó không
- Check console có error từ API không
- Fallback sẽ dùng default meta từ config

### Performance
- SEO data được cache tự động
- Chỉ run 1 lần cho mỗi route
- Optimized cho SSR

## Best Practices

1. **Đặt SEO data trong database** thay vì hardcode
2. **Sử dụng runtime config** cho site info
3. **Test SEO** với tools như:
   - Facebook Debugger
   - Twitter Card Validator
   - Google Search Console

## Migration từ hệ thống cũ

1. Xóa tất cả SEO logic cũ từ pages
2. Import SEO data vào database
3. Test các routes quan trọng
4. Setup monitoring cho SEO metrics 