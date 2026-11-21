# Thiết kế REST API TROHN

Phiên bản thiết kế 30/09/2026. Chuẩn nghiệp vụ: `Dac-ta/Dac_ta_21_UC_dong_bo.docx` và Class Diagram cũ 6 trang. API chưa triển khai. Base path `/api/v1`, backend development `http://127.0.0.1:8080`. Chưa có URL production được xác nhận.

## 1. Quy ước và xác thực

JSON UTF-8, trừ upload multipart và tải ảnh. ID là số nguyên dương Java Long; frontend không dùng ID vượt Number.MAX_SAFE_INTEGER trong bản đồ án (nếu mở rộng phải chuyển đồng bộ ID sang chuỗi). Thời gian RFC3339 có offset; response UTC, UI giờ Việt Nam. Tiền là số thập phân VND, không dùng float khi tính toán backend. Version là số nguyên không âm.

Vai trò chuẩn: KHACH_THUE, CHU_TRO, ADMIN; mỗi tài khoản một vai trò. Xác thực bằng phiên ngẫu nhiên 256 bit, lưu SHA-256 trong PhienDangNhap.maPhienBam; mã thô chỉ ở cookie HttpOnly. Không dùng JWT/refresh token/Redis. Cookie `TROHN_SESSION`: Path=/api, SameSite=Lax, HttpOnly, Secure ở HTTPS production; local HTTP được bỏ Secure chỉ trong profile dev. Hạn tuyệt đối đề xuất 7 ngày, cấu hình backend; không tự kéo dài khi mở khóa. Tạo mã mới khi đăng nhập, không nhận mã do client chỉ định.

Mỗi request bảo vệ phải kiểm tra phiên chưa hết hạn/thu hồi và tài khoản HOAT_DONG; vai trò lấy từ DB. ActorContext do backend tạo, không phải JSON client được gửi. UC20 thu hồi tất cả phiên cùng transaction MySQL. UC03 chỉ thu hồi phiên hiện tại.

Chống CSRF: mọi request thay đổi dữ liệu xác minh Origin theo allowlist; thiếu/sai Origin ở web API bị từ chối. Login/register chỉ nhận application/json. Request ghi đã đăng nhập cần `X-CSRF-Token`; backend phát token qua login và GET /auth/csrf, ràng buộc token với phiên (HMAC bằng khóa riêng backend trên ID phiên và hạn phiên), so sánh an toàn. Không đặt token vào URL/log; CORS không cấp origin tùy ý. Logout khi phiên còn hiệu lực vẫn cần CSRF; khi đã hết hạn/không tồn tại chỉ xóa cookie sau kiểm tra Origin, không ghi DB.

Local frontend dùng duy nhất `http://127.0.0.1:5173`; fetch gửi credentials: include, CORS allow đúng origin này, Allow-Credentials=true, cho Content-Type và X-CSRF-Token. Không dùng `*`; localhost chỉ được thêm nếu thực sự chạy và cấu hình cả hai đầu. Production ưu tiên cùng origin qua reverse proxy `/api`. OPTIONS preflight không yêu cầu phiên.

## 2. Response, lỗi và đối soát

Success JSON: `{"data":{...},"message":"...","requestId":"..."}`. List: data gồm items, page (từ 1), size (mặc định 20, tối đa 100), total. `204` không có body. Lỗi: `{"error":{"code":"VERSION_CONFLICT","message":"Dữ liệu đã đổi","fields":{}},"requestId":"..."}`. Chỉ trả currentVersion/currentState cho người đã có quyền xem.

| HTTP | Mã tiêu biểu | Ý nghĩa |
|---|---|---|
| 400 | VALIDATION_ERROR | Dữ liệu/ảnh/bộ lọc không hợp lệ |
| 401 | SESSION_INVALID | Thiếu/hết hạn/thu hồi phiên |
| 403 | FORBIDDEN, ACCOUNT_LOCKED, CSRF_INVALID | Sai vai trò, khóa hoặc CSRF |
| 404 | NOT_FOUND | Không tồn tại hoặc không thuộc phạm vi được xem |
| 409 | EMAIL_EXISTS, VERSION_CONFLICT, INVALID_STATE, APPOINTMENT_CONFLICT | Xung đột nghiệp vụ |
| 413 | PAYLOAD_TOO_LARGE | Upload vượt giới hạn |
| 429 | RATE_LIMITED | Quá số lần yêu cầu, có Retry-After |
| 500/503 | WRITE_FAILED, SERVICE_UNAVAILABLE | Lỗi kỹ thuật; không lộ SQL/stack trace |

