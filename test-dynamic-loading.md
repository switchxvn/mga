# Test Dynamic Loading từ Database

## ✅ Changes Applied

### 1. GTM Plugin (`apps/frontend/src/plugins/gtm.server.ts`)
- ✅ Enabled dynamic loading từ database via tRPC
- ✅ Fallback to hardcoded GTM ID nếu database call fails
- ✅ Proper error handling với timeout (5 seconds)

### 2. SEO Plugin (`apps/frontend/src/plugins/seo.server.ts`)  
- ✅ Enabled dynamic loading từ database via tRPC
- ✅ Preload SEO data cho middleware sử dụng
- ✅ Proper error handling với timeout (5 seconds)

### 3. SEO Middleware (`apps/frontend/src/middleware/seo.global.ts`)
- ✅ Enabled API calls để fetch dynamic SEO data
- ✅ Fallback system: preloaded → API call → defaults
- ✅ Timeout protection (3 seconds) để tránh hanging

## 🔍 Expected Logs

### Success Case (Dynamic data loaded):
```
✅ Fetch polyfill: Native fetch detected - no polyfill needed
✅ GTM Server Plugin: Successfully loaded dynamic GTM ID from database: GTM-XXXXX
✅ SEO Server Plugin: Successfully preloaded dynamic SEO data for /
✅ SEO Middleware: Using preloaded SEO data for /
```

### Fallback Case (Database unavailable):
```
✅ Fetch polyfill: Native fetch detected - no polyfill needed
GTM Server Plugin: Failed to fetch GTM settings: [error]
✅ GTM fallback ready with ID: GTM-T89X4CKH
SEO Server Plugin: Failed to preload SEO data: [error] 
SEO Middleware: No preloaded data, fetching from API for /
SEO Middleware: API error on server: [error]
SEO Middleware: Falling back to defaults for /
```

## 🧪 Testing Steps

1. **Build production:** `npm run build:frontend`
2. **Start application:** `npm run start`
3. **Check logs** để xem dynamic loading hoạt động
4. **Verify GTM ID** trong browser console
5. **Check SEO meta tags** trong page source

## 🐛 Troubleshooting

Nếu vẫn gặp lỗi:
1. Check backend server đang chạy và accessible
2. Verify tRPC routes hoạt động: `/api/trpc/settings.getPublicSettings` 
3. Check database connection
4. Review timeout settings nếu API calls quá chậm 