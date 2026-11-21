# TROHN — ghi chú bản Class Diagram đã chỉnh sửa

Bản này thay thế bộ Class Diagram cũ cho phần thiết kế lớp. File cũ vẫn được giữ ở thư mục cha để đối chiếu. Bộ gồm 6 trang; trang 01 là sơ đồ lớp nghiệp vụ tổng thể, có 11 Entity. Hai value object ở trang 04 hỗ trợ chữ ký phương thức và không mặc định tạo bảng riêng.

## Các thay đổi đã thực hiện

| Nội dung rà soát | Thay đổi |
|---|---|
| Người hủy lịch | Thêm association `TaiKhoan 0..1 — 0..* LichHen`, vai trò `nguoiHuy`; tách biệt association `khachThue`. Không lặp lại thành một thuộc tính thứ hai trong ngăn thuộc tính. |
| Chi phí | Bỏ chuỗi `chiPhiKhac` trong TinDang; thêm ChiPhiPhong gồm tên, số tiền, đơn vị, ghi chú. Quan hệ composition TinDang 1 — 0..* ChiPhiPhong. Bổ sung enum DonViTinhChiPhi. |
| Địa chỉ | Tách diaChiChiTiet, phuongXa, quanHuyen tùy chọn, thanhPho. quanHuyen phục vụ phân nhóm tìm kiếm khi có dữ liệu, không coi là cấp bắt buộc của mọi địa chỉ. Tọa độ có đủ cặp hoặc cùng trống. |
| Nhật ký | Làm rõ ba vai trò nguoiThucHien, tinDangMucTieu, taiKhoanMucTieu. Đúng một mục tiêu được điền. DuLieuNhatKy định nghĩa đủ thông tin tạo nhật ký, không dùng dấu ba chấm. |
| Bội số ảnh | Giữ 1..* vì UC12 tạo tin sau khi form hợp lệ. Ghi rõ áp dụng cho tin đã lưu/gửi duyệt. Bản nháp phía giao diện chưa phải Entity TinDang đã lưu. |
| Chữ ký phương thức | Điền kiểu tham số và kiểu trả về, kể cả Controller, Service, Repository, PasswordHasher, GeoService và ImageStorage. Constructor NhatKyXuLy không có kiểu trả về. |
| Tách nghiệp vụ với API | TinDang nhận NoiDungTin là value object, Service ánh xạ từ TinDangRequest. Entity không cần phụ thuộc DTO HTTP. |
| Danh tính người thao tác | ActorContext do backend dựng từ phiên hợp lệ/SecurityContext; frontend không quyết định actorId hoặc vai trò. |
| Đăng xuất | Thêm revokeCurrent vào SessionRepository; revokeAllByTaiKhoan dùng cho khóa tài khoản. |
| UC14 | Áp dụng phương án: chỉ CHO_DUYET hoặc DANG_HIEN_THI chuyển CHU_TRO_AN; đã CHU_TRO_AN trả kết quả cũ; trạng thái khác từ chối. Cần đồng bộ cách diễn đạt này khi cập nhật đặc tả/Activity/Sequence. |
| Trạng thái và giao dịch | Giữ lịch cũ khi sửa tin; hủy lịch tương lai đang hoạt động khi ẩn tin/khóa tài khoản; mở khóa không phục hồi phiên/lịch/tin. Có ghi chú chống trùng giữa hai lịch khác nhau, không chỉ dựa vào version. |

## Danh mục UC dùng trong bộ sơ đồ

| UC | Tên |
|---|---|
| UC01 | Đăng ký |
| UC02 | Đăng nhập |
| UC03 | Đăng xuất |
| UC04 | Tìm kiếm phòng |
| UC05 | Xem chi tiết phòng |
| UC06 | Thêm phòng vào danh sách yêu thích |
| UC07 | Xóa phòng khỏi danh sách yêu thích |
| UC08 | Xem danh sách phòng yêu thích |
| UC09 | Đặt lịch xem phòng |
| UC10 | Hủy lịch xem phòng |
| UC11 | Xem danh sách lịch hẹn |
| UC12 | Đăng tin |
| UC13 | Sửa tin |
| UC14 | Chủ trọ ẩn tin |
| UC15 | Xác nhận lịch xem phòng |
| UC16 | Từ chối lịch xem phòng |
| UC17 | Duyệt tin đăng |
| UC18 | Từ chối tin đăng |
| UC19 | Admin ẩn tin đăng |
| UC20 | Khóa tài khoản |
| UC21 | Mở khóa tài khoản |

