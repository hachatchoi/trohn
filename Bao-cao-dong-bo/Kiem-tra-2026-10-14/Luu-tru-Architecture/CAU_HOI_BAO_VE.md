# Câu hỏi bảo vệ TROHN

## 1 Vì sao chọn monolith thay vì microservices?

Phạm vi 21 UC, một nhóm phát triển và nhiều nghiệp vụ cần transaction chung. Monolith giảm công vận hành; Controller, Service và Repository vẫn tách trách nhiệm.

## 2 Controller, Service và Repository khác nhau thế nào?

Controller ánh xạ HTTP và DTO; Service kiểm nghiệp vụ, quyền và transaction; Repository truy cập dữ liệu. Kiểm quyền sở hữu không chỉ thực hiện ở giao diện.

## 3 Vì sao 11 entity nhưng 12 bảng?

TinDang_TienIch là bảng nối quan hệ nhiều–nhiều giữa TinDang và TienIch. Value object và DTO không mặc định sinh bảng.

## 4 Vì sao dùng phiên MySQL?

Yêu cầu khóa tài khoản cần thu hồi toàn bộ phiên cùng giao dịch. Mã phiên thô chỉ ở cookie; DB lưu hash. Mở khóa không làm phiên cũ hợp lệ trở lại.

## 5 Khách có thể gửi actorId của người khác không?

Backend tự dựng ActorContext từ phiên hợp lệ. Không dùng actorId hoặc vai trò do client gửi để quyết định quyền.

## 6 Hai người xác nhận lịch cùng giờ thì sao?

UC15 khóa hàng tài khoản chủ theo thứ tự thống nhất rồi đọc hiện trạng trên tất cả tin của chủ. Tối đa một lịch được xác nhận; request xung đột nhận 409. Version của từng lịch riêng lẻ không đủ.

## 7 Ẩn tin thì lịch và yêu thích ra sao?

Hủy các lịch tương lai còn hoạt động trong cùng transaction, ghi nguồn và người thao tác; giữ lịch sử và mục yêu thích. Tin không còn công khai; mục lưu không khả dụng không được lộ nội dung riêng.

## 8 Ảnh lưu ở đâu và lỗi DB xử lý thế nào?

DB giữ khóa file và metadata, tệp nằm ngoài web root. Rollback xác định thì dọn file mới; commit chưa rõ thì đối soát trước khi dọn. Chỉ dọn file bỏ sau commit và kiểm tham chiếu.

## 9 Tìm gần trường có cần gắn tin vào một trường không?

Không. GeoService tính khoảng cách từ tọa độ tin tới CoSoTruong được chọn. Một tin có thể gần nhiều cơ sở; đây là khoảng cách đường chim bay.

## 10 Vì sao API nhiều hơn số use case?

21 UC có 21 thao tác nghiệp vụ chính; 13 endpoint đọc hỗ trợ chi tiết, danh mục, phiên và quản trị. Endpoint hỗ trợ không tự tạo thêm nghiệp vụ ghi.

## 11 Tên API tiếng Anh có phải tên hàm Java không?

Đó là nhãn thao tác HTTP trong tài liệu. Bảng đối chiếu chỉ rõ tên phương thức Java thiết kế tương ứng; không yêu cầu hai tên giống chữ. Endpoint và HTTP method nhận diện thao tác HTTP.

## 12 Vì sao dùng POST cho xác nhận hoặc ẩn tin?

Đó là lệnh nghiệp vụ có điều kiện và tác động nhiều dữ liệu. Thiết kế mô tả rõ trạng thái nguồn/đích, quyền và kết quả khi gọi lặp, thay vì cho client cập nhật trạng thái tùy ý.

## 13 Hệ thống đã chạy thật và test Postman chưa?

Chưa. Hiện có giao diện demo và bộ thiết kế; backend mới là khung thư mục. Chỉ có thể báo kết quả API thật sau khi triển khai, nối DB và chạy ca kiểm thử.

## 14 Chỉ tiêu hiệu năng đã đạt chưa?

Chưa. NFR06 là mục tiêu đề xuất có cấu hình và kịch bản đo; cần đo p95, tỷ lệ lỗi và ghi kết quả trước khi khẳng định đạt.

## 15 Nếu thầy hỏi bước tiếp theo là gì?

Chạy schema/index/seed/verify trên MySQL thử nghiệm; dựng backend và xác thực; triển khai luồng đăng nhập–tìm phòng–đặt lịch; kiểm quyền, rollback và cạnh tranh rồi nối frontend.