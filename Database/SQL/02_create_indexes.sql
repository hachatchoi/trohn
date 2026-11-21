-- Indexes beyond PK/UNIQUE/FK indexes. Review actual query plans after implementation.
CREATE INDEX idx_tin_search ON TinDang(trangThai, thanhPho, quanHuyen, ngayTao);
CREATE INDEX idx_tin_price ON TinDang(trangThai, giaThue);
CREATE INDEX idx_tin_area ON TinDang(trangThai, dienTich);
CREATE INDEX idx_tin_owner ON TinDang(chuTroId, trangThai, ngayCapNhat);
CREATE INDEX idx_tin_queue ON TinDang(trangThai, ngayTao);
CREATE INDEX idx_lich_tenant ON LichHen(khachThueId, trangThai, thoiDiemHen);
CREATE INDEX idx_lich_listing ON LichHen(tinDangId, trangThai, thoiDiemHen);
CREATE INDEX idx_favorite_date ON YeuThich(khachThueId, ngayLuu);
CREATE INDEX idx_session_account ON PhienDangNhap(taiKhoanId, thuHoiLuc, hetHanLuc);
CREATE INDEX idx_session_expiry ON PhienDangNhap(hetHanLuc);
CREATE INDEX idx_audit_actor ON NhatKyXuLy(nguoiThucHienId, thoiDiem);
CREATE INDEX idx_audit_listing ON NhatKyXuLy(tinDangMucTieuId, thoiDiem);
CREATE INDEX idx_audit_account ON NhatKyXuLy(taiKhoanMucTieuId, thoiDiem);
-- UC04 baseline uses parameterized LIKE; FULLTEXT is not required for the demo.
