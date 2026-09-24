# Deploy và dữ liệu

## Vercel

Dự án này là static HTML, CSS và JavaScript. Khi import repository trên Vercel, dùng:

- Framework Preset: Other
- Root Directory: `./`
- Build Command: để trống
- Output Directory: để trống
- Install Command: để trống

`index.html` nằm ngay thư mục gốc nên Vercel sẽ phục vụ trang chủ tại `/`. Sau lần deploy đầu, mọi push vào `main` sẽ tạo production deployment mới.

## Supabase

Không lưu ảnh bìa sách dưới dạng binary trong PostgreSQL. Tạo bucket Storage `book-covers` và lưu metadata sách trong bảng `books`.

Ví dụ cột bảng `books`: `id`, `title`, `author`, `faculty`, `course_code`, `price`, `cover_path`, `description`, `stock`, `created_at`.

`cover_path` chỉ là đường dẫn như `it/ctdl-giai-thuat.webp`; frontend tạo URL ảnh từ Supabase Storage. Bucket có thể public cho ảnh bìa, còn tài liệu giáo trình cần bucket private và Signed URL. Dùng WebP, chiều rộng khoảng 600px và giới hạn dung lượng upload để catalogue tải nhanh.