Xác thực/quyền trước khi lộ chi tiết; kiểm tra tồn tại, trạng thái, phiên bản và dữ liệu theo đặc tả. Danh sách rỗng là 200. Khi biết chắc rollback, báo chưa lưu. Khi mất phản hồi, UI báo chưa xác định, tải lại danh sách/đối tượng trước retry; requestId chỉ để tra log, không phải API tra kết quả đã được cài. Tạo tin UC12 chưa có idempotency key: không tự gửi lại POST khi kết quả chưa rõ; đối soát danh sách tin của chủ. UC09 đối soát bộ khách/tin/giờ; UC06/07 và UC14/19/20/21 có nhánh trả kết quả hiện có như dưới.

## 3. Ánh xạ đủ 21 UC

| UC | HTTP và đường dẫn (sau /api/v1) | Quyền | Request | Thành công |
|---|---|---|---|---|
| UC01 Đăng ký | POST /auth/register | Công khai | DangKyRequest | 201 TaiKhoanResponse |
| UC02 Đăng nhập | POST /auth/login | Công khai | DangNhapRequest | 200 user, hetHanLuc, csrfToken; Set-Cookie |
| UC03 Đăng xuất | POST /auth/logout | Phiên hiện tại hoặc hết hạn | Không body | 204; xóa cookie |
| UC04 Tìm phòng | GET /listings | Công khai | Bộ lọc mục 5 | 200 Page<TinTomTat> |
| UC05 Chi tiết phòng | GET /listings/{id} | Công khai | id | 200 ChiTietTinResponse |
| UC06 Thêm yêu thích | PUT /favorites/{tinId} | KHACH_THUE | Không body | 200 tinId, saved=true |
| UC07 Bỏ yêu thích | DELETE /favorites/{tinId} | KHACH_THUE | Không body | 204, kể cả chưa lưu |
| UC08 Xem yêu thích | GET /favorites | KHACH_THUE | page, size | 200 Page<YeuThichResponse> |
| UC09 Đặt lịch | POST /appointments | KHACH_THUE | DatLichRequest | 201 mới / 200 lịch trùng hiện có |
| UC10 Hủy lịch | POST /appointments/{id}/cancel | Khách sở hữu | LyDoRequest | 200 LichHenResponse |
| UC11 Xem lịch | GET /appointments | KHACH_THUE/CHU_TRO | Bộ lọc mục 7 | 200 Page<LichHenResponse> |
| UC12 Đăng tin | POST /listings | CHU_TRO | Multipart TinDangRequest + photos | 201 TinQuanLyResponse |
| UC13 Sửa tin | PUT /listings/{id} | Chủ sở hữu | Multipart SuaTinRequest + photos | 200 TinQuanLyResponse |
| UC14 Chủ ẩn tin | POST /listings/{id}/hide | Chủ sở hữu | LyDoRequest | 200 trạng thái hiện tại |
| UC15 Xác nhận lịch | POST /appointments/{id}/confirm | Chủ của tin | VersionRequest | 200 LichHenResponse |
| UC16 Từ chối lịch | POST /appointments/{id}/reject | Chủ của tin | LyDoRequest | 200 LichHenResponse |
| UC17 Duyệt tin | POST /admin/listings/{id}/approve | ADMIN | VersionRequest | 200 TinQuanLyResponse |
| UC18 Từ chối tin | POST /admin/listings/{id}/reject | ADMIN | VersionLyDoRequest | 200 TinQuanLyResponse |
| UC19 Admin ẩn tin | POST /admin/listings/{id}/hide | ADMIN | LyDoRequest | 200 trạng thái hiện tại |
| UC20 Khóa tài khoản | POST /admin/users/{id}/lock | ADMIN | LyDoRequest | 200 TaiKhoanResponse |
| UC21 Mở khóa tài khoản | POST /admin/users/{id}/unlock | ADMIN | LyDoRequest | 200 TaiKhoanResponse |

Endpoint dùng POST cho lệnh nghiệp vụ là lựa chọn thiết kế, không thêm UC. Không có DELETE listing, unhide, trạng thái nháp lưu DB, đổi mật khẩu/hồ sơ, thanh toán, hợp đồng, báo cáo vi phạm hoặc thống kê trong phạm vi 21 UC này.

