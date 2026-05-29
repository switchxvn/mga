# Post Reviews Design

## Goal

Cho phép người dùng gửi review trực tiếp trên trang chi tiết bài viết, đồng thời hiển thị danh sách review đã duyệt của đúng bài viết đó trong cùng khu vực.

Mục tiêu chính:

- tái sử dụng hệ thống `reviews` hiện có thay vì tạo domain mới
- gắn mỗi review với một `post` cụ thể
- giữ moderation flow hiện tại: frontend submit tạo `PENDING`, chỉ review `ACTIVE` mới hiển thị công khai

## Current State

Repo hiện đã có review stack đầy đủ cho `service` và `product`:

- backend có entity `Review`, admin service, frontend service, và TRPC router public/admin
- frontend đã có `ServiceReviewsSection`, `ProductReviewsSection`, form submit review, và payload composable để tải aggregate + latest reviews
- trang chi tiết bài viết hiện có nội dung, comments, related posts, SEO Article schema, nhưng chưa có review section

Điểm còn thiếu là `Review` chưa có quan hệ với `Post`, nên không thể query hoặc submit review theo bài viết.

## Recommended Approach

Mở rộng `Review` hiện tại bằng `postId` nullable và quan hệ `Review -> Post`.

Khuyến nghị này giữ rủi ro thấp nhất vì:

- tận dụng được moderation, translation, admin CRUD, và public list logic đã có
- tránh nhân đôi một module `PostReview` gần giống hệt `Review`
- giúp frontend bài viết đi theo cùng pattern đã chạy ổn ở `service/product`

## Architecture

### 1. Data model

`Review` sẽ có thêm:

- cột `post_id` nullable
- quan hệ `ManyToOne` tới `Post`

`Post` sẽ có thêm:

- quan hệ `OneToMany` tới `Review`

Mỗi review công khai chỉ thuộc tối đa một trong các target hiện có:

- `productId`
- `serviceId`
- `postId`

Feature này không thêm validation cứng ở DB để ép exclusive relation, nhưng public submit flow cho post sẽ chỉ gửi `postId`.

### 2. Public review submission

Public `submitReviewSchema` sẽ được mở rộng để nhận `postId`.

Khi submit review từ trang bài viết:

- payload gửi `postId`
- không gửi `serviceTypeId`
- review được tạo với:
  - `status = PENDING`
  - `featured = false`

Hành vi này phải nhất quán với luồng review `service/product`.

### 3. Public review queries

Public `review.list` cần hỗ trợ filter theo `postId`.

Frontend service cần thêm aggregate riêng cho bài viết:

- `getPostAggregateRating(postId)`

Public output cho bài viết chỉ lấy:

- review có `status = ACTIVE`
- đúng `postId`
- translation theo locale hiện tại

### 4. Frontend post detail integration

Trang `apps/frontend/src/pages/posts/[slug].vue` sẽ tải thêm payload review trong SSR path:

- aggregate rating của bài viết
- 3 review mới nhất của bài viết

UI sẽ thêm một section review ngay dưới nội dung bài viết, theo pattern gần với `ProductReviewsSection`/`ServiceReviewsSection`:

- summary average rating + total reviews
- tối đa 3 review approved gần nhất
- form gửi review với `postId`
- success/error state sau submit

Không mở rộng sang phân trang review trong phạm vi này.

### 5. SEO handling

Trang bài viết hiện đã build `Article` schema.

Trong phạm vi này, có thể giữ nguyên Article schema nếu việc chèn `review`/`aggregateRating` đòi hỏi thay đổi lớn ở helper SEO dùng chung. Ưu tiên feature runtime trước:

- submit review
- review list
- aggregate hiển thị trên UI

Nếu helper hiện có cho article schema dễ mở rộng, có thể bổ sung sau trong cùng task; nếu không, để ngoài scope của slice này.

## Error Handling

- Nếu query review aggregate/list lỗi, trang bài viết không được hỏng toàn bộ render.
- Nếu submit lỗi, form hiển thị error state cục bộ.
- Review `PENDING` vừa submit không được tự chèn ngay vào list public.

## Testing Strategy

Ưu tiên test các hành vi sau:

- router schema chấp nhận `postId` và không ép `serviceTypeId`
- create input giữ `postId` và `PENDING`
- frontend review service có thể filter theo `postId` và aggregate đúng theo `postId`
- payload trang bài viết tải aggregate + latest post reviews khi tìm thấy post
- payload bỏ qua review queries khi post không tồn tại
- form submit gửi `postId`

## Out of Scope

- tạo page review riêng cho bài viết
- pagination hoặc filter nâng cao cho review trong post detail
- migration cleanup cho dữ liệu review cũ
- ép DB constraint để chặn mọi tổ hợp `productId/serviceId/postId`
- refactor lớn helper SEO cho Article reviews nếu không cần thiết

## Success Criteria

Hoàn thành khi:

- user có thể gửi review từ trang chi tiết bài viết
- review mới tạo ở trạng thái `PENDING`
- admin duyệt xong thì review xuất hiện lại đúng ở bài viết tương ứng
- trang bài viết hiển thị aggregate + danh sách review approved của chính bài viết đó
- review của `service/product` không bị lẫn vào post review queries
