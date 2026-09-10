# TROHN — Web cho thuê trọ dành cho sinh viên Hà Nội

Repository đồ án, hiện chỉ có cấu trúc thư mục và tài liệu định hướng, chưa triển khai mã nguồn.

## Công nghệ dự kiến
- Frontend: React + TypeScript.
- Backend: Java + Spring Boot, Maven, Spring Security, Spring Data JPA.
- Database: MySQL; Flyway quản lý migration.
- Môi trường: Docker Compose (sẽ cấu hình khi triển khai).

## Cấu trúc thư mục
```
trohn/
├── README.md
├── .gitignore
├── .env.example
├── backend/
│   └── src/
│       ├── main/
│       │   ├── java/vn/trohn/
│       │   │   ├── config/
│       │   │   ├── security/
│       │   │   ├── common/
│       │   │   ├── model/
│       │   │   ├── controller/
│       │   │   ├── repository/
│       │   │   ├── service/
│       │   │   └── dto/
│       │   └── resources/db/migration/
│       └── test/java/vn/trohn/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── routes/
│       ├── services/
│       ├── hooks/
│       ├── types/
│       └── styles/
└── docs/
    ├── requirements.md
    ├── architecture.md
    ├── database.md
    ├── api.md
    └── plan.md
```

Các file `.gitkeep` giữ thư mục trống trong Git. Chưa có `pom.xml`, `package.json`, ứng dụng hoặc cấu hình chạy; các file này sẽ được tạo khi bắt đầu lập trình.

## Phạm vi dự kiến
Backend tổ chức theo tầng: Controller nhận request, Service xử lý nghiệp vụ, Repository truy cập MySQL. Model chứa các Entity ánh xạ bảng; DTO chứa dữ liệu request/response. Các thư mục config, security và common chứa cấu hình, bảo mật và thành phần dùng chung.

- Sinh viên: tìm/lọc phòng, xem chi tiết, lưu yêu thích, gửi yêu cầu liên hệ.
- Chủ trọ: đăng và quản lý tin, cập nhật tình trạng phòng.
- Quản trị viên: duyệt tin, quản lý tài khoản, xử lý báo cáo.

## Thành viên
Sẽ bổ sung họ tên, mã sinh viên, lớp và phân công theo yêu cầu môn học.
