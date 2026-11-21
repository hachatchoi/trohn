# Thiết kế kiến trúc hệ thống TROHN

Ngày 30/09/2026. TROHN là website tìm và cho thuê phòng trọ dành cho sinh viên Hà Nội. Kiến trúc được đồng bộ với đặc tả 21 UC và Class Diagram 6 trang đã chọn; đây là thiết kế triển khai, không phải xác nhận hệ thống đã vận hành.

## 1. Phạm vi và trạng thái

Khách thuê tìm/xem phòng, lưu yêu thích, đặt/hủy/xem lịch. Chủ trọ đăng/sửa/ẩn tin, xem/xác nhận/từ chối lịch. Admin duyệt/từ chối/ẩn tin và khóa/mở khóa tài khoản. Giữ tìm gần từng cơ sở trường bằng tọa độ. Một tin mô tả một phòng cho thuê; chưa tách phòng vật lý và lịch sử tin.

Frontend hiện có React 19, TypeScript 5.7, Vite 6, React Router 7, Leaflet và CSS riêng, dùng dữ liệu demo. Backend hiện mới là khung thư mục; Spring Boot, Spring Security, JPA và kết nối MySQL là phần cần triển khai. SQL/ERD/API là tài liệu thiết kế; chưa suy ra đã import/chạy production.

## 2. Kiến trúc tổng thể

Chọn một ứng dụng backend Spring Boot phân tầng (modular monolith), một MySQL và nơi lưu ảnh. Không cần API gateway hoặc tách microservices cho 21 UC.

```text
Trình duyệt React + TypeScript
             | HTTPS / JSON / multipart
             v
Reverse proxy (production): / → React, /api → Spring Boot
             |
             v
Spring Security: phiên MySQL, vai trò, CSRF
             |
Controller → Service (@Transactional) → Repository (JPA) → MySQL
                 |                         12 bảng / InnoDB
                 +→ ImageStorage → vùng lưu ảnh ngoài web root
                 +→ GeoService → tính khoảng cách đến CoSoTruong
```

Trong development React chạy Vite, gọi Spring Boot qua origin được cho phép. Production đề xuất phục vụ cùng origin qua reverse proxy; sơ đồ không khẳng định đã cấu hình hoặc triển khai máy chủ.

## 3. Trách nhiệm các tầng

| Thành phần | Trách nhiệm | Giới hạn |
|---|---|---|
| React | Form, route, hiển thị trạng thái, gọi API | Không tự quyết quyền hoặc trạng thái đã lưu |
| Security | Đọc phiên, tài khoản, tạo ActorContext; CSRF/CORS | Không tin role/actorId từ client |
| Controller/DTO | Kiểm định dạng request, ánh xạ HTTP, response lỗi | Không chứa quy tắc chuyển trạng thái |
| Service | Kiểm quyền/trạng thái/version, transaction, phối hợp ảnh | Một nghiệp vụ ghi nhiều bảng có một transaction |
| Repository/Entity | Ánh xạ và truy vấn, khóa hàng, unique/FK | Không commit riêng từng bước |
| MySQL | Dữ liệu, phiên, lịch sử, ràng buộc | Không thể một mình bảo đảm luật liên bảng/ảnh vật lý |
| ImageStorage | Lưu/đọc/xóa file theo khóa nội bộ | Bù trừ sau rollback; không thuộc transaction DB |
| GeoService | Khoảng cách đường chim bay theo tọa độ | Không suy ra tuyến đường hoặc khoảng cách khi thiếu tọa độ |

Các module chức năng bên trong cùng ứng dụng: tài khoản/phiên, tin đăng, yêu thích, lịch hẹn, danh mục trường/tiện ích và xử lý quản trị. Controller gọi Service, Service gọi Repository; không gọi HTTP giữa các module nội bộ.

## 4. Dữ liệu và xác thực

11 entity: TaiKhoan, PhienDangNhap, TinDang, AnhPhong, ChiPhiPhong, TienIch, YeuThich, LichHen, TruongDaiHoc, CoSoTruong, NhatKyXuLy. Bảng thứ 12 TinDang_TienIch hiện thực quan hệ nhiều–nhiều. NoiDungTin và DuLieuNhatKy là value object, không phải bảng. Quan hệ gần trường được tính, không gắn một tin cứng vào một trường.

Một tài khoản có vai trò KHACH_THUE/CHU_TRO/ADMIN. Mã phiên ngẫu nhiên lưu cookie HttpOnly; DB lưu hash, hạn và thời điểm thu hồi. Mỗi request kiểm tra phiên và tài khoản đang hoạt động. Khóa tài khoản thu hồi phiên trong cùng transaction MySQL; mở khóa không phục hồi phiên cũ. Không dùng JWT/Redis trong thiết kế cơ sở. API_DESIGN.md quy định cookie, CSRF, CORS và endpoint xác thực.

Tất cả thời điểm lưu UTC, hiển thị giờ Việt Nam. Version dùng chống ghi đè bản nội dung cũ; không thay thế khóa liên lịch. Không hard-delete tài khoản/tin/lịch trong phạm vi này; FK giữ lịch sử, audit có đúng một mục tiêu và trạng thái trước/sau.

