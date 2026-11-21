# Giao dịch và ràng buộc nghiệp vụ TROHN

Ngày 30/09/2026. Hợp đồng triển khai theo Class Diagram 6 trang; chưa phải mã backend đã chạy.

## Quy tắc chung

Giữ 11 entity và 12 bảng. Vai trò KHACH_THUE, CHU_TRO, ADMIN. `dangHoatDong` của LichHen là cột sinh kỹ thuật, không phải trường nhập API. NoiDungTin và DuLieuNhatKy không tạo bảng. Không lưu nháp tin, xóa tin hoặc tự hiện lại tin trong 21 UC. DATETIME(6) lưu UTC; JDBC/session MySQL dùng UTC; API nhận RFC3339 có offset, trả UTC; UI hiển thị Asia/Ho_Chi_Minh.

Service đặt ranh giới transaction; Repository không commit riêng. Tài khoản, phiên, tin, lịch, nhật ký cùng MySQL/InnoDB. Mỗi lần ghi kiểm tra lại phiên, quyền sở hữu, vai trò, trạng thái và version. Không tin actorId/role trong request. Role và chủ sở hữu tin không đổi trong phạm vi này.

Thứ tự khóa: TaiKhoan cần tham gia (id tăng dần) → PhienDangNhap → TinDang (id tăng dần) → LichHen (id tăng dần) → dữ liệu con/nhật ký. Dùng SELECT ... FOR UPDATE đọc bản mới nhất. Có thể tra ID tham chiếu trước nhưng phải xác minh lại sau khóa. UC20 khóa tài khoản mục tiêu trước dữ liệu liên quan; mọi tạo phiên/ghi nghiệp vụ của tài khoản đó cũng phải khóa hàng tài khoản. UC03 thu hồi phiên và request ghi dùng cùng khóa phiên, không đảo thứ tự khóa.

Bulk update phải tăng version và ngayCapNhat, làm sạch persistence context; @Version không tự bảo vệ bulk SQL. Deadlock/lock timeout phải rollback toàn bộ, retry giới hạn chỉ khi chắc chưa commit và kiểm tra lại mọi điều kiện. Không tự retry khi commit chưa rõ.

## Chống trùng lịch

- UC09: khóa tài khoản khách/chủ và tin; kiểm tra giờ tương lai, hai tài khoản hoạt động và tin công khai. UNIQUE `(khachThueId,tinDangId,thoiDiemHen,dangHoatDong)` ngăn lịch hoạt động trùng; lịch hủy/từ chối có cột sinh NULL nên vẫn giữ lịch sử. Trùng trả lịch cũ 200; mới trả 201. Duplicate key: rollback rồi đọc lại, không tiếp tục transaction đã lỗi.
- UC15: khóa hàng TaiKhoan của chủ trước khi kiểm tra DA_XAC_NHAN cùng thời điểm trên TẤT CẢ tin của chủ. Hai request xác nhận dùng cùng hàng khóa dù khác tin. Dùng locking/current read, không snapshot cũ. Kiểm tra version lịch, CHO_XAC_NHAN, giờ tương lai, tin công khai và hai tài khoản hoạt động rồi cập nhật. Version riêng mỗi lịch không đủ chống trùng liên lịch. Chỉ so sánh thời điểm, chưa có thời lượng.
- UC10: khách sở hữu hủy lịch tương lai CHO_XAC_NHAN/DA_XAC_NHAN, có lý do. Đã hủy/từ chối/quá giờ: không ghi, trả lỗi nghiệp vụ và trạng thái hiện tại cho người có quyền.
- UC16: chủ từ chối CHO_XAC_NHAN trước giờ hẹn, có lý do; không dùng để hủy lịch đã xác nhận.

## Chuyển trạng thái tin

| UC | Nguồn | Kết quả | Tác động lịch |
|---|---|---|---|
| UC12 | Tạo mới hợp lệ, ít nhất một ảnh | CHO_DUYET | Không tạo lịch |
| UC13 | CHO_DUYET, DANG_HIEN_THI, BI_TU_CHOI, CHU_TRO_AN, AN_DO_KHOA_TAI_KHOAN; chủ hoạt động; đúng version | CHO_DUYET | Giữ lịch cũ |
| UC14 | CHO_DUYET hoặc DANG_HIEN_THI | CHU_TRO_AN | Hủy lịch tương lai hoạt động |
| UC17 | CHO_DUYET; đúng version; chủ hoạt động | DANG_HIEN_THI | Giữ lịch |
| UC18 | CHO_DUYET; đúng version; có lý do | BI_TU_CHOI | Giữ lịch |
| UC19 | Tin tồn tại chưa ADMIN_AN | ADMIN_AN; có lý do | Hủy lịch tương lai hoạt động |
| UC20 | Chủ bị khóa; chỉ tin DANG_HIEN_THI | AN_DO_KHOA_TAI_KHOAN | Hủy lịch tương lai liên quan tài khoản |

