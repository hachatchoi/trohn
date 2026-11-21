# Bộ tài liệu TROHN dùng cho báo cáo

## Chuẩn bị báo cáo lần 2 — 15/10/2026

Đã rà soát lại ngày 14/10: [kết quả theo 4 nội dung thầy yêu cầu](Kiem-tra-2026-10-14/Ket_qua.md).

**Word thiết kế database:** [12 bảng cùng PK FK và ERD chân chim](../Database/THIET_KE_DATABASE_TROHN.docx), cập nhật 14/10, 20 trang đã xuất bằng Microsoft Word; phần sơ đồ mới đã kiểm bố cục. [Xem ERD chân chim](../Database/ERD/Xem_ERD.html).

**Class diagram một hình đầy đủ:** [mở bản có phóng to/tìm lớp](Class-Diagram/Tong-hop/Xem_Class_Diagram_FULL.html) · [PNG](Class-Diagram/Tong-hop/TROHN_Class_Diagram_FULL.png) · [SVG](Class-Diagram/Tong-hop/TROHN_Class_Diagram_FULL.svg) · [Draw.io](Class-Diagram/Tong-hop/TROHN_Class_Diagram_FULL.drawio).

Bản tổng hợp gồm 41 lớp/interface/enum/value object được khai báo trong bộ 6 trang, 95 phương thức; lớp trùng tên đã gộp. DTO hỗ trợ vẫn được mô tả trong API. Bản 6 trang dưới đây là nguồn chi tiết và được giữ nguyên.

Cập nhật 30/09/2026. Người dùng đã chốt **Class Diagram cũ 6 trang** làm chuẩn. Phạm vi 21 UC có đặt lịch xem phòng và tìm gần cơ sở trường; không đổi sang liên hệ/báo cáo của bộ 12 trang.

| Hạng mục | Tài liệu sử dụng |
|---|---|
| Đặc tả nghiệp vụ | [Dac_ta_21_UC_dong_bo.docx](../Dac-ta/Dac_ta_21_UC_dong_bo.docx) |
| Activity | [Activity_21_UC_dong_bo.drawio](../Activity/Activity_21_UC_dong_bo.drawio) |
| Sequence | [Sequence_21_UC_dong_bo.drawio](../Sequence/Sequence_21_UC_dong_bo.drawio) |
| Class Diagram | [Xem sơ đồ 6 trang](Class-Diagram/Xem_Class_Diagram.html), [Draw.io](Class-Diagram/TROHN_Class_Diagram_Da_Chinh_Sua.drawio) |
| Database | [README](../Database/README.md), [ERD](../Database/ERD/Xem_ERD.html), [Data Dictionary](../Database/Data_Dictionary.md), [giao dịch](../Database/TRANSACTIONS.md) |
| Kiến trúc | [Word](../Architecture/SYSTEM_ARCHITECTURE.docx), [Sơ đồ](../Architecture/So-do) |
| API | [Word thiết kế API](../API/THIET_KE_API_TROHN.docx), [Thiết kế REST API](../API/API_DESIGN.md) |
| Kết quả kiểm tra | [Báo cáo 14/10](Kiem-tra-2026-10-14/Ket_qua.md) |

Class giữ 11 entity, 6 trang. Ngày 30/09 bổ sung actorId/now cho hai phương thức hủy lịch hàng loạt, xuất lại ảnh trang 03–04; bản trong class-diagram và ZIP đã đồng bộ. Các chữ ký tầng HTTP được diễn giải đầy đủ bằng DTO trong API. Bộ 12 trang TROHN_Class_Diagram được giữ nguyên để tham khảo; không dùng lẫn hình của bộ đó vào báo cáo hiện tại.

Activity/Sequence/đặc tả Word giữ quy tắc UC14 đã đồng bộ 24/09. Đợt này không đổi nghiệp vụ các UC hoặc viết lại toàn bộ tên phương thức Sequence. Tên thông điệp Sequence có thể mô tả nghiệp vụ ở mức tổng quát; không coi đó là chữ ký Java hoàn chỉnh.

UC14: CHO_DUYET hoặc DANG_HIEN_THI → CHU_TRO_AN; đã CHU_TRO_AN trả hiện có; các trạng thái còn lại từ chối. Ẩn tin và hủy lịch tương lai hoạt động cùng transaction. Ghi lý do, nguồn HE_THONG, người thao tác gốc, thời điểm; không ghi/hủy lặp. Tin bị từ chối được sửa/gửi duyệt lại qua UC13, tin ADMIN_AN không được chủ tự khôi phục.

Các quyết định cấu trúc lớp/DB/API là thiết kế cho đồ án, không trình bày thành kết quả khảo sát hay tính năng đã vận hành. Backend chưa có mã triển khai. Word database và API đã xuất PDF để kiểm tra bố cục trong đợt 14/10. Kết quả này không xác nhận backend hoặc SQL đã chạy thực tế.


## Bổ sung kiến trúc ngày 14/10/2026

[Word kiến trúc](../Architecture/SYSTEM_ARCHITECTURE.docx) có sơ đồ tổng thể, local/production, bảng công nghệ, quyết định, NFR và 15 câu hỏi bảo vệ. Bảng đối chiếu chi tiết 21 UC đã chuyển sang tài liệu API. [Bảng đối chiếu](../API/DOI_CHIEU_THIET_KE.md) · [Ôn bảo vệ trong Word kiến trúc](../Architecture/SYSTEM_ARCHITECTURE.docx). Class nguồn/ảnh/FULL/ZIP được cập nhật chữ ký thiết kế; không phải kiểm thử backend.

Word API đã hợp nhất bổ sung DTO vào [file gốc THIET_KE_API_TROHN.docx](../API/THIET_KE_API_TROHN.docx) sau khi người dùng lưu và đóng Word.