## 4. DTO tài khoản

- DangKyRequest: hoTen (1–255), email (định dạng hợp lệ, tối đa 255, trim/lowercase), soDienThoai (10–11 chữ số), matKhau (8–72 byte UTF-8 với BCrypt), xacNhanMatKhau (khớp), vaiTro chỉ KHACH_THUE/CHU_TRO. Không thêm yêu cầu chữ hoa/số ngoài đặc tả. Thành công tạo HOAT_DONG, không tự đăng nhập. UNIQUE email xử lý cả cạnh tranh.
- DangNhapRequest: email, matKhau. Sai thông tin trả 401 chung; chỉ sau khi mật khẩu đúng mới báo tài khoản khóa 403. Khóa hàng tài khoản khi tạo phiên để không đua với UC20. Giới hạn thử login đề xuất 5 lần/phút theo IP+email chuẩn hóa.
- TaiKhoanResponse: id, hoTen, email, soDienThoai, vaiTro, trangThai, ngayTao, ngayCapNhat, version; lyDoKhoa chỉ cho chính chủ/Admin khi cần. Không trả hash hoặc mã phiên.
- VersionRequest: `{ "version": 0 }`; LyDoRequest: `{ "lyDo": "Lý do xử lý" }`; VersionLyDoRequest gồm cả hai. Lý do trim, 1–1000 ký tự. Version áp dụng bắt buộc ở UC13/15/17/18; thao tác khác vẫn khóa và kiểm trạng thái trong transaction.

## 5. Tìm và xem tin

GET /listings nhận q (tối đa 255), loaiPhong, quanHuyen, giaMin/giaMax, dienTichMin/dienTichMax, tienIchIds (lặp query parameter), coSoTruongId, banKinhMet, page, size, sort. Sort allowlist: newest (mặc định), priceAsc, priceDesc, distanceAsc; luôn thêm id để ổn định phân trang. Giá/diện tích không âm, min ≤ max. Bộ tiện ích yêu cầu đủ tất cả. Chỉ trả DANG_HIEN_THI và chủ HOAT_DONG tại Hà Nội.

coSoTruongId + banKinhMet phải cùng có; bán kính >0 và ≤50000 m (giới hạn kỹ thuật đề xuất). Cơ sở không tồn tại trả 404. distanceAsc chỉ dùng khi có cơ sở. GeoService tính khoảng cách đường chim bay từ tọa độ (Haversine, mét), không phải quãng đường di chuyển. Tin thiếu tọa độ không vào kết quả tìm gần trường; tìm thường vẫn có. Không có FK tin→trường vì một tin có thể gần nhiều cơ sở.

TinTomTat: id, tieuDe, loaiPhong, giaThue, dienTich, diaChiChiTiet, phuongXa, quanHuyen, thanhPho, viDo, kinhDo, anhDaiDienUrl, ngayTao; khoangCachMet chỉ khi truy vấn gần cơ sở. ChiTietTinResponse thêm moTa, tenLienHe, soDienThoaiLienHe, anhPhong:[{id,url,thuTu}], tienIch:[{id,ten,maBieuTuong}], chiPhi:[{id,tenChiPhi,soTien,donViTinh,ghiChu}]. Không công khai email tài khoản, hash, phiên hoặc nhật ký. Truy cập liên kết trực tiếp tin ẩn/khóa chủ trả 404 kể cả biết id. Chủ/Admin dùng endpoint quản lý riêng, không mở rộng quyền endpoint công khai.

## 6. Tạo và sửa tin

Multipart có part `data` Content-Type application/json và part `photos` lặp cho từng tệp. TinDangRequest gồm toàn bộ trường:

```json
{"tieuDe":"Phòng trọ mẫu Hà Nội","moTa":"Nội dung mô tả","loaiPhong":"PHONG_TRO","giaThue":3000000,"dienTich":22,"diaChiChiTiet":"Địa chỉ minh họa","phuongXa":"Phường minh họa","quanHuyen":null,"thanhPho":"Hà Nội","viDo":null,"kinhDo":null,"tenLienHe":"Chủ trọ mẫu","soDienThoaiLienHe":"0900000003","tienIchIds":[1],"chiPhi":[{"tenChiPhi":"Điện","soTien":3500,"donViTinh":"KWH","ghiChu":null}]}
```

