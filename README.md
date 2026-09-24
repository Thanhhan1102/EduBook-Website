# IUH EduBook

Website mua và thuê giáo trình cho sinh viên IUH. Frontend là HTML/CSS/JavaScript tĩnh; Supabase quản lý tài khoản, hồ sơ, sách và yêu cầu đặt sách. Vercel phục vụ trang web và `/api/config`.

## Thiết lập Supabase

Làm theo [hướng dẫn từng bước](docs/SUPABASE_SETUP.md). Cần chạy `supabase/migrations/202609240001_edubook.sql`, nạp `supabase/seed.sql`, sau đó đặt `SUPABASE_PUBLISHABLE_KEY` trong Vercel và redeploy. Không đưa secret key hoặc service role key vào mã nguồn hay frontend.

## Chạy local

Khi đã liên kết repo với Vercel và có biến môi trường Development:

```powershell
npx vercel dev
```

`python -m http.server 4173` chỉ dùng để xem giao diện và sách mẫu; server tĩnh này không chạy `/api/config`, vì vậy đăng nhập và đặt sách sẽ báo chưa cấu hình.

## Cấu trúc

- `index.html`: trang chủ.
- `catalog.html`: danh mục bán/thuê, giỏ hàng và yêu cầu đặt sách.
- `login.html`, `register.html`, `profile.html`: tài khoản sinh viên và quản trị.
- `admin.html`: thêm/gỡ sách, xem và cập nhật trạng thái yêu cầu.
- `assets/js/backend.js`: client Supabase và các thao tác dữ liệu.
- `api/config.js`: cung cấp URL và publishable key cho browser từ biến môi trường Vercel.
- `supabase/migrations/`: schema, RLS và hàm đặt sách có khóa tồn kho.
- `supabase/seed.sql`: 47 sách mẫu, có thể chạy lại mà không ghi đè sách/tồn kho hiện có.

Ảnh sách mẫu lấy từ prototype và Unsplash. Thay bằng ảnh được phép sử dụng trước khi vận hành thật.