## 5. Luồng nghiệp vụ và giao dịch

Tạo tin: kiểm form/địa chỉ Hà Nội/ít nhất một ảnh → chuẩn bị file → transaction lưu tin CHO_DUYET, ảnh, phí, tiện ích → trả kết quả. Nếu DB rollback xác định, dọn file mới; commit chưa rõ phải đối soát trước khi dọn. Ảnh được cấp qua đường đọc có kiểm tra quyền, không public thư mục gốc.

Sửa tin: chủ sở hữu đang hoạt động, đúng version, không ADMIN_AN → thay nội dung và gửi CHO_DUYET; giữ lịch cũ. Tin BI_TU_CHOI được sửa. Chủ ẩn tin chỉ từ CHO_DUYET/DANG_HIEN_THI; Admin có thể ẩn cả tin chủ đã tự ẩn. Ẩn tin, hủy lịch tương lai hoạt động và nhật ký cùng transaction; request lặp ở trạng thái đích không ghi lại.

Đặt lịch: kiểm tin công khai và hai tài khoản hoạt động; khóa/unique ngăn lịch cùng khách/tin/giờ. Xác nhận lịch: khóa hàng tài khoản chủ trọ, kiểm trên tất cả tin của chủ để ngăn xác nhận trùng thời điểm; không chỉ dùng version của từng lịch. Chưa có thời lượng cuộc hẹn. Chi tiết thứ tự khóa và xử lý cạnh tranh xem Database/TRANSACTIONS.md.

Khóa tài khoản: khóa + thu hồi phiên + hủy lịch tương lai liên quan + nếu là chủ thì chỉ ẩn tin đang hiển thị + audit cùng transaction. Mở khóa chỉ đổi tài khoản và audit; không công khai lại tin hoặc khôi phục lịch. Tin công khai luôn yêu cầu trạng thái DANG_HIEN_THI và chủ HOAT_DONG.

## 6. Môi trường triển khai đề xuất

| Thành phần | Development | Production đề xuất |
|---|---|---|
| React | http://127.0.0.1:5173 | Static build qua HTTPS reverse proxy |
| Spring Boot | http://127.0.0.1:8080 | /api qua proxy, cổng nội bộ |
| MySQL | 127.0.0.1:3306 | Mạng riêng, không public |
| phpMyAdmin tùy chọn | http://127.0.0.1:8081 | Không bật mặc định |
| Ảnh | Thư mục cấu hình ngoài web root | Volume bền vững; backup cùng DB |

Docker Compose hiện chỉ quản lý MySQL và phpMyAdmin. Không coi Docker Compose là backend đang chạy. SQL init chỉ dùng database rỗng; dữ liệu hiện hữu cần migration sau khi sao lưu, không xóa volume để áp dụng schema mới. Chưa có Flyway migration thực thi; khi khởi tạo backend có thể đưa schema chuẩn vào migration phiên bản đầu.

Java 17+ và Spring Boot 3.x là định hướng backend; chốt phiên bản còn được hỗ trợ tại thời điểm triển khai. Không khai báo Redux/Axios/Material UI là thư viện đã cài vì frontend hiện chưa có chúng.

## 7. Bảo mật và vận hành

HTTPS production; BCrypt cho mật khẩu; cookie phiên HttpOnly/Secure; CSRF và origin allowlist; kiểm quyền tại Service trước mọi ghi/đọc riêng tư. SQL tham số hóa, kiểm MIME thực/dung lượng ảnh, storage key ngẫu nhiên, không dùng tên tệp người dùng làm đường dẫn. Không log mật khẩu, cookie, hash hoặc nội dung .env. Log kỹ thuật có requestId để tra lỗi; nhật ký nghiệp vụ nằm trong DB.

Backup DB và vùng ảnh định kỳ; thử phục hồi trước khi demo/triển khai. Health check có thể thêm khi triển khai, chỉ tiết lộ trạng thái tối thiểu. Đề xuất giới hạn thử đăng nhập và upload; các ngưỡng là cấu hình kỹ thuật, không phải chỉ tiêu hiệu năng đã đo. Không hứa SLA/RTO/RPO khi chưa thử nghiệm.

## 8. Lộ trình triển khai và xác minh

1. Chạy schema/index/seed trên MySQL 8.0.16+ sạch và kiểm ràng buộc.
2. Khởi tạo Spring Boot, cấu hình phiên và phân quyền, migration.
3. Làm 21 UC theo API; kiểm unit/integration và các ca cạnh tranh.
4. Nối giao diện hiện có, loading/error/empty state và đối soát mất phản hồi.
5. Demo end-to-end ba vai trò, cập nhật báo cáo theo kết quả chạy thật.

Chưa thuộc phạm vi: mobile, thanh toán, hợp đồng, yêu cầu liên hệ thay lịch hẹn, báo cáo tin, microservices, gateway, Redis, Elasticsearch, Kubernetes và hạ tầng cluster. Chỉ đánh giá thêm khi có yêu cầu mới, không phải thành phần cần dựng cho đồ án hiện tại.
