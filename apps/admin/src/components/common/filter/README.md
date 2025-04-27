# Common Components

Tập hợp các components dùng chung trong toàn bộ ứng dụng Admin để đảm bảo tính nhất quán của giao diện.

## Cấu trúc thư mục

- `/filter`: Các components filter và tìm kiếm
- `/table`: Các components liên quan đến bảng dữ liệu
- `/pagination`: Các components phân trang
- `/header`: Các components tiêu đề
- `/media`: Các components media như uploader, viewer, etc.

Tham khảo các README.md trong các thư mục con để biết thêm chi tiết.

## FilterContainer Component

Component container tổng quát chứa các bộ lọc khác nhau thông qua các slots có tên.

### Cách sử dụng

```vue
<FilterContainer>
  <template #search>
    <SearchFilter
      v-model:search="search"
      search-placeholder="Search items..."
    />
  </template>
  
  <template #status>
    <StatusFilter
      v-model:modelValue="publishedFilter"
      :options="[
        { label: 'All Items', value: undefined },
        { label: 'Published', value: true },
        { label: 'Draft', value: false }
      ]"
    />
  </template>
  
  <template #pageSize>
    <PageSizeFilter
      v-model:modelValue="pageSize"
    />
  </template>
  
  <!-- Có thể thêm các bộ lọc tùy chỉnh khác sử dụng slot mặc định -->
  <CustomFilter v-model:value="customValue" />
</FilterContainer>
```

### Slots

- `search`: Slot cho bộ lọc tìm kiếm
- `status`: Slot cho bộ lọc trạng thái
- `pageSize`: Slot cho bộ lọc số lượng mục mỗi trang
- `default`: Slot mặc định cho các bộ lọc tùy chỉnh khác

## SearchFilter Component

Component lọc tìm kiếm.

### Props

- `search`: String - Giá trị tìm kiếm hiện tại
- `searchPlaceholder`: String - Placeholder cho input tìm kiếm

### Events

- `update:search`: Emitted khi giá trị tìm kiếm thay đổi

## StatusFilter Component

Component lọc theo trạng thái.

### Props

- `modelValue`: Boolean | undefined - Giá trị trạng thái hiện tại
- `options`: Array - Danh sách các tùy chọn trạng thái (mặc định là All/Published/Draft)

### Events

- `update:modelValue`: Emitted khi giá trị trạng thái thay đổi

## PageSizeFilter Component

Component chọn số lượng mục hiển thị trên mỗi trang.

### Props

- `modelValue`: Number - Số lượng mục hiện tại
- `options`: Array - Danh sách các tùy chọn số lượng mục (mặc định là 10/25/50)

### Events

- `update:modelValue`: Emitted khi số lượng mục thay đổi 