Các chuỗi bắt buộc không rỗng; giới hạn theo Data Dictionary. moTa tối đa 10000 ký tự (cấu hình kỹ thuật). giaThue/dienTich >0; loaiPhong = PHONG_TRO/STUDIO/CHUNG_CU_MINI. Địa chỉ phải Hà Nội; chuẩn hóa thành phố ở server, không chỉ kiểm tra nhãn client. quanHuyen tùy chọn; phuongXa bắt buộc. Tọa độ cùng có/cùng null, vĩ độ [-90,90], kinh độ [-180,180]. TienIch ID phải tồn tại, không trùng. Chi phí có tên duy nhất trong tin, soTien ≥0, đơn vị KWH/M3/NGUOI_THANG/PHONG_THANG/XE_THANG/LAN.

UC12 yêu cầu 1–10 ảnh hợp lệ ngay trong request; tối đa 5 MiB/tệp, JPEG/PNG/WebP, tổng upload tối đa 55 MiB gồm metadata. Backend quyết định chuTroId từ phiên, trangThai=CHO_DUYET, version=0; từ chối trường chuTroId/trangThai/actorId do client đưa vào. Không tạo tin chờ duyệt trước rồi upload ảnh sau.

UC13 PUT thay toàn bộ nội dung. SuaTinRequest = TinDangRequest + version + giuAnhIds (mảng ID ảnh giữ theo thứ tự); photos mới tùy chọn, nối sau ảnh giữ. Tổng cuối 1–10, ID giữ phải thuộc tin và không trùng. Bộ tiện ích/chi phí là tập cuối, không gửi thì lỗi validation (có thể gửi mảng rỗng). Lưu toàn bộ cùng transaction. Tin BI_TU_CHOI được sửa; ADMIN_AN bị cấm. Sau sửa chuyển CHO_DUYET, tăng version, giữ lịch cũ; chưa công khai thì không nhận lịch mới. File storage nằm ngoài transaction: cơ chế bù trừ/dọn mồ côi ở Database/TRANSACTIONS.md.

TinQuanLyResponse = chi tiết tin + chuTroId, trangThai, lyDoXuLy, version, ngayTao, ngayCapNhat. UC14 chỉ CHO_DUYET/DANG_HIEN_THI→CHU_TRO_AN; đã CHU_TRO_AN trả 200 hiện có; BI_TU_CHOI/ADMIN_AN/AN_DO_KHOA_TAI_KHOAN trả 409. Yêu cầu lý do; chuyển tin, hủy lịch tương lai CHO_XAC_NHAN/DA_XAC_NHAN và ghi AN_TIN cùng transaction. Không có hiện lại trực tiếp: dùng UC13 rồi UC17.

## 7. Yêu thích và lịch hẹn

UC06 kiểm tin công khai; nếu đã lưu trả saved=true, không tạo trùng. UC07 bỏ mục của mình kể cả tin ẩn; mục chưa có vẫn 204. YeuThichResponse: tinId, ngayLuu, khaDung, tin (TinTomTat hoặc null). Khi không khả dụng không trả nội dung riêng; không tự xóa quan hệ.

DatLichRequest: tinId, thoiDiemHen, soDienThoaiLienHe, ghiChu tùy chọn tối đa 1000. Thời điểm phải ở tương lai tại lúc ghi, hai tài khoản hoạt động, tin công khai. Không nhận khachThueId/trangThai. Trùng lịch hoạt động khách+tin+giờ trả lịch hiện có. Cơ chế unique và khóa liên lịch xem TRANSACTIONS.md.

LichHenResponse: id, tinId, khachThueId (chỉ bên có quyền), thoiDiemHen, soDienThoaiLienHe, ghiChu, trangThai, lyDoTuChoi, lyDoHuy, nguonHuy, nguoiHuyId, huyLuc, ngayTao, ngayCapNhat, version. Có thể thêm phòng tóm tắt; nếu tin ẩn thì chỉ id/nhãn không khả dụng, không trả nội dung tin riêng cho khách. Số liên hệ của lịch chỉ khách đặt/chủ tin được xem.

GET /appointments: trangThai, tuLuc, denLuc (RFC3339; cùng có/cùng bỏ, tuLuc < denLuc, khoảng [tuLuc,denLuc)), page, size; mặc định tất cả trạng thái, sort thoiDiemHen giảm rồi id giảm. Server tự lọc theo phiên: khách chỉ lịch mình, chủ chỉ lịch tin mình; không nhận userId để mở rộng quyền. GET /appointments/{id} hỗ trợ màn hình chi tiết cùng phạm vi UC11, không tạo UC mới.

