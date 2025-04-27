# Media Components

Các components liên quan đến media như upload, hiển thị hình ảnh, video, v.v.

## MediaUploader Component

Component upload hình ảnh với preview và validation.

### Cách sử dụng

```vue
<MediaUploader
  v-model="imageUrl"
  :preview="thumbnailUrl"
  accept="image/*"
  :max-size="5 * 1024 * 1024"
  :aspect-ratio="1"
  alt="Image preview"
  @error="handleError"
/>
```

### Props

- `modelValue`: String - URL của hình ảnh đã upload
- `preview`: String - URL của hình ảnh preview
- `accept`: String - Các loại file được chấp nhận (ví dụ: 'image/*')
- `maxSize`: Number - Kích thước tối đa của file (tính bằng byte)
- `aspectRatio`: Number - Tỷ lệ khung hình yêu cầu (ví dụ: 1 cho hình vuông)
- `alt`: String - Thuộc tính alt cho hình ảnh preview

### Events

- `update:modelValue`: Emitted khi URL của hình ảnh thay đổi
- `error`: Emitted khi có lỗi upload với thông báo lỗi 