# Thiết kế kiến trúc hệ thống TROHN

Cập nhật 14/10/2026. TROHN là website tìm và cho thuê phòng trọ dành cho sinh viên Hà Nội. Kiến trúc được đồng bộ với đặc tả 21 UC và Class Diagram 6 trang đã chọn; đây là thiết kế triển khai, không phải xác nhận hệ thống đã vận hành.

## 1. Phạm vi và trạng thái

Khách thuê tìm/xem phòng, lưu yêu thích, đặt/hủy/xem lịch. Chủ trọ đăng/sửa/ẩn tin, xem/xác nhận/từ chối lịch. Admin duyệt/từ chối/ẩn tin và khóa/mở khóa tài khoản. Giữ tìm gần từng cơ sở trường bằng tọa độ. Một tin mô tả một phòng cho thuê; chưa tách phòng vật lý và lịch sử tin.

Frontend hiện có React 19, TypeScript 5.7, Vite 6, React Router 7, Leaflet và CSS riêng, dùng dữ liệu demo. Backend hiện mới là khung thư mục; Spring Boot, Spring Security, JPA và kết nối MySQL là phần cần triển khai. SQL/ERD/API là tài liệu thiết kế; chưa suy ra đã import/chạy production.

## 2. Kiến trúc tổng thể

![Kiến trúc tổng thể](So-do/Kien_truc_tong_the.png)

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


## 9. Sơ đồ triển khai

Phương án đề xuất, chưa phải hạ tầng đã chạy.

![Local](So-do/Trien_khai_local.png)

![Production](So-do/Trien_khai_production.png)

## 10. Công nghệ và trạng thái

| Công nghệ | Vai trò | Trạng thái |
|---|---|---|
| React, TypeScript, Vite | Giao diện, kiểu dữ liệu và công cụ build | Có trong package.json; giao diện demo |
| React Router, Leaflet | Điều hướng và hiển thị bản đồ | Có trong package.json |
| Java và Spring Boot | Backend monolith phân tầng | Đề xuất; backend mới có thư mục khung |
| Spring Security và BCrypt | Phiên, kiểm quyền, CSRF, băm mật khẩu | Đề xuất; chưa tích hợp |
| Spring Data JPA | Repository, ánh xạ Entity và transaction | Đề xuất; chưa có mã thực thi |
| MySQL / InnoDB | 12 bảng, FK, unique, transaction, phiên đăng nhập | Có SQL thiết kế; chưa xác nhận chạy kiểm thử |
| ImageStorage và vùng lưu ảnh | Lưu ảnh ngoài web root, truy cập qua API có kiểm quyền | Interface thiết kế; chưa triển khai |
| GeoService | Tính khoảng cách đường chim bay tới cơ sở trường | Thiết kế dùng tọa độ; không gọi dịch vụ chỉ đường |
| Reverse proxy HTTPS | Phục vụ React và chuyển /api tới backend | Phương án production; chưa triển khai |

## 11. Quyết định kiến trúc

| Quyết định | Lý do | Đánh đổi |
|---|---|---|
| Monolith phân tầng | 21 UC dùng chung dữ liệu và transaction; triển khai đơn giản | Một bản phát hành chung; cần giữ ranh giới module |
| MySQL / InnoDB | Dữ liệu quan hệ, PK/FK, unique và thao tác nhiều bảng | Luật liên bảng vẫn phải kiểm tại Service |
| Phiên trong MySQL | Khóa tài khoản và thu hồi phiên trong cùng transaction | Mỗi request bảo vệ cần tra phiên/tài khoản; DB chịu thêm đọc |
| Ảnh ngoài DB | DB giữ metadata và khóa lưu trữ; tránh chứa tệp lớn | File và DB không cùng transaction; phải bù trừ và đối soát |
| Một tin đại diện một phòng cho thuê | Phù hợp phạm vi hiện tại, ít mô hình trung gian | Chưa quản lý lịch sử nhiều lần đăng cho cùng phòng vật lý |
| Ẩn tin, giữ lịch sử | Giữ lịch hẹn, yêu thích và nhật ký để đối chiếu | Mọi truy vấn công khai phải lọc cả tin và chủ tài khoản |
| Khoảng cách tính theo cơ sở trường | Một tin có thể gần nhiều cơ sở; không cần FK tin–trường | Chỉ là đường chim bay, phụ thuộc chất lượng tọa độ |
| Version kết hợp khóa giao dịch | Ngăn ghi đè và xung đột xác nhận giữa nhiều lịch | Cần thống nhất thứ tự khóa, xử lý deadlock và kiểm thử cạnh tranh |

