# Kết nối EduBook với Supabase

Dự án Supabase: `jhhpygtddakqcdjthuxq`. Website chưa thể ghi dữ liệu thật cho đến khi bạn hoàn thành các bước dưới đây. Chỉ dùng **publishable key** (`sb_publishable_...`) trong Vercel; không dùng secret key hoặc service role key.

1. Trong [Supabase Dashboard](https://supabase.com/dashboard/project/jhhpygtddakqcdjthuxq), mở **SQL Editor** → **New query**. Dán và chạy toàn bộ nội dung [`supabase/migrations/202609240001_edubook.sql`](../supabase/migrations/202609240001_edubook.sql). File này tạo hồ sơ sinh viên, danh mục sách, đơn đặt sách, quyền RLS và hàm `place_order` kiểm tra giá/tồn kho trực tiếp trong database. Nếu bạn đã chạy bản migration cũ trước khi mở đăng ký cho mọi email, chỉ cần chạy thêm [`supabase/migrations/202609250001_allow_all_emails.sql`](../supabase/migrations/202609250001_allow_all_emails.sql); không chạy lại toàn bộ migration đầu.
   Sau đó, với cả dự án mới và dự án đang chạy, mở query mới và chạy [`supabase/migrations/202609250002_admin_dashboard.sql`](../supabase/migrations/202609250002_admin_dashboard.sql). Migration này thêm SubAdmin, trạng thái khóa sinh viên, danh sách tài khoản cho dashboard và quyền RLS tương ứng. Tiếp tục chạy [`supabase/migrations/202609250003_book_covers.sql`](../supabase/migrations/202609250003_book_covers.sql) để tạo bucket và policy ảnh bìa, rồi chạy [`supabase/migrations/202609250004_rental_rules_free_deposit.sql`](../supabase/migrations/202609250004_rental_rules_free_deposit.sql) để áp dụng quy tắc sách thuê và cọc miễn phí. Bật **Integrations → Cron** trong Supabase và chạy [`supabase/migrations/202609250005_book_holds.sql`](../supabase/migrations/202609250005_book_holds.sql) để giữ sách tối đa 24 giờ. Tiếp theo chạy [`supabase/migrations/202609260001_support_chat.sql`](../supabase/migrations/202609260001_support_chat.sql) để lưu lịch sử chat hỗ trợ, rồi [`supabase/migrations/202609260002_free_deposit_orders.sql`](../supabase/migrations/202609260002_free_deposit_orders.sql) để xóa mức cọc cũ. Chạy đúng thứ tự trước khi dùng dashboard và đặt sách.
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
- Đơn mới được giữ sách 24 giờ kể từ lúc tạo. Supabase Cron kiểm tra mỗi phút: đơn còn ở **Chờ xác nhận**, **Đã xác nhận** hoặc **Sẵn sàng nhận** khi hết hạn sẽ tự chuyển sang **Đã hủy**, ghi `expired_at` và hoàn tồn kho đúng một lần. Đơn **Hoàn tất** không bị hủy. Hồ sơ sinh viên và tab **Yêu cầu đặt** của admin hiện đồng hồ cùng thông báo trong website; hai trang tự tải lại trạng thái mỗi phút. Đây là thông báo trong website, chưa gửi email hoặc push.
- Đơn còn mở tại thời điểm chạy migration giữ sách nhận một khoảng giữ 24 giờ mới; đơn đã hoàn tất hoặc hủy giữ nguyên trạng thái. Để kiểm tra job, chạy `select jobname, schedule, active from cron.job where jobname = 'edubook-expire-book-holds';` trong SQL Editor.
- Website từ chối tạo đơn mới nếu migration giữ sách hoặc job Cron chưa được kích hoạt, tránh hứa giữ 24 giờ khi database chưa thể tự hoàn tồn kho.
- Nút **Liên hệ hỗ trợ** trên Home và catalog mở hộp chat. Sinh viên cần đăng nhập; tin nhắn và lịch sử được lưu trong `support_messages` theo tài khoản. Admin chính và SubAdmin dùng tab **Hỗ trợ chat** để đọc và trả lời. Hai phía làm mới khi đang mở trang khoảng mỗi 10 giây; đây là chat lưu lịch sử, chưa gửi email hoặc push notification. Khách chưa đăng nhập chỉ thấy nút đăng nhập. Quyền RLS giới hạn sinh viên vào cuộc trò chuyện của chính họ và cho phép nhân viên hỗ trợ xem các cuộc trò chuyện.
- Website chỉ ghi **yêu cầu đặt sách**; cọc là **Miễn phí** (`deposit = 0`) với mọi đơn. Migration `202609260002` đưa mức cọc 20% cũ về 0 và thêm ràng buộc để không ghi cọc khác 0 về sau. Tổng tiền sách và các dòng sách trong đơn không đổi; trước đây cọc là ước tính riêng, không được cộng vào `total`. Chưa thu tiền hoặc kết nối cổng thanh toán online.
- Tab **Yêu cầu đặt** cho admin/SubAdmin lọc và tìm đơn, sắp xếp theo thời điểm hoặc hạn giữ sách, hiện tiến trình **Chờ xác nhận → Đã xác nhận → Sẵn sàng nhận → Hoàn tất**. Nút chính chuyển sang bước kế tiếp; menu đổi trạng thái cho phép sửa hoặc chuyển trực tiếp khi cần. Đơn đã hoàn tất/đã hủy không thể đổi tiếp. Hủy đơn sẽ hoàn tồn kho; đơn hết 24 giờ được Cron tự hủy.
- Sách có hình thức thuê chỉ được lưu với độ mới **Trên 80%**. Catalog không cho thuê các bản ghi cũ khác độ mới; admin cần kiểm tra và chọn lại độ mới hoặc chuyển thành **Chỉ bán** khi chỉnh sửa. Migration không tự thay đổi mô tả độ mới của sách cũ.
- Sinh viên chỉ đọc được hồ sơ và đơn của chính mình. Admin chính và SubAdmin có thể xem đơn, cập nhật trạng thái, quản lý sách và khóa/mở khóa tài khoản sinh viên. Chỉ admin chính được cấp/thu hồi quyền SubAdmin. Tài khoản sinh viên bị khóa không thể đăng nhập vào website hay tạo yêu cầu đặt sách. Khách chưa đăng nhập chỉ xem sách đang hoạt động.
- Tài khoản demo trước đây lưu trong `localStorage` **không tự chuyển** sang Supabase. Hãy đăng ký lại tài khoản thật. Không dùng email/mật khẩu demo cũ trên bản triển khai.
- Bảng sách chỉ lưu URL ảnh bìa trong `image_url`; file tải lên nằm trong Supabase Storage.

## Ảnh bìa giáo trình

Migration `202609250003_book_covers.sql` tạo bucket Storage công khai `book-covers`, giới hạn ảnh JPG/PNG/WebP tối đa 5 MB. Chỉ admin chính và SubAdmin đang hoạt động được tải ảnh lên; mỗi người tải vào thư mục theo ID tài khoản của mình. Ảnh bìa cần công khai để catalog hiển thị cho khách chưa đăng nhập. Bảng `books` chỉ lưu URL trong `image_url`, còn file ảnh nằm trong Supabase Storage.

Trong tab **Giáo trình**, chọn tệp ảnh khi thêm sách hoặc bấm **Chỉnh sửa** ở sách hiện có. Có thể tiếp tục dùng URL ảnh bên ngoài nếu chưa tải tệp. Không dùng bucket công khai này cho ảnh giấy tờ hoặc dữ liệu cá nhân.

Nếu `/api/config` trả 503, kiểm tra tên biến môi trường và redeploy. Nếu đăng ký báo lỗi database, xác nhận migration đã chạy trước bước đăng ký.

Nếu đặt sách báo lỗi **giữ sách 24 giờ**, kiểm tra trong SQL Editor của đúng project `jhhpygtddakqcdjthuxq`:

```sql
select to_regprocedure('public.book_holds_ready()') as readiness_function;
select extname from pg_extension where extname = 'pg_cron';
select jobname, schedule, active from cron.job
where jobname = 'edubook-expire-book-holds';
select public.book_holds_ready() as ready;
```

Nếu hàm không tồn tại, Cron chưa được bật, job không có hoặc `active = false`, bật **Integrations → Cron** rồi chạy lại toàn bộ [`202609250005_book_holds.sql`](../supabase/migrations/202609250005_book_holds.sql). Migration này có thể chạy lại; job cùng tên được cập nhật. Chỉ khi truy vấn cuối trả `true` website mới cho đặt sách. Nếu SQL trả `true` nhưng website vẫn báo lỗi, kiểm tra `/api/config` đang trỏ tới đúng project và tải lại bản Vercel mới nhất.

Nếu chạy lại migration chat báo `policy ... already exists`, đó là policy đã tạo từ lần chạy trước, không liên quan đến job giữ sách. Bản mới của [`202609260001_support_chat.sql`](../supabase/migrations/202609260001_support_chat.sql) có thể chạy lại để hoàn tất các policy còn thiếu.

Nếu đặt sách báo `orders_deposit_free_check`, database đã áp dụng ràng buộc cọc miễn phí nhưng hàm `place_order` vẫn là bản cũ tính cọc 20% (hoặc migration đầu đã được chạy lại sau bản miễn cọc). Mở SQL Editor và chạy lại **toàn bộ** [`202609250004_rental_rules_free_deposit.sql`](../supabase/migrations/202609250004_rental_rules_free_deposit.sql); file dùng `create or replace function` và `drop trigger if exists` nên có thể chạy lại. Không cần gỡ ràng buộc miễn cọc. Sau đó kiểm tra:

```sql
select pg_get_functiondef('public.place_order(jsonb,jsonb,text)'::regprocedure)
       like '%v_deposit := 0;%' as free_deposit_function;
```

Kết quả phải là `true`. Nếu `false`, đảm bảo bạn chạy cả file trên đúng project Supabase, không chỉ một phần SQL được chọn trong editor. Thử đặt lại sau khi hàm đã cập nhật; không cần thêm cọc vào tổng tiền sách.

Nếu link xác nhận đưa về `http://localhost:3000` hoặc báo `otp_expired`, sửa Site URL/Redirect URL như bước 4, rồi dùng **Gửi lại email xác nhận** trên trang đăng ký hoặc đăng nhập. Link cũ đã hết hạn hoặc đã dùng không thể tái sử dụng; chỉ mở link trong email mới nhất. Trang đăng nhập hiển thị kết quả xác nhận và cho phép gửi lại link khi gặp lỗi.
