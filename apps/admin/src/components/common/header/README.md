# Header Components

Các components liên quan đến tiêu đề và phần đầu của trang.

## PageHeader Component

Component tiêu đề trang với các nút hành động.

### Cách sử dụng

```vue
<PageHeader
  title="Tiêu đề trang"
  description="Mô tả ngắn về chức năng của trang"
>
  <template #actions>
    <button class="btn btn-primary">Nút hành động</button>
    <button class="btn btn-secondary">Nút khác</button>
  </template>
</PageHeader>
```

### Props

- `title`: String - Tiêu đề của trang
- `description`: String - Mô tả ngắn về trang

### Slots

- `actions`: Slot cho các nút hành động ở phía bên phải tiêu đề 