## 12. Yêu cầu phi chức năng

Các tiêu chí và số liệu là mục tiêu đề xuất, chưa đo.

| Mã | Tiêu chí | Kiểm chứng |
|---|---|---|
| NFR01 Quyền truy cập | Mọi API riêng tư kiểm phiên, vai trò và chủ sở hữu | Thử ma trận 3 vai trò, đổi ID sang dữ liệu người khác; không lộ dữ liệu/không ghi trái quyền |
| NFR02 Phiên và CSRF | Phiên thu hồi không dùng lại; request ghi cần Origin và CSRF hợp lệ | Khóa tài khoản rồi gọi lại; thử thiếu/sai token và origin; quan sát DB không đổi |
| NFR03 Nhất quán | Ẩn tin/khóa tài khoản và các cập nhật liên quan cùng commit hoặc rollback | Chèn lỗi giữa các bước; kiểm tin, lịch, phiên và nhật ký cùng trở về trạng thái trước |
| NFR04 Chống trùng lịch | Một lịch hoạt động cho khách–tin–giờ; chủ không xác nhận hai lịch cùng giờ | Chạy đồng thời 2 request UC09 và 2 request UC15 khác tin; kiểm DB và HTTP 200/201/409 theo trường hợp |
| NFR05 Upload | 1–10 ảnh, tối đa 5 MiB/tệp; tổng request tối đa 55 MiB | Thử ảnh giả đuôi, quá giới hạn, giữ ảnh sai tin, DB lỗi; không commit tin thiếu ảnh |
| NFR06 Tìm kiếm | Mục tiêu thử nghiệm: p95 ≤2 giây cho GET /listings ở 20 người dùng đồng thời | Đề xuất dữ liệu 10.000 tin/100 cơ sở, size=20, máy 4 vCPU/8 GiB; warm-up 1 phút, đo 5 phút cả bộ lọc thường/gần trường; ghi cấu hình thực và tỷ lệ lỗi |
| NFR07 Sao lưu | Có thể phục hồi DB và vùng ảnh từ bộ sao lưu đã kiểm tra | Thử phục hồi vào môi trường riêng; đối chiếu số bản ghi, FK và ảnh; đo thời gian thực, chưa cam kết RTO/RPO |
| NFR08 Truy vết | Lỗi có requestId; nhật ký có actor, mục tiêu, trạng thái trước/sau | Kiểm lỗi và audit; không có mật khẩu, cookie hoặc mã phiên trong log |

## 13. Luồng xử lý và liên kết với API

Luồng tổng thể: Controller nhận HTTP và ánh xạ DTO → Service kiểm tra quyền, điều kiện nghiệp vụ và điều phối transaction → Repository đọc/ghi MySQL. Backend tự tạo ActorContext từ phiên hợp lệ; không tin vai trò hay người thao tác do client gửi.

Ví dụ UC09 đặt lịch: POST /api/v1/appointments → LichHenController.datLich → LichHenService.datLich. Service kiểm tin công khai, tài khoản hoạt động, thời điểm hẹn và lịch trùng; Repository đọc TaiKhoan, TinDang, LichHen và lưu LichHen trong transaction. Trả 201 khi tạo mới hoặc 200 với lịch hoạt động trùng hiện có.

Bảng đối chiếu chi tiết 21 UC, endpoint, phương thức Controller/Service, dữ liệu đọc/ghi và quy ước chữ ký nằm ở mục 5 của API/THIET_KE_API_TROHN.docx. Bản tra cứu văn bản: API/DOI_CHIEU_THIET_KE.md. Phần kiến trúc chỉ trình bày quan hệ giữa các tầng và ví dụ đại diện.

## 14. Chuẩn bị bảo vệ

[15 câu hỏi và trả lời gợi ý](CAU_HOI_BAO_VE.md).
