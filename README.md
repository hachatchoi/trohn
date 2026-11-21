# TROHN — Web cho thuê trọ dành cho sinh viên Hà Nội

React và TypeScript hiển thị dữ liệu từ API Spring Boot. Backend dùng JDBC với MySQL 8. Trang công khai chỉ liệt kê tin đã duyệt của chủ trọ đang hoạt động. Người dùng mới có thể đăng ký làm khách thuê hoặc chủ trọ tại `/dang-ky`.

## Chạy bản demo bằng Docker Compose

Bật Docker Desktop ở chế độ Linux containers. Mở terminal rồi chạy các lệnh sau trên máy mới.

```powershell
git clone https://github.com/hachatchoi/trohn.git
cd trohn
docker compose up -d --build
```

Mở [website](http://127.0.0.1:5175/) sau khi API khởi động. Xem nhật ký bằng `docker compose logs --tail=50 db api web`.

Lần khởi tạo đầu tiên, MySQL nạp schema, 25 tin phòng và 125 ảnh từ `Database/SQL`. Đăng nhập bằng [tài khoản demo](#tài-khoản-và-tin-đầu-tiên) để thử quyền quản trị hoặc chủ trọ. Đăng ký khách thuê tại `/dang-ky` để lưu phòng và đặt lịch. Dữ liệu phát sinh lưu trong volume riêng của Docker trên từng máy. Dùng `docker compose down` để dừng và giữ dữ liệu, rồi `docker compose up -d` để chạy lại.

Khi chia sẻ qua Git, giữ cùng cấp `compose.yaml`, `backend/`, `frontend/` và `Database/SQL/`. Các tệp SQL tái tạo bộ dữ liệu mẫu trên máy của bạn học. Dữ liệu của bản chạy Windows và volume Docker hiện tại nằm riêng trên máy người dùng.

## Chạy bản chính trên máy Windows (25 phòng, 125 ảnh)

Database `trohn` dùng cổng 33317. Dữ liệu nằm trong `backend/mysql-data`. MySQL trên Windows dùng liên kết `%LOCALAPPDATA%\TrohnMySQLData` để đọc được đường dẫn có dấu. Khi khởi động lại máy, chạy lần lượt trong ba cửa sổ PowerShell, bắt đầu từ thư mục `trohn`.

1. Khởi động MySQL đã khởi tạo trên máy này.

   ```powershell
   & 'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqld.exe' --no-defaults "--datadir=$env:LOCALAPPDATA/TrohnMySQLData" --bind-address=127.0.0.1 --port=33317 --mysqlx=OFF --console
   ```

2. Khởi động API bằng Java 17 trở lên từ thư mục backend. Khi đổi mã Java, chạy `mvn package` trước.

   ```powershell
   cd backend
   java -jar target/trohn-api-1.0.0.jar
   ```

3. Chạy giao diện bằng Node 22 trở lên. Trên máy mới, chạy `pnpm install` trước.

   ```powershell
   cd frontend
   pnpm dev --port 5176 --strictPort
   ```

Mở [Trohn](http://127.0.0.1:5176/). Vite chuyển yêu cầu `/api` tới cổng 18087. Có thể kiểm tra kết nối bằng [API dữ liệu](http://127.0.0.1:5176/api/state).

## Cấu hình MySQL khác

Trên schema trống, chạy các script `01_create_tables.sql`, `02_create_indexes.sql` và `05_photo_content.sql` trong thư mục `Database/SQL` của workspace. Script `03_sample_data.sql` dành riêng cho minh họa. Backend đọc `DB_URL`, `DB_USER` và `DB_PASSWORD` từ môi trường hoặc `backend/.env`. Tài khoản ứng dụng cần SELECT, INSERT, UPDATE, DELETE trên schema. File cấu hình cục bộ và dữ liệu MySQL được Git bỏ qua.

## Tài khoản và tin đầu tiên

Khi Docker khởi tạo volume mới, có sẵn một tài khoản quản trị và năm tài khoản chủ trọ. Mỗi chủ quản lý năm phòng. Các mật khẩu dưới đây dành cho bản demo chạy trên localhost.

| Vai trò | Email demo | Mật khẩu demo |
|---|---|---|
| Quản trị | `admin@example.invalid` | `TrohnDemo-Admin!` |
| Chủ trọ 1 | `owner-2@example.invalid` | `TrohnDemo-Owner1!` |
| Chủ trọ 2 | `owner-3@example.invalid` | `TrohnDemo-Owner2!` |
| Chủ trọ 3 | `owner-4@example.invalid` | `TrohnDemo-Owner3!` |
| Chủ trọ 4 | `owner-5@example.invalid` | `TrohnDemo-Owner4!` |
| Chủ trọ 5 | `owner-6@example.invalid` | `TrohnDemo-Owner5!` |

- Người dùng đăng ký trên web và đăng nhập bằng email. Mật khẩu dùng BCrypt. API kiểm tra quyền theo phiên lưu trong MySQL.
- Để cấp quyền quản trị lần đầu, đăng ký **một tài khoản khách thuê mới dành riêng cho quản trị**. Người vận hành kết nối đúng schema bằng tài khoản quản trị database, kiểm tra ID và email rồi thực hiện câu lệnh bên dưới với email thực. Đăng xuất và đăng nhập lại để mở trang quản trị. Website không cấp quyền admin qua biểu mẫu đăng ký.

  ```sql
  UPDATE TaiKhoan SET vaiTro='ADMIN', version=version+1
  WHERE email='<email quản trị đã xác minh>' AND vaiTro='KHACH_THUE';
  ```

- Chủ trọ đăng tin kèm ảnh từ `/chu-tro/tin-dang/them`. Tin chờ duyệt nằm tại `/admin/tin-dang`. Sau khi duyệt, khách thuê có thể xem phòng, lưu yêu thích và đặt lịch. Tọa độ là tùy chọn. Bản đồ chỉ ghim những phòng có tọa độ.
- Bản Docker dựng từ repository có sẵn danh mục phòng và cơ sở trường. Khi có bản ghi cơ sở với tọa độ, giao diện tính khoảng cách đường chim bay để lọc phòng gần trường.

