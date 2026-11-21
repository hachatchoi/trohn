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
