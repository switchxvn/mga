# Common Components

Tập hợp các components dùng chung trong toàn bộ ứng dụng Admin để đảm bảo tính nhất quán của giao diện.

## Cấu trúc thư mục

- `/filter`: Các components filter và tìm kiếm
   - FilterContainer: Container cho các filter
   - SearchFilter: Component tìm kiếm
   - StatusFilter: Component lọc trạng thái
   - PageSizeFilter: Component chọn số lượng mục trên trang

- `/table`: Các components liên quan đến bảng dữ liệu
   - DataTable: Bảng dữ liệu tùy biến với nhiều tính năng

- `/pagination`: Các components phân trang
   - Pagination: Component phân trang

- `/header`: Các components tiêu đề
   - PageHeader: Component tiêu đề trang

- `/media`: Các components media
   - MediaUploader: Component upload hình ảnh

## Quy tắc sử dụng

1. **Nhất quán**: Sử dụng các common components này trong toàn bộ ứng dụng để đảm bảo giao diện nhất quán
2. **Mở rộng, không sửa đổi**: Nếu cần thêm tính năng, hãy mở rộng từ components này thay vì chỉnh sửa trực tiếp
3. **Tái sử dụng**: Tận dụng các slots và props để tùy chỉnh components thay vì tạo mới
4. **Tổ chức**: Đặt các components mới vào thư mục tương ứng theo chức năng

Tham khảo các README.md trong các thư mục con để biết thêm chi tiết về từng component. 