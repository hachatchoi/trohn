-- Synthetic Hanoi demo data. Empty database only. Coordinates/addresses are illustrative.
-- !DEMO_LOGIN_DISABLED is NOT a password hash; provision BCrypt through backend before login tests.
SET NAMES utf8mb4;
SET time_zone = '+00:00';
START TRANSACTION;
INSERT INTO TaiKhoan (id,hoTen,email,soDienThoai,matKhauBam,vaiTro,trangThai,lyDoKhoa) VALUES
(1,'Khách mẫu A','khach1@example.invalid','0900000001','!DEMO_LOGIN_DISABLED','KHACH_THUE','HOAT_DONG',NULL),
(2,'Khách mẫu B','khach2@example.invalid','0900000002','!DEMO_LOGIN_DISABLED','KHACH_THUE','HOAT_DONG',NULL),
(3,'Chủ mẫu A','chutro1@example.invalid','0900000003','!DEMO_LOGIN_DISABLED','CHU_TRO','HOAT_DONG',NULL),
(4,'Chủ mẫu B','chutro2@example.invalid','0900000004','!DEMO_LOGIN_DISABLED','CHU_TRO','BI_KHOA','Khóa minh họa'),
(5,'Admin mẫu','admin@example.invalid','0900000005','!DEMO_LOGIN_DISABLED','ADMIN','HOAT_DONG',NULL);
INSERT INTO TruongDaiHoc (id,tenTruong,tenVietTat) VALUES (1,'Trường đại học minh họa Hà Nội A','DEMO-A');
INSERT INTO CoSoTruong (id,truongDaiHocId,tenCoSo,diaChi,viDo,kinhDo) VALUES
(1,1,'Cơ sở mẫu 1','Địa chỉ mô phỏng Hà Nội',21.005,105.845),(2,1,'Cơ sở mẫu 2','Địa chỉ mô phỏng Hà Nội',21.035,105.795);
INSERT INTO TienIch (id,ten,maBieuTuong) VALUES (1,'WiFi','wifi'),(2,'Điều hòa','air-conditioner'),(3,'Chỗ để xe','parking');
INSERT INTO TinDang (id,chuTroId,tieuDe,moTa,loaiPhong,giaThue,dienTich,diaChiChiTiet,phuongXa,quanHuyen,thanhPho,viDo,kinhDo,tenLienHe,soDienThoaiLienHe,trangThai,lyDoXuLy) VALUES
(1,3,'Phòng trọ mẫu Hà Nội','Dữ liệu mô phỏng','PHONG_TRO',3000000,22,'Địa chỉ minh họa 1','Phường minh họa',NULL,'Hà Nội',21.006,105.846,'Chủ mẫu A','0900000003','DANG_HIEN_THI',NULL),
(2,3,'Studio chờ duyệt','Dữ liệu mô phỏng','STUDIO',4500000,30,'Địa chỉ minh họa 2','Phường minh họa',NULL,'Hà Nội',NULL,NULL,'Chủ mẫu A','0900000003','CHO_DUYET',NULL),
(3,4,'Phòng ẩn do khóa','Dữ liệu mô phỏng','CHUNG_CU_MINI',4000000,28,'Địa chỉ minh họa 3','Phường minh họa',NULL,'Hà Nội',21.036,105.796,'Chủ mẫu B','0900000004','AN_DO_KHOA_TAI_KHOAN','Khóa minh họa');
-- The photo API maps these demo keys to bundled room photos when no uploaded content exists.
INSERT INTO AnhPhong (tinDangId,khoaLuuTru,tenTep,loaiTep,dungLuong,thuTu) VALUES
(1,'demo/tin1.jpg','tin1.jpg','image/jpeg',1024,0),(2,'demo/tin2.jpg','tin2.jpg','image/jpeg',1024,0),(3,'demo/tin3.jpg','tin3.jpg','image/jpeg',1024,0);
INSERT INTO ChiPhiPhong (tinDangId,tenChiPhi,soTien,donViTinh,ghiChu) VALUES
(1,'Điện',3500,'KWH','Đơn giá mẫu'),(1,'Nước',25000,'M3','Theo đồng hồ'),(1,'Gửi xe',50000,'XE_THANG',NULL);
INSERT INTO TinDang_TienIch (tinDangId,tienIchId) VALUES (1,1),(1,3),(2,1),(2,2),(3,1);
INSERT INTO YeuThich (khachThueId,tinDangId) VALUES (1,1),(1,3),(2,1);
INSERT INTO LichHen (id,khachThueId,tinDangId,thoiDiemHen,soDienThoaiLienHe,trangThai,lyDoHuy,nguonHuy,nguoiHuyId,huyLuc,lyDoTuChoi) VALUES
(1,1,1,UTC_TIMESTAMP(6)+INTERVAL 1 DAY,'0900000001','DA_XAC_NHAN',NULL,NULL,NULL,NULL,NULL),
(2,2,1,UTC_TIMESTAMP(6)+INTERVAL 2 DAY,'0900000002','CHO_XAC_NHAN',NULL,NULL,NULL,NULL,NULL),
(3,1,3,UTC_TIMESTAMP(6)+INTERVAL 3 DAY,'0900000001','DA_HUY','Khóa minh họa','HE_THONG',5,UTC_TIMESTAMP(6),NULL),
(4,2,1,UTC_TIMESTAMP(6)-INTERVAL 1 DAY,'0900000002','BI_TU_CHOI',NULL,NULL,NULL,NULL,'Không phù hợp thời gian');
INSERT INTO NhatKyXuLy (nguoiThucHienId,tinDangMucTieuId,taiKhoanMucTieuId,hanhDong,trangThaiTruoc,trangThaiSau,lyDo,phienBanDuocXuLy) VALUES
(5,1,NULL,'DUYET_TIN','CHO_DUYET','DANG_HIEN_THI',NULL,0),(5,NULL,4,'KHOA_TAI_KHOAN','HOAT_DONG','BI_KHOA','Khóa minh họa',0);
COMMIT;
