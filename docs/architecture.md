# Kiến trúc hệ thống dự kiến

React → REST API Spring Boot → MySQL.

Backend tổ chức theo tầng:

- `controller/`: nhận HTTP request, kiểm tra dữ liệu đầu vào và trả response.
- `service/`: xử lý nghiệp vụ, giao dịch và kiểm tra quyền theo nghiệp vụ.
- `repository/`: truy vấn cơ sở dữ liệu qua Spring Data JPA.
- `model/`: các Entity ánh xạ bảng MySQL, ví dụ User và Listing khi triển khai.
- `dto/`: dữ liệu request/response của API.
- `config/`: cấu hình ứng dụng.
- `security/`: xác thực và phân quyền.
- `common/`: thành phần dùng chung.

Luồng xử lý: React → Controller → Service → Repository → MySQL.
Repository làm việc với Entity trong model; API dùng DTO để trao đổi dữ liệu.

Chưa có mã nguồn hoặc cấu hình hoạt động.
