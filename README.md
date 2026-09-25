# IUH EduBook

Website mua và thuê giáo trình cho sinh viên IUH. Frontend là HTML/CSS/JavaScript tĩnh; Supabase quản lý tài khoản, hồ sơ, sách và yêu cầu đặt sách. Vercel phục vụ trang web và `/api/config`.

Link xác nhận email mặc định quay về `https://edubook-iuh.vercel.app/login.html`. Supabase **Authentication → URL Configuration** cần có Site URL `https://edubook-iuh.vercel.app` và Redirect URL `https://edubook-iuh.vercel.app/login.html`; xem hướng dẫn bên dưới nếu đang gặp link `localhost:3000`.

## Thiết lập Supabase

Làm theo [hướng dẫn từng bước](docs/SUPABASE_SETUP.md). Dự án mới cần chạy `supabase/migrations/202609240001_edubook.sql`, tiếp đến `supabase/migrations/202609250002_admin_dashboard.sql`, rồi nạp `supabase/seed.sql`. Nếu đã chạy migration cũ giới hạn email IUH, chạy thêm `supabase/migrations/202609250001_allow_all_emails.sql` trước migration dashboard. Đặt `SUPABASE_PUBLISHABLE_KEY` trong Vercel và redeploy. Đăng ký hỗ trợ email hợp lệ từ nhiều nhà cung cấp bằng mật khẩu; không cần Google OAuth. Không đưa secret key hoặc service role key vào mã nguồn hay frontend.

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
- `admin.html`: dashboard theo tab, quản lý sách, đơn, sinh viên và SubAdmin; danh sách sách có chọn 20/50/100 cuốn mỗi trang.
- `assets/js/backend.js`: client Supabase và các thao tác dữ liệu.
- `api/config.js`: cung cấp URL và publishable key cho browser từ biến môi trường Vercel.
- `supabase/migrations/`: schema, RLS và hàm đặt sách có khóa tồn kho.
- `supabase/seed.sql`: 47 sách mẫu, có thể chạy lại mà không ghi đè sách/tồn kho hiện có.

Ảnh sách mẫu lấy từ prototype và Unsplash. Thay bằng ảnh được phép sử dụng trước khi vận hành thật.