UC14 đã CHU_TRO_AN, UC19 đã ADMIN_AN trả kết quả hiện có, không tăng version/ghi nhật ký/hủy lại. UC14 các trạng thái khác bị từ chối. UC19 áp dụng cả tin tự ẩn theo đặc tả, không có endpoint Admin hiện lại. UC13 không sửa ADMIN_AN. Công khai = DANG_HIEN_THI VÀ chủ HOAT_DONG, áp dụng cho tìm kiếm, liên kết trực tiếp và ảnh.

Hủy hệ thống chọn `thoiDiemHen > now`, trạng thái CHO_XAC_NHAN/DA_XAC_NHAN; ghi DA_HUY, lyDoHuy, nguonHuy=HE_THONG, nguoiHuyId=người thao tác gốc, huyLuc=now và tăng version. Dùng một now cho transaction. Không xóa tin/lịch/yêu thích. Lịch quá giờ chỉ tra cứu.

## Khóa tài khoản

UC20 chỉ khách/chủ, cấm Admin. Một transaction: BI_KHOA + lyDoKhoa; thu hồi mọi phiên bằng thuHoiLuc; hủy lịch tương lai liên quan (khách đặt hoặc tin của chủ); chỉ chuyển tin đang hiển thị của chủ sang AN_DO_KHOA_TAI_KHOAN; ghi audit mục tiêu tài khoản. Không đổi trạng thái các tin còn lại. UC21 có lý do, chỉ HOAT_DONG + audit; xóa lyDoKhoa hiện tại vì lịch sử ở audit. Không phục hồi phiên/lịch/tin. Trạng thái đích đã có: trả hiện có, không ghi lặp.

## Ảnh và dữ liệu con

UC12 nhận nội dung và ảnh cùng multipart request. Kiểm tất cả ảnh, ghi file vào vùng tạm tên ngẫu nhiên, chuẩn bị storage key bền vững trước commit DB. Trong transaction lưu tin và ít nhất một AnhPhong. DB rollback xác định: dọn file mới; commit chưa rõ: đối soát trước khi dọn. Job dọn mồ côi chỉ xóa file đủ tuổi và không được AnhPhong tham chiếu. Không công khai thư mục ảnh trực tiếp; API đọc ảnh kiểm tra quyền tin. Giới hạn đề xuất 1–10 ảnh, 5 MiB/tệp, JPEG/PNG/WebP; kiểm nội dung thực và loại metadata nhạy cảm.

UC13 gửi ID ảnh giữ (đúng tin) và ảnh mới; tổng cuối 1–10. Thay tập tiện ích/chi phí cùng transaction. Có unique thứ tự ảnh: chuyển thứ tự cũ sang khoảng tạm không trùng rồi gán 0..n-1. File bỏ đi chỉ dọn sau commit và kiểm tra không còn tham chiếu. Không thêm bảng ảnh nháp/ticket.

## DB và Service

DB bảo vệ PK/FK, email/yêu thích duy nhất, giá/diện tích dương, enum, tọa độ, XOR audit và trùng lịch hoạt động khách/tin/giờ. FK mặc định NO ACTION/RESTRICT bảo toàn lịch sử. Service bảo vệ vai trò FK, địa chỉ Hà Nội, ít nhất một ảnh/cơ sở trường, chuyển trạng thái, trùng lịch chủ và nguyên tử liên bảng. Nhật ký có trạng thái trước/sau, đúng mục tiêu; không chứa mật khẩu/mã phiên.

## Ca kiểm thử backend cần chạy

1. Hai request cùng khách/tin/giờ: một lịch hoạt động, request sau trả lịch cũ.
2. Hai lịch khác tin cùng chủ/cùng giờ: tối đa một lịch xác nhận.
3. Ẩn tin đồng thời đặt/xác nhận: không còn lịch tương lai hoạt động sau commit ẩn.
4. Khóa đồng thời đăng nhập/ghi: không tạo phiên hợp lệ hoặc ghi mới sau commit khóa.
5. Sai version sửa/duyệt: 409; sửa tin bị từ chối được gửi duyệt lại.
6. UC14/19/20/21 lặp không lặp audit/hủy; mở khóa không phục hồi.
7. Lỗi file/DB không để tin commit thiếu ảnh; mất phản hồi phải đối soát trước retry.
