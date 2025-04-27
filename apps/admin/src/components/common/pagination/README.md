# Pagination Components

Các components liên quan đến phân trang và điều hướng.

## Pagination Component

Component phân trang với các tùy chọn hiển thị.

### Cách sử dụng

```vue
<Pagination
  :current-page="currentPage"
  :total-pages="totalPages"
  :total-items="totalItems"
  :items-per-page="itemsPerPage"
  :max-visible-pages="5"
  :show-items-info="true"
  @page-change="handlePageChange"
/>
```

### Props

- `currentPage`: Number - Trang hiện tại
- `totalPages`: Number - Tổng số trang
- `totalItems`: Number - Tổng số mục
- `itemsPerPage`: Number - Số mục trên mỗi trang
- `maxVisiblePages`: Number - Số trang hiển thị tối đa (mặc định: 5)
- `showItemsInfo`: Boolean - Hiển thị thông tin về các mục (mặc định: true)

### Events

- `page-change`: Emitted khi thay đổi trang với giá trị là số trang mới 