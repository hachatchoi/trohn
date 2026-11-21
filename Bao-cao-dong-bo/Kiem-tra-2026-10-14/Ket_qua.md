# Rà soát tài liệu báo cáo TROHN ngày 14/10/2026

Đủ tài liệu cho bốn nội dung thiết kế trong thông báo báo cáo ngày 15/10. Kết luận dựa trên kiểm tra tệp, cấu trúc và các điểm đối chiếu dưới đây; không phải xác nhận toàn bộ hệ thống đã triển khai hoặc kiểm thử thành công.

| Nội dung | Kết quả |
|---|---|
| Class Diagram | Hai bản 6 trang giống nhau theo SHA-256. Bản FULL có một canvas, 41 tiêu đề lớp/interface/enum/value object và 95 khai báo phương thức. |
| Database và ERD | SQL có 12 bảng, 15 FK; ERD có đủ 12 bảng và 15 liên kết FK. Các cột dữ liệu được trích từ SQL đều có trong ERD. Có schema, indexes, sample data và script verify. |
| Word database | Có đặc tả bảng/PK/FK. Năm ảnh nhúng khớp byte với PNG mới; màu theo file người dùng, hàng PK phân cách. Đã xuất 20 trang và kiểm tra trực quan các trang ERD 15–19. |
| Kiến trúc | Có Markdown, Word và PDF. Nêu React → Security → Controller → Service → Repository → MySQL, ImageStorage và GeoService; phân biệt thiết kế với trạng thái triển khai. |
| API | Word có 34 cặp method/endpoint duy nhất: 21 nghiệp vụ, 13 hỗ trợ. Cột tên API nghiệp vụ không còn mã UC; tên thao tác tiếng Anh là tên đề xuất, không phải bằng chứng có hàm backend. Có request/response, quyền, lỗi và ví dụ. |
| Tài liệu nghiệp vụ | Đặc tả Word có UC01–UC21. Activity có 21 trang; Sequence có 42 trang gồm 21 luồng nghiệp vụ và 21 luồng lỗi. |

## Sửa trong lần rà soát

- Sửa 7 liên kết hỏng trong trang tổng hợp báo cáo; bổ sung liên kết Word API.
- Sửa đường dẫn nguồn đặc tả trong API Markdown và các liên kết báo cáo cũ tại trohn/docs.
- Cập nhật ghi chú cũ về khả năng xuất Word, vì database và API đã xuất kiểm tra bằng Microsoft Word.

## Giới hạn cần trình bày đúng

- Backend hiện chỉ có các thư mục với .gitkeep. Chưa có endpoint thật để demo Postman.
- Lần rà soát này không import SQL, chạy MySQL hay chạy các ca nghiệp vụ; chưa xác nhận tính đúng khi thực thi và cạnh tranh giao dịch.
- FULL gộp đầy đủ các thành phần đã khai báo trong 6 trang, nhưng không vẽ riêng toàn bộ DTO request/response; chi tiết DTO nằm trong API.
- Cập nhật bổ sung 14/10: đã đồng bộ Controller/Service cho 21 thao tác nghiệp vụ về kiểu data trả về, tham số ảnh/SuaTinRequest và phân trang. Bảng đối chiếu tại API/DOI_CHIEU_THIET_KE.md; kiểm tra tĩnh 42 phương thức Controller/Service. Envelope HTTP, metadata tạo mới và 13 endpoint hỗ trợ vẫn cần hiện thực khi dựng backend; không khẳng định đã kiểm từng thông điệp Sequence.
- Bảng API Word đã kiểm tra trang 2–3 sau sửa tên. Hàng cuối tiếp sang trang 3 và có lặp tiêu đề, không mất nội dung.

Nên dùng README của Bao-cao-dong-bo làm điểm mở tài liệu khi báo cáo; trình bày đây là bộ thiết kế và nêu rõ phần triển khai còn lại nếu thầy hỏi demo.


## Kết quả bổ sung kiến trúc

Tài liệu Architecture/SYSTEM_ARCHITECTURE.docx và PDF hiện có 16 trang, 3 sơ đồ, bảng công nghệ, 8 quyết định kiến trúc, 8 nhóm NFR, đối chiếu 21 UC và 15 câu hỏi bảo vệ. Đã kiểm tra bố cục sau xuất Word. Kiểm tra tĩnh ở architecture-verification.json: 42 phương thức Controller/Service và tên bảng hợp lệ; bản nguồn class và FULL khớp. Word API đã hợp nhất bổ sung DTO vào file gốc API/THIET_KE_API_TROHN.docx sau khi người dùng lưu và đóng Word. Không chạy backend hoặc DB trong lần bổ sung này.
