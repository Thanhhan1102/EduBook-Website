# IUH EduBook

Website tĩnh cho dịch vụ mua và thuê giáo trình IUH. Repo không cần package hay build tool, có thể deploy trực tiếp lên Vercel.

## Chạy local

Từ thư mục repository, chạy:

```powershell
python -m http.server 4173
```

Sau đó mở `http://127.0.0.1:4173`.

## Luồng đã có

- `index.html` là Home: giới thiệu hai dịch vụ và điều hướng sang kho sách.
- `catalog.html` là Subtab Giáo trình độc lập, chuyển đổi giữa **Giáo trình bán** và **Giáo trình thuê**.
- Tìm kiếm, chọn khoa ở thanh tìm kiếm, lọc theo tình trạng, sắp xếp theo giá và lưu giáo trình.
- Nút **Chi tiết** mở modal trong cùng trang theo yêu cầu; modal có thể đổi Mua/Thuê.
- Thêm vào giỏ, xóa khỏi giỏ và thông báo demo khi tiếp tục đặt sách.
- `login.html` dùng chung cho sinh viên và quản trị viên. `register.html` cho phép tạo tài khoản sinh viên demo. Demo: `user@iuh.edu.vn` / `123456`, `admin@iuh.edu.vn` / `admin123`.
- `admin.html` cho phép thêm, gỡ và khôi phục giáo trình mẫu. Dữ liệu và phiên đăng nhập được lưu bằng `localStorage` của trình duyệt.
- Thêm sách vào giỏ và tiếp tục đặt sách yêu cầu đăng nhập hoặc đăng ký tài khoản.

## Cấu trúc

- `index.html`: Home độc lập.
- `catalog.html`: trang catalog/Subtab Giáo trình.
- `login.html`: đăng nhập dùng chung cho hai vai trò.
- `register.html`: đăng ký tài khoản sinh viên demo.
- `profile.html`: xem thông tin cá nhân và trạng thái tài khoản.
- `admin.html`: quản lý danh sách giáo trình cho quản trị viên.
- `assets/css/styles.css`: design system, responsive layout và modal/drawer.
- `assets/js/`: logic catalog, xác thực, admin và các tương tác UI.

Các ảnh minh họa lấy từ các prototype đã có và Unsplash; cần thay bằng ảnh có bản quyền/asset nội bộ trước khi triển khai thật.
