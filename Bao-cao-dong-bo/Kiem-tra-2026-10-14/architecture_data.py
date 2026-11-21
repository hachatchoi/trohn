from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[2]
# UC, module, method, read set, write set. Session and actor reads are shared.
MAPPING=[
('UC01','TaiKhoan','dangKy','TaiKhoan','TaiKhoan'),
('UC02','TaiKhoan','dangNhap','TaiKhoan','PhienDangNhap'),
('UC03','TaiKhoan','dangXuat','PhienDangNhap','PhienDangNhap'),
('UC04','TinDang','timKiem','TinDang, TaiKhoan, AnhPhong, TienIch, TinDang_TienIch, CoSoTruong','—'),
('UC05','TinDang','xemChiTiet','TinDang, TaiKhoan, AnhPhong, ChiPhiPhong, TienIch, TinDang_TienIch','—'),
('UC06','YeuThich','themYeuThich','TinDang, TaiKhoan, YeuThich','YeuThich'),
('UC07','YeuThich','boYeuThich','YeuThich','YeuThich (xóa mục lưu)'),
('UC08','YeuThich','xemDanhSach','YeuThich, TinDang, TaiKhoan, AnhPhong','—'),
('UC09','LichHen','datLich','TaiKhoan, TinDang, LichHen','LichHen'),
('UC10','LichHen','huyLich','TaiKhoan, TinDang, LichHen','LichHen'),
('UC11','LichHen','xemDanhSach','LichHen, TinDang, TaiKhoan','—'),
('UC12','TinDang','dangTin','TaiKhoan, TienIch','TinDang, AnhPhong, ChiPhiPhong, TinDang_TienIch'),
('UC13','TinDang','suaTin','TaiKhoan, TinDang, AnhPhong, TienIch, ChiPhiPhong, TinDang_TienIch','TinDang, AnhPhong, ChiPhiPhong, TinDang_TienIch'),
('UC14','TinDang','anTinCuaChuTro','TaiKhoan, TinDang, LichHen','TinDang, LichHen, NhatKyXuLy'),
('UC15','LichHen','xacNhanLich','TaiKhoan, TinDang, LichHen','LichHen'),
('UC16','LichHen','tuChoiLich','TaiKhoan, TinDang, LichHen','LichHen'),
('UC17','TinDang','duyetTin','TaiKhoan, TinDang','TinDang, NhatKyXuLy'),
('UC18','TinDang','tuChoiTin','TaiKhoan, TinDang','TinDang, NhatKyXuLy'),
('UC19','TinDang','anTinViPham','TaiKhoan, TinDang, LichHen','TinDang, LichHen, NhatKyXuLy'),
('UC20','TaiKhoan','khoaTaiKhoan','TaiKhoan, PhienDangNhap, TinDang, LichHen','TaiKhoan, PhienDangNhap, TinDang, LichHen, NhatKyXuLy'),
('UC21','TaiKhoan','moKhoaTaiKhoan','TaiKhoan','TaiKhoan, NhatKyXuLy')]
TECH=[
['React, TypeScript, Vite','Giao diện, kiểu dữ liệu và công cụ build','Có trong package.json; giao diện demo'],
['React Router, Leaflet','Điều hướng và hiển thị bản đồ','Có trong package.json'],
['Java và Spring Boot','Backend monolith phân tầng','Đề xuất; backend mới có thư mục khung'],
['Spring Security và BCrypt','Phiên, kiểm quyền, CSRF, băm mật khẩu','Đề xuất; chưa tích hợp'],
['Spring Data JPA','Repository, ánh xạ Entity và transaction','Đề xuất; chưa có mã thực thi'],
['MySQL / InnoDB','12 bảng, FK, unique, transaction, phiên đăng nhập','Có SQL thiết kế; chưa xác nhận chạy kiểm thử'],
['ImageStorage và vùng lưu ảnh','Lưu ảnh ngoài web root, truy cập qua API có kiểm quyền','Interface thiết kế; chưa triển khai'],
['GeoService','Tính khoảng cách đường chim bay tới cơ sở trường','Thiết kế dùng tọa độ; không gọi dịch vụ chỉ đường'],
['Reverse proxy HTTPS','Phục vụ React và chuyển /api tới backend','Phương án production; chưa triển khai']]
DECISIONS=[
['Monolith phân tầng','21 UC dùng chung dữ liệu và transaction; triển khai đơn giản','Một bản phát hành chung; cần giữ ranh giới module'],
['MySQL / InnoDB','Dữ liệu quan hệ, PK/FK, unique và thao tác nhiều bảng','Luật liên bảng vẫn phải kiểm tại Service'],
['Phiên trong MySQL','Khóa tài khoản và thu hồi phiên trong cùng transaction','Mỗi request bảo vệ cần tra phiên/tài khoản; DB chịu thêm đọc'],
['Ảnh ngoài DB','DB giữ metadata và khóa lưu trữ; tránh chứa tệp lớn','File và DB không cùng transaction; phải bù trừ và đối soát'],
['Một tin đại diện một phòng cho thuê','Phù hợp phạm vi hiện tại, ít mô hình trung gian','Chưa quản lý lịch sử nhiều lần đăng cho cùng phòng vật lý'],
['Ẩn tin, giữ lịch sử','Giữ lịch hẹn, yêu thích và nhật ký để đối chiếu','Mọi truy vấn công khai phải lọc cả tin và chủ tài khoản'],
['Khoảng cách tính theo cơ sở trường','Một tin có thể gần nhiều cơ sở; không cần FK tin–trường','Chỉ là đường chim bay, phụ thuộc chất lượng tọa độ'],
['Version kết hợp khóa giao dịch','Ngăn ghi đè và xung đột xác nhận giữa nhiều lịch','Cần thống nhất thứ tự khóa, xử lý deadlock và kiểm thử cạnh tranh']]
NFR=[
['NFR01 Quyền truy cập','Mọi API riêng tư kiểm phiên, vai trò và chủ sở hữu','Thử ma trận 3 vai trò, đổi ID sang dữ liệu người khác; không lộ dữ liệu/không ghi trái quyền'],
['NFR02 Phiên và CSRF','Phiên thu hồi không dùng lại; request ghi cần Origin và CSRF hợp lệ','Khóa tài khoản rồi gọi lại; thử thiếu/sai token và origin; quan sát DB không đổi'],
['NFR03 Nhất quán','Ẩn tin/khóa tài khoản và các cập nhật liên quan cùng commit hoặc rollback','Chèn lỗi giữa các bước; kiểm tin, lịch, phiên và nhật ký cùng trở về trạng thái trước'],
['NFR04 Chống trùng lịch','Một lịch hoạt động cho khách–tin–giờ; chủ không xác nhận hai lịch cùng giờ','Chạy đồng thời 2 request UC09 và 2 request UC15 khác tin; kiểm DB và HTTP 200/201/409 theo trường hợp'],
['NFR05 Upload','1–10 ảnh, tối đa 5 MiB/tệp; tổng request tối đa 55 MiB','Thử ảnh giả đuôi, quá giới hạn, giữ ảnh sai tin, DB lỗi; không commit tin thiếu ảnh'],
['NFR06 Tìm kiếm','Mục tiêu thử nghiệm: p95 ≤2 giây cho GET /listings ở 20 người dùng đồng thời','Đề xuất dữ liệu 10.000 tin/100 cơ sở, size=20, máy 4 vCPU/8 GiB; warm-up 1 phút, đo 5 phút cả bộ lọc thường/gần trường; ghi cấu hình thực và tỷ lệ lỗi'],
['NFR07 Sao lưu','Có thể phục hồi DB và vùng ảnh từ bộ sao lưu đã kiểm tra','Thử phục hồi vào môi trường riêng; đối chiếu số bản ghi, FK và ảnh; đo thời gian thực, chưa cam kết RTO/RPO'],
['NFR08 Truy vết','Lỗi có requestId; nhật ký có actor, mục tiêu, trạng thái trước/sau','Kiểm lỗi và audit; không có mật khẩu, cookie hoặc mã phiên trong log']]
QA=[
('Vì sao chọn monolith thay vì microservices?','Phạm vi 21 UC, một nhóm phát triển và nhiều nghiệp vụ cần transaction chung. Monolith giảm công vận hành; Controller, Service và Repository vẫn tách trách nhiệm.'),
('Controller, Service và Repository khác nhau thế nào?','Controller ánh xạ HTTP và DTO; Service kiểm nghiệp vụ, quyền và transaction; Repository truy cập dữ liệu. Kiểm quyền sở hữu không chỉ thực hiện ở giao diện.'),
('Vì sao 11 entity nhưng 12 bảng?','TinDang_TienIch là bảng nối quan hệ nhiều–nhiều giữa TinDang và TienIch. Value object và DTO không mặc định sinh bảng.'),
('Vì sao dùng phiên MySQL?','Yêu cầu khóa tài khoản cần thu hồi toàn bộ phiên cùng giao dịch. Mã phiên thô chỉ ở cookie; DB lưu hash. Mở khóa không làm phiên cũ hợp lệ trở lại.'),
('Khách có thể gửi actorId của người khác không?','Backend tự dựng ActorContext từ phiên hợp lệ. Không dùng actorId hoặc vai trò do client gửi để quyết định quyền.'),
('Hai người xác nhận lịch cùng giờ thì sao?','UC15 khóa hàng tài khoản chủ theo thứ tự thống nhất rồi đọc hiện trạng trên tất cả tin của chủ. Tối đa một lịch được xác nhận; request xung đột nhận 409. Version của từng lịch riêng lẻ không đủ.'),
('Ẩn tin thì lịch và yêu thích ra sao?','Hủy các lịch tương lai còn hoạt động trong cùng transaction, ghi nguồn và người thao tác; giữ lịch sử và mục yêu thích. Tin không còn công khai; mục lưu không khả dụng không được lộ nội dung riêng.'),
('Ảnh lưu ở đâu và lỗi DB xử lý thế nào?','DB giữ khóa file và metadata, tệp nằm ngoài web root. Rollback xác định thì dọn file mới; commit chưa rõ thì đối soát trước khi dọn. Chỉ dọn file bỏ sau commit và kiểm tham chiếu.'),
('Tìm gần trường có cần gắn tin vào một trường không?','Không. GeoService tính khoảng cách từ tọa độ tin tới CoSoTruong được chọn. Một tin có thể gần nhiều cơ sở; đây là khoảng cách đường chim bay.'),
('Vì sao API nhiều hơn số use case?','21 UC có 21 thao tác nghiệp vụ chính; 13 endpoint đọc hỗ trợ chi tiết, danh mục, phiên và quản trị. Endpoint hỗ trợ không tự tạo thêm nghiệp vụ ghi.'),
('Tên API tiếng Anh có phải tên hàm Java không?','Đó là nhãn thao tác HTTP trong tài liệu. Bảng đối chiếu chỉ rõ tên phương thức Java thiết kế tương ứng; không yêu cầu hai tên giống chữ. Endpoint và HTTP method nhận diện thao tác HTTP.'),
('Vì sao dùng POST cho xác nhận hoặc ẩn tin?','Đó là lệnh nghiệp vụ có điều kiện và tác động nhiều dữ liệu. Thiết kế mô tả rõ trạng thái nguồn/đích, quyền và kết quả khi gọi lặp, thay vì cho client cập nhật trạng thái tùy ý.'),
('Hệ thống đã chạy thật và test Postman chưa?','Chưa. Hiện có giao diện demo và bộ thiết kế; backend mới là khung thư mục. Chỉ có thể báo kết quả API thật sau khi triển khai, nối DB và chạy ca kiểm thử.'),
('Chỉ tiêu hiệu năng đã đạt chưa?','Chưa. NFR06 là mục tiêu đề xuất có cấu hình và kịch bản đo; cần đo p95, tỷ lệ lỗi và ghi kết quả trước khi khẳng định đạt.'),
('Nếu thầy hỏi bước tiếp theo là gì?','Chạy schema/index/seed/verify trên MySQL thử nghiệm; dựng backend và xác thực; triển khai luồng đăng nhập–tìm phòng–đặt lịch; kiểm quyền, rollback và cạnh tranh rồi nối frontend.')]

def api_rows():
    s=(ROOT/'API/API_DESIGN.md').read_text(encoding='utf-8')
    return {r[0].split()[0]:r for line in s.splitlines() if re.match(r'^\| UC\d',line) for r in [[x.strip() for x in line.strip('|').split('|')]]}
