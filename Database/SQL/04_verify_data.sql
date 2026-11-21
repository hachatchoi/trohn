-- Read-only assertions: every violation query must return ZERO rows.
SELECT t.id AS tin_thieu_anh FROM TinDang t LEFT JOIN AnhPhong a ON a.tinDangId=t.id GROUP BY t.id HAVING COUNT(a.id)=0;
SELECT t.id AS sai_vai_tro_chu FROM TinDang t JOIN TaiKhoan u ON u.id=t.chuTroId WHERE u.vaiTro <> 'CHU_TRO';
SELECT l.id AS sai_vai_tro_khach FROM LichHen l JOIN TaiKhoan u ON u.id=l.khachThueId WHERE u.vaiTro <> 'KHACH_THUE';
SELECT y.id AS sai_vai_tro_luu FROM YeuThich y JOIN TaiKhoan u ON u.id=y.khachThueId WHERE u.vaiTro <> 'KHACH_THUE';
SELECT t.id AS tin_con_hien_khi_khoa FROM TinDang t JOIN TaiKhoan u ON u.id=t.chuTroId WHERE t.trangThai='DANG_HIEN_THI' AND u.trangThai <> 'HOAT_DONG';
SELECT khachThueId,tinDangId,thoiDiemHen,COUNT(*) AS n FROM LichHen WHERE trangThai IN ('CHO_XAC_NHAN','DA_XAC_NHAN') GROUP BY khachThueId,tinDangId,thoiDiemHen HAVING COUNT(*)>1;
SELECT t.chuTroId,l.thoiDiemHen,COUNT(*) AS n FROM LichHen l JOIN TinDang t ON t.id=l.tinDangId WHERE l.trangThai='DA_XAC_NHAN' GROUP BY t.chuTroId,l.thoiDiemHen HAVING COUNT(*)>1;
SELECT l.id AS lich_chua_huy FROM LichHen l JOIN TinDang t ON t.id=l.tinDangId JOIN TaiKhoan k ON k.id=l.khachThueId JOIN TaiKhoan c ON c.id=t.chuTroId WHERE l.thoiDiemHen>UTC_TIMESTAMP(6) AND l.trangThai IN ('CHO_XAC_NHAN','DA_XAC_NHAN') AND (t.trangThai IN ('CHU_TRO_AN','ADMIN_AN','AN_DO_KHOA_TAI_KHOAN') OR k.trangThai='BI_KHOA' OR c.trangThai='BI_KHOA');
SELECT id AS sai_muc_tieu FROM NhatKyXuLy WHERE (tinDangMucTieuId IS NULL)=(taiKhoanMucTieuId IS NULL);
-- Business rule: every university must have at least one campus.
-- This read-only query detects violations; it does NOT enforce writes.
-- Validate the catalog transaction before completion, including deleting/moving the last campus.
SELECT t.id AS truong_thieu_co_so FROM TruongDaiHoc t LEFT JOIN CoSoTruong c ON c.truongDaiHocId=t.id GROUP BY t.id HAVING COUNT(c.id)=0;
