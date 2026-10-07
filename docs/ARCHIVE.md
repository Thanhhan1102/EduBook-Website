# Bản lưu trữ EduBook · 07/10/2026

Chốt phạm vi demo hiện tại, không cần thêm tính năng để lưu trữ mã nguồn. Tag `archive-2026-10-07` xác định phiên bản chốt. Website và Supabase vẫn tiếp tục hoạt động; đóng gói source không thay đổi trạng thái các dịch vụ.

## Gói lưu trên máy

Thư mục: `H:/AI-project/WebEdubook/archives/EduBook-2026-10-07/`.

| Tệp | Nội dung |
| --- | --- |
| `EduBook-Website-source.zip` | Mã nguồn đã commit, migrations, seed, tài liệu, logo và QR. |
| `EduBook-Website-main.bundle` | Lịch sử Git nhánh `main` và tag chốt; có thể clone mà không cần GitHub. |
| `reference-assets.zip` | Prototype Stitch, ba bản phân tích thiết kế và logo ban đầu. Đây là tài liệu tham khảo cũ, không phải website để triển khai. |
| `ARCHIVE_INFO.md` | Commit chính xác, kích thước/SHA256 từng gói và kết quả kiểm tra đóng gói. |

`note.md`, `.env`, `.vercel`, dữ liệu dịch vụ và tài khoản thật không nằm trong gói source. Gói reference chỉ lưu nội bộ: demo cũ có thể chứa tài khoản mẫu, không dùng làm thông tin đăng nhập hiện tại.

## Khôi phục source

Giải nén `EduBook-Website-source.zip` để xem/chạy source không kèm lịch sử Git, hoặc dùng bundle:

```powershell
git bundle verify .\EduBook-Website-main.bundle
git clone -b main .\EduBook-Website-main.bundle .\EduBook-restored
Set-Location .\EduBook-restored
git show archive-2026-10-07 --stat
git remote set-url origin https://github.com/Thanhhan1102/EduBook-Website.git
```

Bundle không phụ thuộc GitHub còn tồn tại. Sau khi khôi phục, xem `README.md`, `docs/DEPLOYMENT.md` và `docs/SUPABASE_SETUP.md` để chạy lại. Với Supabase mới, cần cập nhật project URL trong `api/config.js`, khóa công khai, Auth redirect và các URL ảnh Storage. QR hiện dẫn đến domain Vercel cũ; tạo lại nếu đổi domain.

## Các phần cần lưu riêng để khôi phục dữ liệu đang chạy

Chưa xuất các phần dưới đây trong lần đóng gói này vì chưa có phiên quản trị dịch vụ. Mã nguồn/migrations không thay thế backup dữ liệu thực tế.

- [ ] Supabase database: schema, functions, policies, dữ liệu `profiles`, `books`, `orders`, `order_items`, `support_messages`; bảo đảm phương thức backup có giữ Auth users và liên kết user ID. Chỉ xuất CSV các bảng public sẽ không đủ để khôi phục tài khoản.
- [ ] Supabase Storage: tải toàn bộ tệp trong bucket `book-covers`; lưu tên/đường dẫn tệp, bucket và policies. Backup database không chứa nội dung tệp Storage.
- [ ] Supabase settings: Confirm Email, Site URL, Redirect URLs, email template/SMTP nếu có, extensions và job `edubook-expire-book-holds`.
- [ ] Vercel settings: project/domain, Git integration, `SUPABASE_PUBLISHABLE_KEY` và `EDUBOOK_AUTH_REDIRECT_URL` nếu đang dùng.
- [ ] Cất `note.md` và thông tin truy cập quản trị trong nơi riêng có bảo vệ; không đưa vào GitHub hoặc ZIP chia sẻ.
- [ ] Sao chép gói archive sang một ổ khác hoặc nơi lưu trữ riêng. Kiểm tra SHA256 sau khi sao chép.

Tham khảo quy trình [backup/restore database của Supabase](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) và [tải tệp Storage](https://supabase.com/docs/guides/storage/management/download-objects). Ghi ngày backup và project ref cùng mỗi bản xuất vì dữ liệu live tiếp tục thay đổi sau ngày chốt source.

## Kiểm tra trước khi dùng lại

1. ZIP không lỗi và SHA256 khớp `ARCHIVE_INFO.md`; bundle vượt qua `git bundle verify`.
2. Cấu hình Vercel/Supabase đúng project; `/api/config` trả cấu hình công khai.
3. Dùng tài khoản test xác nhận email → đăng nhập → đặt sách → kiểm tra tồn kho, cọc bằng 0, hạn giữ 24 giờ và chat hai phía. Kiểm tra phân quyền sinh viên/SubAdmin/Admin.
4. `select public.book_holds_ready();` trả `true`; Cron đang hoạt động. Dùng checklist chức năng đầy đủ trong README.

Lần chốt này kiểm tra trang catalog và endpoint cấu hình đang phản hồi, Git sạch/đồng bộ và tính toàn vẹn các gói lưu trữ. Không chạy lại giao dịch bằng tài khoản đăng nhập hoặc thử khôi phục database live. Repo chưa có test suite tự động.
