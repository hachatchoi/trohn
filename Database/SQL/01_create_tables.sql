-- TROHN 30/09/2026. MySQL 8.0.16+; only initialize an EMPTY database.
-- All FK deletions default to RESTRICT/NO ACTION. No business hard-delete API.
-- Date-times are UTC. Application enforces cross-table rules; see TRANSACTIONS.md.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- TaiKhoan: UC01–03, UC20–21
CREATE TABLE TaiKhoan (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    hoTen VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    soDienThoai VARCHAR(20) NOT NULL,
    matKhauBam VARCHAR(255) NOT NULL,
    vaiTro VARCHAR(20) NOT NULL,
    trangThai VARCHAR(20) NOT NULL DEFAULT 'HOAT_DONG',
    lyDoKhoa VARCHAR(1000) NULL,
    ngayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ngayCapNhat DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_email (email),
    CHECK (vaiTro IN ('KHACH_THUE','CHU_TRO','ADMIN')),
    CHECK (trangThai IN ('HOAT_DONG','BI_KHOA')),
    CHECK (version >= 0),
    CHECK (trangThai <> 'BI_KHOA' OR (lyDoKhoa IS NOT NULL AND CHAR_LENGTH(TRIM(lyDoKhoa)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PhienDangNhap: UC02–03, UC20
CREATE TABLE PhienDangNhap (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    taiKhoanId BIGINT NOT NULL,
    maPhienBam CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    taoLuc DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    hetHanLuc DATETIME(6) NOT NULL,
    thuHoiLuc DATETIME(6) NULL,
    FOREIGN KEY (taiKhoanId) REFERENCES TaiKhoan(id),
    UNIQUE KEY uk_ma_phien_bam (maPhienBam),
    CHECK (hetHanLuc > taoLuc),
    CHECK (thuHoiLuc IS NULL OR thuHoiLuc >= taoLuc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TinDang: UC04–05, UC12–14, UC17–20
CREATE TABLE TinDang (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    chuTroId BIGINT NOT NULL,
    tieuDe VARCHAR(255) NOT NULL,
    moTa TEXT NOT NULL,
    loaiPhong VARCHAR(20) NOT NULL,
    giaThue DECIMAL(12,2) NOT NULL,
    dienTich DECIMAL(10,2) NOT NULL,
    diaChiChiTiet VARCHAR(255) NOT NULL,
    phuongXa VARCHAR(100) NOT NULL,
    quanHuyen VARCHAR(100) NULL,
    thanhPho VARCHAR(100) NOT NULL,
    viDo DECIMAL(10,7) NULL,
    kinhDo DECIMAL(10,7) NULL,
    tenLienHe VARCHAR(255) NOT NULL,
    soDienThoaiLienHe VARCHAR(20) NOT NULL,
    trangThai VARCHAR(32) NOT NULL DEFAULT 'CHO_DUYET',
    lyDoXuLy VARCHAR(1000) NULL,
    ngayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ngayCapNhat DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (chuTroId) REFERENCES TaiKhoan(id),
    CHECK (loaiPhong IN ('PHONG_TRO','STUDIO','CHUNG_CU_MINI')),
    CHECK (trangThai IN ('CHO_DUYET','DANG_HIEN_THI','BI_TU_CHOI','CHU_TRO_AN','ADMIN_AN','AN_DO_KHOA_TAI_KHOAN')),
    CHECK (giaThue > 0 AND dienTich > 0),
    CHECK (version >= 0),
    CHECK ((viDo IS NULL AND kinhDo IS NULL) OR (viDo IS NOT NULL AND kinhDo IS NOT NULL)),
    CHECK (viDo BETWEEN -90 AND 90),
    CHECK (kinhDo BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AnhPhong: UC05, UC12–13
CREATE TABLE AnhPhong (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tinDangId BIGINT NOT NULL,
    khoaLuuTru VARCHAR(255) NOT NULL,
    tenTep VARCHAR(255) NOT NULL,
    loaiTep VARCHAR(50) NOT NULL,
    dungLuong BIGINT NOT NULL,
    thuTu INT NOT NULL,
    FOREIGN KEY (tinDangId) REFERENCES TinDang(id),
    UNIQUE KEY uk_storage (khoaLuuTru),
    UNIQUE KEY uk_anh_thu_tu (tinDangId, thuTu),
    CHECK (dungLuong > 0 AND thuTu >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ChiPhiPhong: UC05, UC12–13
CREATE TABLE ChiPhiPhong (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tinDangId BIGINT NOT NULL,
    tenChiPhi VARCHAR(100) NOT NULL,
    soTien DECIMAL(12,2) NOT NULL,
    donViTinh VARCHAR(20) NOT NULL,
    ghiChu VARCHAR(1000) NULL,
    FOREIGN KEY (tinDangId) REFERENCES TinDang(id),
    UNIQUE KEY uk_tin_ten_phi (tinDangId, tenChiPhi),
    CHECK (soTien >= 0),
    CHECK (donViTinh IN ('KWH','M3','NGUOI_THANG','PHONG_THANG','XE_THANG','LAN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TienIch: UC04–05, UC12–13
CREATE TABLE TienIch (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    maBieuTuong VARCHAR(100) NULL,
    UNIQUE KEY uk_tien_ich_ten (ten)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TinDang_TienIch: UC04–05, UC12–13
CREATE TABLE TinDang_TienIch (
    tinDangId BIGINT NOT NULL,
    tienIchId BIGINT NOT NULL,
    PRIMARY KEY (tinDangId, tienIchId),
    FOREIGN KEY (tinDangId) REFERENCES TinDang(id),
    FOREIGN KEY (tienIchId) REFERENCES TienIch(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- YeuThich: UC06–08
CREATE TABLE YeuThich (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    khachThueId BIGINT NOT NULL,
    tinDangId BIGINT NOT NULL,
    ngayLuu DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (khachThueId) REFERENCES TaiKhoan(id),
    FOREIGN KEY (tinDangId) REFERENCES TinDang(id),
    UNIQUE KEY uk_yeu_thich (khachThueId, tinDangId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LichHen: UC09–11, UC14–16, UC19–20
CREATE TABLE LichHen (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    khachThueId BIGINT NOT NULL,
    tinDangId BIGINT NOT NULL,
    thoiDiemHen DATETIME(6) NOT NULL,
    soDienThoaiLienHe VARCHAR(20) NOT NULL,
    ghiChu VARCHAR(1000) NULL,
    trangThai VARCHAR(20) NOT NULL DEFAULT 'CHO_XAC_NHAN',
    lyDoTuChoi VARCHAR(1000) NULL,
    lyDoHuy VARCHAR(1000) NULL,
    nguonHuy VARCHAR(20) NULL,
    nguoiHuyId BIGINT NULL,
    huyLuc DATETIME(6) NULL,
    ngayTao DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ngayCapNhat DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    dangHoatDong TINYINT GENERATED ALWAYS AS (CASE WHEN trangThai IN ('CHO_XAC_NHAN','DA_XAC_NHAN') THEN 1 ELSE NULL END) STORED,
    FOREIGN KEY (khachThueId) REFERENCES TaiKhoan(id),
    FOREIGN KEY (tinDangId) REFERENCES TinDang(id),
    FOREIGN KEY (nguoiHuyId) REFERENCES TaiKhoan(id),
    CHECK (trangThai IN ('CHO_XAC_NHAN','DA_XAC_NHAN','BI_TU_CHOI','DA_HUY')),
    CHECK (nguonHuy IN ('KHACH_THUE','HE_THONG')),
    UNIQUE KEY uk_lich_active (khachThueId, tinDangId, thoiDiemHen, dangHoatDong),
    CHECK (version >= 0),
    CHECK ((trangThai = 'DA_HUY' AND lyDoHuy IS NOT NULL AND CHAR_LENGTH(TRIM(lyDoHuy)) > 0 AND nguonHuy IS NOT NULL AND huyLuc IS NOT NULL) OR (trangThai <> 'DA_HUY' AND lyDoHuy IS NULL AND nguonHuy IS NULL AND huyLuc IS NULL AND nguoiHuyId IS NULL)),
    CHECK (trangThai <> 'BI_TU_CHOI' OR (lyDoTuChoi IS NOT NULL AND CHAR_LENGTH(TRIM(lyDoTuChoi)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TruongDaiHoc: UC04
CREATE TABLE TruongDaiHoc (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tenTruong VARCHAR(200) NOT NULL,
    tenVietTat VARCHAR(50) NULL,
    UNIQUE KEY uk_truong_ten (tenTruong)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CoSoTruong: UC04
CREATE TABLE CoSoTruong (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    truongDaiHocId BIGINT NOT NULL,
    tenCoSo VARCHAR(200) NOT NULL,
    diaChi VARCHAR(500) NOT NULL,
    viDo DECIMAL(10,7) NOT NULL,
    kinhDo DECIMAL(10,7) NOT NULL,
    FOREIGN KEY (truongDaiHocId) REFERENCES TruongDaiHoc(id),
    UNIQUE KEY uk_co_so (truongDaiHocId, tenCoSo),
    CHECK (viDo BETWEEN -90 AND 90),
    CHECK (kinhDo BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NhatKyXuLy: UC14, UC17–21
CREATE TABLE NhatKyXuLy (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nguoiThucHienId BIGINT NOT NULL,
    tinDangMucTieuId BIGINT NULL,
    taiKhoanMucTieuId BIGINT NULL,
    hanhDong VARCHAR(32) NOT NULL,
    trangThaiTruoc VARCHAR(32) NOT NULL,
    trangThaiSau VARCHAR(32) NOT NULL,
    lyDo VARCHAR(1000) NULL,
    thoiDiem DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    phienBanDuocXuLy BIGINT NULL,
    FOREIGN KEY (nguoiThucHienId) REFERENCES TaiKhoan(id),
    FOREIGN KEY (tinDangMucTieuId) REFERENCES TinDang(id),
    FOREIGN KEY (taiKhoanMucTieuId) REFERENCES TaiKhoan(id),
    CHECK ((tinDangMucTieuId IS NOT NULL AND taiKhoanMucTieuId IS NULL) OR (tinDangMucTieuId IS NULL AND taiKhoanMucTieuId IS NOT NULL)),
    CHECK (hanhDong IN ('DUYET_TIN','TU_CHOI_TIN','AN_TIN','KHOA_TAI_KHOAN','MO_KHOA_TAI_KHOAN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
