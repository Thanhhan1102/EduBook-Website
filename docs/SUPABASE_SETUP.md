# Kết nối EduBook với Supabase

Dự án Supabase: `jhhpygtddakqcdjthuxq`. Website chưa thể ghi dữ liệu thật cho đến khi bạn hoàn thành các bước dưới đây. Chỉ dùng **publishable key** (`sb_publishable_...`) trong Vercel; không dùng secret key hoặc service role key.

1. Trong [Supabase Dashboard](https://supabase.com/dashboard/project/jhhpygtddakqcdjthuxq), mở **SQL Editor** → **New query**. Dán và chạy toàn bộ nội dung [`supabase/migrations/202609240001_edubook.sql`](../supabase/migrations/202609240001_edubook.sql). File này tạo hồ sơ sinh viên, danh mục sách, đơn đặt sách, quyền RLS và hàm `place_order` kiểm tra giá/tồn kho trực tiếp trong database. Nếu bạn đã chạy bản migration cũ trước khi mở đăng ký cho mọi email, chỉ cần chạy thêm [`supabase/migrations/202609250001_allow_all_emails.sql`](../supabase/migrations/202609250001_allow_all_emails.sql); không chạy lại toàn bộ migration đầu.
   Sau đó, với cả dự án mới và dự án đang chạy, mở query mới và chạy [`supabase/migrations/202609250002_admin_dashboard.sql`](../supabase/migrations/202609250002_admin_dashboard.sql). Migration này thêm SubAdmin, trạng thái khóa sinh viên, danh sách tài khoản cho dashboard và quyền RLS tương ứng. Tiếp tục chạy [`supabase/migrations/202609250003_book_covers.sql`](../supabase/migrations/202609250003_book_covers.sql) để tạo bucket và policy ảnh bìa. Chạy đúng thứ tự trước khi dùng dashboard và tải ảnh.
2. Tạo query mới, dán và chạy [`supabase/seed.sql`](../supabase/seed.sql). File nạp 47 sách mẫu, phủ đủ 14 khoa. Chạy lại không làm mất sách hoặc đặt lại tồn kho hiện có. Khi sửa danh sách mẫu trong `assets/js/book-store.js`, chạy `node scripts/generate-seed.cjs` để tạo lại SQL.
3. Trong Supabase, mở **Project Settings → API Keys** (hoặc **Connect**) và sao chép **publishable key**. Trong Vercel project EduBook, mở **Settings → Environment Variables**, thêm `SUPABASE_PUBLISHABLE_KEY` với giá trị đó cho Production (và Preview/Development nếu cần). Redeploy sau khi lưu. `/api/config` sẽ trả về URL dự án và publishable key cho frontend. Đây là key công khai; RLS trong database kiểm soát dữ liệu từng người.
4. Trong Supabase **Authentication → URL Configuration**, đặt **Site URL** là `https://edubook-iuh.vercel.app` và thêm **Redirect URL** chính xác `https://edubook-iuh.vercel.app/login.html`. Không để Site URL là `http://localhost:3000` khi dùng website đã triển khai. EduBook gửi link xác nhận về URL Vercel này theo mặc định, kể cả khi đăng ký từ máy local. Nếu đổi domain sau này, cập nhật hai URL trong Supabase và đặt biến Vercel `EDUBOOK_AUTH_REDIRECT_URL=https://<domain-moi>/login.html`, rồi redeploy. Trong **Authentication → Email Templates → Confirm signup**, giữ link `{{ .ConfirmationURL }}` để Supabase xử lý xác nhận trước khi chuyển về website. Trong **Authentication → Providers → Email**, bật **Confirm Email**; nếu tắt, Supabase có thể tự đánh dấu email đã xác nhận và cấp phiên đăng nhập ngay.
5. Mở `/api/config` trên bản Vercel; khi cấu hình đúng sẽ thấy JSON có `url` và `publishableKey`. Mở `/register.html`, tạo tài khoản bằng email hợp lệ (`@student.iuh.edu.vn`, Gmail, Outlook...), xác nhận email nếu được yêu cầu, rồi đăng nhập. Website vẫn dùng email/mật khẩu, không cần bật Google OAuth. Đặt thử một sách ở `/catalog.html` và kiểm tra đơn trong **Table Editor → orders, order_items**.

## Tạo tài khoản quản trị

Đăng ký một tài khoản qua `/register.html` trước. Sau đó chạy trong SQL Editor, thay địa chỉ email trong câu lệnh:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin-cua-ban@example.com');
```

Đăng xuất và đăng nhập lại. Tài khoản đó sẽ vào `/admin.html`. Tại tab **Quản lý SubAdmin**, nhập email một tài khoản đã đăng ký để cấp quyền; SubAdmin dùng cùng trang đăng nhập, quản lý sách, đơn và tài khoản sinh viên, nhưng không thể cấp hoặc thu hồi quyền SubAdmin. Người tự đăng ký luôn được gán vai trò `student`; giao diện không thể tự nâng quyền.

## Dữ liệu và kiểm tra

- Hồ sơ gồm họ tên, mã sinh viên, khoa và email xác thực qua Supabase Auth. Số điện thoại, tên liên hệ và nơi nhận được lưu cùng đơn đặt sách.
- Khi sinh viên gửi đơn, hàm `place_order` khóa hàng tồn, lấy giá từ database, tạo đơn và trừ tồn kho trong một transaction. Nếu một sách hết hàng, toàn bộ yêu cầu bị hủy và người dùng thấy lỗi.
- Khi admin chuyển yêu cầu sang **Đã hủy**, tồn kho được hoàn lại. Đơn đã hoàn tất hoặc đã hủy không thể đổi trạng thái tiếp.
- Website chỉ ghi **yêu cầu đặt sách** và số cọc dự kiến; chưa thu tiền hoặc kết nối cổng thanh toán online.
- Sinh viên chỉ đọc được hồ sơ và đơn của chính mình. Admin chính và SubAdmin có thể xem đơn, cập nhật trạng thái, quản lý sách và khóa/mở khóa tài khoản sinh viên. Chỉ admin chính được cấp/thu hồi quyền SubAdmin. Tài khoản sinh viên bị khóa không thể đăng nhập vào website hay tạo yêu cầu đặt sách. Khách chưa đăng nhập chỉ xem sách đang hoạt động.
- Tài khoản demo trước đây lưu trong `localStorage` **không tự chuyển** sang Supabase. Hãy đăng ký lại tài khoản thật. Không dùng email/mật khẩu demo cũ trên bản triển khai.
- Bảng sách chỉ lưu URL ảnh bìa trong `image_url`; file tải lên nằm trong Supabase Storage.

## Ảnh bìa giáo trình

Migration `202609250003_book_covers.sql` tạo bucket Storage công khai `book-covers`, giới hạn ảnh JPG/PNG/WebP tối đa 5 MB. Chỉ admin chính và SubAdmin đang hoạt động được tải ảnh lên; mỗi người tải vào thư mục theo ID tài khoản của mình. Ảnh bìa cần công khai để catalog hiển thị cho khách chưa đăng nhập. Bảng `books` chỉ lưu URL trong `image_url`, còn file ảnh nằm trong Supabase Storage.

Trong tab **Giáo trình**, chọn tệp ảnh khi thêm sách hoặc bấm **Đổi ảnh** ở sách hiện có. Có thể tiếp tục dùng URL ảnh bên ngoài nếu chưa tải tệp. Không dùng bucket công khai này cho ảnh giấy tờ hoặc dữ liệu cá nhân.

Nếu `/api/config` trả 503, kiểm tra tên biến môi trường và redeploy. Nếu đăng ký báo lỗi database, xác nhận migration đã chạy trước bước đăng ký.

Nếu link xác nhận đưa về `http://localhost:3000` hoặc báo `otp_expired`, sửa Site URL/Redirect URL như bước 4, rồi dùng **Gửi lại email xác nhận** trên trang đăng ký hoặc đăng nhập. Link cũ đã hết hạn hoặc đã dùng không thể tái sử dụng; chỉ mở link trong email mới nhất. Trang đăng nhập hiển thị kết quả xác nhận và cho phép gửi lại link khi gặp lỗi.
