# Giao diện Trohn

Ứng dụng React dùng Vite, TypeScript và Leaflet. Xem [hướng dẫn chạy toàn bộ dự án](../README.md) để cấu hình MySQL, khởi động API Spring Boot và chạy giao diện.

- `pnpm dev` khởi động giao diện tại http://127.0.0.1:5176.
- `pnpm build` kiểm tra TypeScript và tạo thư mục `dist`.
- Khi triển khai bản build qua máy chủ web, chuyển tiếp đường dẫn `/api` về backend và cấu hình HTTPS. Cookie phiên chỉ được gửi tới `/api`.

