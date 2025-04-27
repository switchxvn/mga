# Table Components

Các components liên quan đến hiển thị và quản lý bảng dữ liệu.

## DataTable Component

Component bảng dữ liệu có khả năng tùy chỉnh qua slots.

### Cách sử dụng

```vue
<DataTable
  :items="itemsList"
  :loading="isLoading"
  :error="errorMessage"
  :sort-by="sortBy"
  :sort-order="sortOrder"
  :selected-items="selectedItems"
  :pagination="{
    currentPage: page,
    totalPages: totalPages,
    total: totalItems,
    pageSize: pageSize
  }"
  @update:selected-items="selectedItems = $event"
  @sort="handleSort"
  @page-change="handlePageChange"
  @clear-error="errorMessage = null"
>
  <!-- Selection slot -->
  <template #selection="{ item, isSelected, toggleSelection }">
    <input
      type="checkbox"
      :checked="isSelected"
      @change="toggleSelection(item.id)"
    />
  </template>

  <!-- Header slot -->
  <template #header="{ sortBy, sortOrder, handleSort }">
    <th>Column 1</th>
    <th>Column 2</th>
    <!-- ... -->
  </template>

  <!-- Row slot -->
  <template #row="{ item }">
    <td>{{ item.property1 }}</td>
    <td>{{ item.property2 }}</td>
    <!-- ... -->
  </template>
</DataTable>
```

### Props

- `items`: Array - Danh sách các mục dữ liệu
- `loading`: Boolean - Trạng thái đang tải
- `error`: String - Thông báo lỗi (nếu có)
- `sortBy`: String - Tên trường sắp xếp
- `sortOrder`: 'asc' | 'desc' - Thứ tự sắp xếp
- `selectedItems`: Array - Danh sách các mục đã chọn
- `pagination`: Object - Thông tin phân trang

### Events

- `update:selectedItems`: Emitted khi danh sách mục đã chọn thay đổi
- `sort`: Emitted khi thay đổi sắp xếp
- `page-change`: Emitted khi thay đổi trang
- `clear-error`: Emitted khi xóa thông báo lỗi

### Slots

- `selection`: Slot cho cột chọn
- `selection-header`: Slot cho header cột chọn
- `header`: Slot cho header bảng
- `row`: Slot cho hàng dữ liệu
- `pagination`: Slot cho phân trang 