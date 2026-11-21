# Database TROHN

Bản Word phục vụ báo cáo lần 2: [THIET_KE_DATABASE_TROHN.docx](THIET_KE_DATABASE_TROHN.docx). Cập nhật ngày 14/10/2026: 20 trang, gồm cấu trúc 12 bảng, PK/FK, 15 quan hệ tham chiếu, ràng buộc, chỉ mục và **ERD chân chim**. Đã xuất bằng Microsoft Word và kiểm tra các trang sửa đổi; không đồng nghĩa đã chạy schema trên MySQL.

ERD mới: [xem có phóng to](ERD/Xem_ERD.html), [PNG](ERD/TROHN_ERD_ChanChim.png), [SVG](ERD/TROHN_ERD_ChanChim.svg), [Draw.io](ERD/TROHN_ERD_ChanChim.drawio). File `ERD/TROHN_ERD.drawio` cũng đã chuyển sang bản chân chim. Mỗi bảng xuất hiện một lần trong hình tổng; các hình `ChanChim_ChiTiet_*` là phần phóng lớn PK/FK để chèn Word. Đã đồng bộ màu tiêu đề xanh theo bản Draw.io người dùng gửi và đường phân cách hàng PK trong toàn bộ Draw.io, PNG, SVG và 5 ảnh ERD của bản Word ngày 14/10/2026.

Đồng bộ ngày 30/09/2026 theo Class Diagram 6 trang và đặc tả 21 UC. 11 entity, 12 bảng; MySQL 8.0.16+ (CHECK được thực thi). Vai trò ADMIN, trạng thái/đơn vị theo class. Các quyết định và kiểm tra liên bảng ở [TRANSACTIONS.md](TRANSACTIONS.md); cột/ràng buộc ở [Data_Dictionary.md](Data_Dictionary.md); sơ đồ ở [ERD/TROHN_ERD.drawio](ERD/TROHN_ERD.drawio).

## Khởi tạo môi trường mới

SQL 01 → 02 → 03 chỉ dùng database rỗng. Compose tự chạy init chỉ khi volume chưa có dữ liệu. Không chạy lại CREATE TABLE trên DB cũ hoặc xóa volume để cập nhật. Đã đổi tên/cấu trúc cột; nếu có DB thực tế phải backup, khảo sát dữ liệu, viết migration có ánh xạ rồi thử phục hồi. Chưa có migration nâng cấp dữ liệu cũ.

Tại thư mục Database: sao chép `.env.example` thành `.env` nếu chưa có, thay giá trị mẫu. Chạy `docker compose up -d mysql`; nếu cần giao diện quản trị dùng `docker compose --profile admin up -d`. MySQL localhost:3306; phpMyAdmin localhost:8081; Spring Boot dành 8080. Không ghi đè .env đang có. Chưa xác nhận Docker daemon chạy trong lần đồng bộ này.

Seed là dữ liệu GIẢ tại Hà Nội: trường/cơ sở, địa chỉ và tọa độ chỉ để minh họa, không phải dữ liệu địa lý đã xác minh. Mã ảnh là placeholder, cần file thật trước thử ảnh. Các tài khoản seed bị vô hiệu đăng nhập bằng marker `!DEMO_LOGIN_DISABLED`; phải dùng backend tạo BCrypt hợp lệ trước thử đăng nhập. Không gán mật khẩu giả cho một hash không được kiểm chứng.

## Bảo toàn dữ liệu và kiểm thử

Khóa/ẩn/hủy không xóa dữ liệu. FK mặc định NO ACTION/RESTRICT. Ít nhất một ảnh và cơ sở trường do Service bảo vệ. Unique lịch hoạt động không thay thế khóa hàng chủ trọ khi xác nhận trùng giờ.

Chạy `SQL/04_verify_data.sql` sau init để kiểm seed: các truy vấn vi phạm phải trả rỗng. Đây là kiểm dữ liệu, chưa thay thế test transaction/cạnh tranh backend. Báo cáo thực tế nằm ở `../Bao-cao-dong-bo/Kiem-tra-2026-09-30/Ket_qua.md`.

Cấu hình đã bỏ query_cache_* vì MySQL 8.0 loại bỏ query cache: https://dev.mysql.com/blog-archive/mysql-8-0-retiring-support-for-the-query-cache/
