# Quan hệ khóa ngoại

- `TaiKhoan` 1 → 0..* `PhienDangNhap` qua `taiKhoanId`.
- `TaiKhoan` 1 → 0..* `TinDang` qua `chuTroId`.
- `TinDang` 1 → 0..* `AnhPhong` qua `tinDangId`.
- `TinDang` 1 → 0..* `ChiPhiPhong` qua `tinDangId`.
- `TinDang` 1 → 0..* `TinDang_TienIch` qua `tinDangId`.
- `TienIch` 1 → 0..* `TinDang_TienIch` qua `tienIchId`.
- `TaiKhoan` 1 → 0..* `YeuThich` qua `khachThueId`.
- `TinDang` 1 → 0..* `YeuThich` qua `tinDangId`.
- `TaiKhoan` 1 → 0..* `LichHen` qua `khachThueId`.
- `TinDang` 1 → 0..* `LichHen` qua `tinDangId`.
- `TaiKhoan` 1 → 0..* `LichHen` qua `nguoiHuyId`.
- `TruongDaiHoc` 1 → 0..* `CoSoTruong` qua `truongDaiHocId`.
- `TaiKhoan` 1 → 0..* `NhatKyXuLy` qua `nguoiThucHienId`.
- `TinDang` 1 → 0..* `NhatKyXuLy` qua `tinDangMucTieuId`.
- `TaiKhoan` 1 → 0..* `NhatKyXuLy` qua `taiKhoanMucTieuId`.

FK mục tiêu nhật ký và người hủy được phép NULL; các FK còn lại bắt buộc. Hai mục tiêu nhật ký XOR. Ít nhất một ảnh của tin đã lưu do Service bảo đảm.


## Bội số trường đại học và cơ sở trường

Quy tắc nghiệp vụ: mỗi TruongDaiHoc phải có ít nhất một CoSoTruong (1..* trong Class Diagram). ERD vật lý ghi 0..* vì FK chỉ buộc mỗi cơ sở tham chiếu một trường tồn tại, không buộc trường phải có bản ghi con. Khi nạp/cập nhật danh mục, cần kiểm tra điều kiện này trước khi hoàn tất giao dịch, không để thao tác xóa hoặc chuyển cơ sở làm trường mất cơ sở cuối cùng. Truy vấn truong_thieu_co_so trong SQL/04_verify_data.sql phải trả về 0 dòng; đây là kiểm tra phát hiện vi phạm, không phải ràng buộc tự chặn mọi lần ghi.