Phạm vi bản chỉnh sửa này là Class Diagram và các ảnh xuất kèm. Jira, README, frontend và bộ đặc tả/Sequence/Activity cũ chưa được thay đổi. Những tên UC cũ ở các nơi đó cần được đối chiếu với bảng trên khi cập nhật tài liệu.

## Các quyết định cần hiểu khi bảo vệ

- Một tài khoản có một vai trò; đặc tả chưa yêu cầu cùng tài khoản vừa là khách vừa là chủ.
- Một TinDang chứa thông tin một phòng cho thuê; chưa cần tách Phong vật lý và lịch sử đăng tin.
- Không có lớp hợp đồng, thanh toán vì ngoài phạm vi 21 UC.
- Khoảng cách được tính tới từng CoSoTruong; một tin có thể gần nhiều trường. Đây là phần mở rộng tìm gần trường đã được yêu cầu.
- NguonHuy cho biết khách chủ động hủy hay hệ thống hủy theo nghiệp vụ. Nếu ẩn tin/khóa tài khoản dẫn đến hủy, nguoiHuy ghi người thực hiện thao tác gốc; tự động hoàn toàn có thể để trống.
- ChiPhiPhong.soTien là đơn giá theo đơn vị ghi kèm, không tự động là tổng phí hàng tháng. Ví dụ giá điện dùng KWH, phí dịch vụ theo PHONG_THANG.
- Thu hồi phiên lưu trong cùng MySQL phù hợp yêu cầu giao dịch UC20. Nếu đổi sang JWT hoặc kho phiên khác, phải rà soát lại cơ chế thu hồi và tính nhất quán.
- Các phương thức Repository trên các trang khác nhau là các phần của cùng interface. Đây là thiết kế chức năng, không phải toàn bộ API tự sinh của Spring Data JPA.
- UploadFile, StoredImage, ActorContext, Page và các Request/Response là kiểu hỗ trợ; không mặc định tạo bảng cho chúng.

Thiết kế được đối chiếu với tài liệu hiện có; không thay thế kết quả khảo sát thực tế hoặc bằng chứng người dùng xác nhận nghiệp vụ.

## Đồng bộ ngày 30/09/2026

Người dùng chốt bộ cũ 6 trang làm chuẩn. Bộ TROHN_Class_Diagram 12 trang dùng phạm vi khác, được giữ để tham khảo, không thay thế bản này. Đã đồng bộ Database/SQL, ERD, Data Dictionary, Architecture và API theo 21 UC trong bảng trên.

Bổ sung actorId và now cho hai phương thức cancelFutureActiveByTaiKhoan/cancelFutureActiveByTin ở trang 03/04, để bulk update ghi đúng người thao tác gốc, thời điểm và lý do hủy; nguồn hủy của hai phương thức này luôn HE_THONG. actorId phải lấy từ ActorContext đã xác thực. Cập nhật version/ngayCapNhat cho lịch cùng transaction. Ảnh trang 03/04 đã xuất lại.

Vai trò chuẩn ADMIN; đơn vị KWH, M3, NGUOI_THANG, PHONG_THANG, XE_THANG, LAN. SQL dùng tên thuộc tính theo class; FK ánh xạ association. Cột sinh LichHen.dangHoatDong chỉ là chi tiết lưu trữ phục vụ UNIQUE. SessionRepository.findSession nhận mã phiên từ cookie qua lớp xác thực và tra theo hash, không lưu mã thô. Kiểu String sessionId trong API nội bộ không phải PK Long của PhienDangNhap.

Giao dịch và thứ tự khóa: Database/TRANSACTIONS.md. DTO HTTP đầy đủ: API/API_DESIGN.md. NoiDungTin và DuLieuNhatKy là hai value object ở trang 04; không có entity/bảng DiaChi riêng.


## Bổ sung kiến trúc và đồng bộ ngày 14/10/2026

Controller/Service của 21 thao tác nghiệp vụ đã đồng bộ kiểu dữ liệu trả về, tham số photos/SuaTinRequest và phân trang yêu thích theo API. Số lớp và phương thức đã khai báo vẫn là 41 và 95 ở bản FULL. DTO mới được định nghĩa tại API/API_DESIGN.md; xem API/DOI_CHIEU_THIET_KE.md để phân biệt data, envelope HTTP và metadata tạo mới của UC09. Không khẳng định đã vẽ riêng toàn bộ 13 endpoint hỗ trợ hoặc kiểm chứng backend/Sequence bằng thực thi.