UC10 cần lý do, chỉ hủy lịch tương lai đang hoạt động; ghi nguồn KHACH_THUE, người hủy là khách. UC15 cần version; chỉ CHO_XAC_NHAN trước giờ, tin công khai và hai tài khoản hoạt động; một chủ không xác nhận hai lịch cùng thời điểm dù khác tin, xung đột trả 409. UC16 chỉ CHO_XAC_NHAN trước giờ, có lý do; không từ chối lịch đã xác nhận. Lịch đã xử lý/quá giờ trả 409, giữ dữ liệu. Không có trạng thái HOAN_THANH trong bộ cũ.

## 8. Admin và nhật ký

UC17 duyệt CHO_DUYET, đúng version đã xem, chủ hoạt động → DANG_HIEN_THI. UC18 từ chối CHO_DUYET, đúng version, có lý do → BI_TU_CHOI; chủ được sửa/gửi lại qua UC13. Cả hai ghi nhật ký trạng thái trước/sau, actor, thời điểm, version.

UC19 đánh dấu vi phạm tin tồn tại, kể cả tin chủ tự ẩn → ADMIN_AN. Đã ADMIN_AN trả 200 không ghi lặp. Có lý do, audit và hủy lịch tương lai đang hoạt động cùng transaction. Không tự khóa tài khoản; không có unhide.

UC20 chỉ khách/chủ: BI_KHOA + lý do + thu hồi mọi phiên + hủy lịch tương lai liên quan + chỉ ẩn tin DANG_HIEN_THI của chủ + nhật ký, cùng transaction. Không ghi đè ADMIN_AN/các trạng thái khác. UC21 chỉ HOAT_DONG + nhật ký lý do mở khóa; không khôi phục phiên/lịch/tin. Đã ở trạng thái đích trả 200 không ghi lặp. Cấm xử lý tài khoản ADMIN. Cả khóa và mở khóa đều bắt buộc lý do.

## 9. Endpoint đọc hỗ trợ giao diện

Không bổ sung nghiệp vụ ghi ngoài 21 UC:

| Endpoint | Quyền | Query và kết quả |
|---|---|---|
| GET /users/me | Phiên hợp lệ | TaiKhoanResponse |
| GET /auth/csrf | Phiên hợp lệ | csrfToken; Cache-Control: no-store |
| GET /me/listings | CHU_TRO | trangThai, page, size; Page<TinQuanLyResponse> của chủ |
| GET /me/listings/{id} | Chủ sở hữu | TinQuanLyResponse |
| GET /amenities | Công khai | Danh sách {id,ten,maBieuTuong} |
| GET /universities | Công khai | {id,tenTruong,tenVietTat} |
| GET /universities/{id}/campuses | Công khai | {id,tenCoSo,diaChi,viDo,kinhDo} |
| GET /admin/listings | ADMIN | trangThai, page, size; Page<TinQuanLyResponse> |
| GET /admin/listings/{id} | ADMIN | TinQuanLyResponse |
| GET /admin/users | ADMIN | q, vaiTro, trangThai, page, size; Page<TaiKhoanResponse> |
| GET /admin/users/{id} | ADMIN | TaiKhoanResponse |
| GET /listings/{tinId}/photos/{photoId} | Công khai nếu tin công khai; nếu không chỉ chủ/Admin | Stream JPEG/PNG/WebP; kiểm ảnh đúng tin |

Ảnh không khả dụng trả 404; Cache-Control: no-store trong bản tối thiểu để không tiếp tục phục vụ ảnh riêng sau ẩn tin. Các API riêng tư no-store. Không yêu cầu email/SMS/WebSocket: hai bên tải lại danh sách để thấy trạng thái mới. Nhật ký được lưu phục vụ xử lý, không tự thêm UC quản lý nhật ký.

## 10. Kiểm tra trước khi nối frontend

Đối chiếu đủ 21 dòng UC; thử request hợp lệ/sai vai trò/sai chủ/sai trạng thái/sai version; kiểm CSRF/CORS/cookie; thử cạnh tranh UC09/15/20; kiểm các giao dịch rollback và đối soát khi mất phản hồi. Thiết kế này chưa chứng minh API chạy. Các ngưỡng ảnh/phân trang/hạn phiên là quyết định kỹ thuật đề xuất, có thể cấu hình mà không đổi nghiệp vụ.
