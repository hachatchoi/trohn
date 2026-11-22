-- Demo listings use real mapped sites as reference points, not actual rental offers.
-- Address points and campus centers: © OpenStreetMap contributors, ODbL 1.0.
-- https://www.openstreetmap.org/copyright
SET NAMES utf8mb4;
START TRANSACTION;

-- https://www.openstreetmap.org/node/7055990256
UPDATE TinDang SET diaChiChiTiet='Số 62 phố Trần Thái Tông, Cầu Giấy, Hà Nội', viDo=21.0319395, kinhDo=105.788732,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=1 AND diaChiChiTiet='Khu vực đường Trần Thái Tông, Cầu Giấy, Hà Nội';

-- https://www.openstreetmap.org/way/1265456455
UPDATE TinDang SET diaChiChiTiet='Số 209 đường Xuân Thủy, Cầu Giấy, Hà Nội', viDo=21.0363477, kinhDo=105.7839783,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=2 AND diaChiChiTiet='Khu vực đường Xuân Thủy, Cầu Giấy, Hà Nội';

-- https://www.openstreetmap.org/way/1171597393
UPDATE TinDang SET diaChiChiTiet='Số 215 đường Nguyễn Khang, Cầu Giấy, Hà Nội', viDo=21.0217703, kinhDo=105.796545,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=3 AND diaChiChiTiet='Khu vực đường Nguyễn Khang, Cầu Giấy, Hà Nội';

-- https://www.openstreetmap.org/node/12161473580
UPDATE TinDang SET diaChiChiTiet='Số 80 phố Trần Quốc Vượng, Cầu Giấy, Hà Nội', viDo=21.0343404, kinhDo=105.7833396,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=4 AND diaChiChiTiet='Khu vực đường Trần Quốc Vượng, Cầu Giấy, Hà Nội';

-- https://www.openstreetmap.org/way/295344501
UPDATE TinDang SET diaChiChiTiet='Số 58A phố Trung Kính, Cầu Giấy, Hà Nội', viDo=21.0143061, kinhDo=105.7964591,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=5 AND diaChiChiTiet='Khu vực đường Trung Kính, Cầu Giấy, Hà Nội';

-- https://www.openstreetmap.org/node/7055939347
UPDATE TinDang SET diaChiChiTiet='Số 382 đường Nguyễn Trãi, Thanh Xuân, Hà Nội', viDo=20.9938712, kinhDo=105.8060514,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=6 AND diaChiChiTiet='Khu vực đường Nguyễn Trãi, Thanh Xuân, Hà Nội';

-- https://www.openstreetmap.org/node/10087100115
UPDATE TinDang SET diaChiChiTiet='Số 226 đường Khương Đình, Thanh Xuân, Hà Nội', viDo=20.9927228, kinhDo=105.8136674,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=7 AND diaChiChiTiet='Khu vực đường Khương Đình, Thanh Xuân, Hà Nội';

-- https://www.openstreetmap.org/way/868988111
UPDATE TinDang SET diaChiChiTiet='Số 85 đường Vũ Trọng Phụng, Thanh Xuân, Hà Nội', viDo=21.0019262, kinhDo=105.8058995,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=8 AND diaChiChiTiet='Khu vực đường Vũ Trọng Phụng, Thanh Xuân, Hà Nội';

-- https://www.openstreetmap.org/node/6677152517
UPDATE TinDang SET diaChiChiTiet='Số 106 phố Nhân Hòa, Thanh Xuân, Hà Nội', viDo=21.0019765, kinhDo=105.8069947,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=9 AND diaChiChiTiet='Khu vực đường Nhân Hòa, Thanh Xuân, Hà Nội';

-- https://www.openstreetmap.org/way/1349580445
UPDATE TinDang SET diaChiChiTiet='Số 283 phố Khương Trung, Thanh Xuân, Hà Nội', viDo=20.994506, kinhDo=105.8184146,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=10 AND diaChiChiTiet='Khu vực đường Khương Trung, Thanh Xuân, Hà Nội';

-- https://www.openstreetmap.org/node/3874820562
UPDATE TinDang SET diaChiChiTiet='Số 126 Chùa Láng, Đống Đa, Hà Nội', viDo=21.023123, kinhDo=105.801562,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=11 AND diaChiChiTiet='Khu vực đường Chùa Láng, Đống Đa, Hà Nội';

-- https://www.openstreetmap.org/node/1491048004
UPDATE TinDang SET diaChiChiTiet='Số 89 Thái Hà, Đống Đa, Hà Nội', viDo=21.0121211, kinhDo=105.8206969,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=12 AND diaChiChiTiet='Khu vực đường Thái Hà, Đống Đa, Hà Nội';

-- https://www.openstreetmap.org/node/6677591358
UPDATE TinDang SET diaChiChiTiet='Số 42 phố Tôn Thất Tùng, Đống Đa, Hà Nội', viDo=21.0021186, kinhDo=105.8295111,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=13 AND diaChiChiTiet='Khu vực đường Tôn Thất Tùng, Đống Đa, Hà Nội';

-- https://www.openstreetmap.org/way/1021332449
UPDATE TinDang SET diaChiChiTiet='Số 171 phố Tây Sơn, Đống Đa, Hà Nội', viDo=21.0085016, kinhDo=105.8249507,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=14 AND diaChiChiTiet='Khu vực đường Tây Sơn, Đống Đa, Hà Nội';

-- https://www.openstreetmap.org/node/6691258757
UPDATE TinDang SET diaChiChiTiet='Số 142 phố Hào Nam, Đống Đa, Hà Nội', viDo=21.0254831, kinhDo=105.8276276,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=15 AND diaChiChiTiet='Khu vực đường Hào Nam, Đống Đa, Hà Nội';

-- https://www.openstreetmap.org/way/708574183
UPDATE TinDang SET diaChiChiTiet='Số 17 phố Tạ Quang Bửu, Hai Bà Trưng, Hà Nội', viDo=21.0038482, kinhDo=105.8476778,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=16 AND diaChiChiTiet='Khu vực đường Tạ Quang Bửu, Hai Bà Trưng, Hà Nội';

-- https://www.openstreetmap.org/way/840613319
UPDATE TinDang SET diaChiChiTiet='Số 39 phố Lê Thanh Nghị, Hai Bà Trưng, Hà Nội', viDo=21.0018712, kinhDo=105.8466185,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=17 AND diaChiChiTiet='Khu vực đường Lê Thanh Nghị, Hai Bà Trưng, Hà Nội';

-- https://www.openstreetmap.org/node/6632318295
UPDATE TinDang SET diaChiChiTiet='Số 250 phố Minh Khai, Hai Bà Trưng, Hà Nội', viDo=20.9949726, kinhDo=105.8574329,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=18 AND diaChiChiTiet='Khu vực đường Minh Khai, Hai Bà Trưng, Hà Nội';

-- https://www.openstreetmap.org/node/1498025964
UPDATE TinDang SET diaChiChiTiet='Số 329 Bạch Mai, Hai Bà Trưng, Hà Nội', viDo=21.0009151, kinhDo=105.8507899,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=19 AND diaChiChiTiet='Khu vực đường Bạch Mai, Hai Bà Trưng, Hà Nội';

-- https://www.openstreetmap.org/node/3684899299
UPDATE TinDang SET diaChiChiTiet='Số 23 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội', viDo=20.9969779, kinhDo=105.8459666,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=20 AND diaChiChiTiet='Khu vực đường Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội';

-- https://www.openstreetmap.org/way/533838197
UPDATE TinDang SET diaChiChiTiet='Số 36 đường Lê Đức Thọ, Nam Từ Liêm, Hà Nội', viDo=21.0275236, kinhDo=105.7671753,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=21 AND diaChiChiTiet='Khu vực đường Lê Đức Thọ, Nam Từ Liêm, Hà Nội';

-- https://www.openstreetmap.org/node/5609998728
UPDATE TinDang SET diaChiChiTiet='Số 157 phố Đình Thôn, Nam Từ Liêm, Hà Nội', viDo=21.0181307, kinhDo=105.77629,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=22 AND diaChiChiTiet='Khu vực đường Đình Thôn, Nam Từ Liêm, Hà Nội';

-- https://www.openstreetmap.org/node/12880386071
UPDATE TinDang SET diaChiChiTiet='Số 244 phố Mễ Trì Thượng, Nam Từ Liêm, Hà Nội', viDo=21.0090315, kinhDo=105.7773781,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=23 AND diaChiChiTiet='Khu vực đường Mễ Trì Thượng, Nam Từ Liêm, Hà Nội';

-- https://hanoi.worldplaces.me/vi/review/157084315-tiem-banh-gato-ht.html
UPDATE TinDang SET diaChiChiTiet='Số 18, ngõ 17 phố Phú Đô, Nam Từ Liêm, Hà Nội', viDo=21.00659, kinhDo=105.76696,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=24 AND diaChiChiTiet='Khu vực đường Phú Đô, Nam Từ Liêm, Hà Nội';

-- https://www.openstreetmap.org/node/6672724044
UPDATE TinDang SET diaChiChiTiet='Số 185 phố Miêu Nha, Nam Từ Liêm, Hà Nội', viDo=21.0143371, kinhDo=105.7459999,
    ngayCapNhat=ngayCapNhat, version=version+1
WHERE id=25 AND diaChiChiTiet='Khu vực đường Miêu Nha, Nam Từ Liêm, Hà Nội';

-- https://www.openstreetmap.org/way/199150831
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Trường Đại học Ngoại thương', 'FTU' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Trường Đại học Ngoại thương');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '91 Chùa Láng', '91 Chùa Láng, Hà Nội', 21.0225863, 105.8051833
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Ngoại thương'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='91 Chùa Láng');

-- https://www.openstreetmap.org/way/217338578
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Trường Đại học Xây dựng Hà Nội', 'HUCE' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Trường Đại học Xây dựng Hà Nội');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '55 Đường Giải Phóng', '55 Đường Giải Phóng, Hà Nội', 21.003234, 105.8430813
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Xây dựng Hà Nội'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='55 Đường Giải Phóng');

-- https://www.openstreetmap.org/way/219977469
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Học viện Ngân hàng', 'BA' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Học viện Ngân hàng');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '12 Phố Chùa Bộc', '12 Phố Chùa Bộc, Hà Nội', 21.0094586, 105.8290726
FROM TruongDaiHoc t WHERE t.tenTruong='Học viện Ngân hàng'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='12 Phố Chùa Bộc');

-- https://www.openstreetmap.org/way/325023914
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Trường Đại học Khoa học Tự nhiên', 'HUS' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Trường Đại học Khoa học Tự nhiên');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '334 Đường Nguyễn Trãi', '334 Đường Nguyễn Trãi, Hà Nội', 20.9959393, 105.8080085
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Khoa học Tự nhiên'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='334 Đường Nguyễn Trãi');

-- https://www.openstreetmap.org/way/704159204
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '19 Phố Lê Thánh Tông', '19 Phố Lê Thánh Tông, Hà Nội', 21.0209114, 105.8587395
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Khoa học Tự nhiên'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='19 Phố Lê Thánh Tông');

-- https://www.openstreetmap.org/way/821395356
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Trường Đại học Thủy lợi', 'TLU' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Trường Đại học Thủy lợi');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '175 Phố Tây Sơn', '175 Phố Tây Sơn, Hà Nội', 21.0066924, 105.8257726
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Thủy lợi'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='175 Phố Tây Sơn');

-- https://www.openstreetmap.org/way/1582527687
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Đại học Quốc gia Hà Nội', 'VNU' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Đại học Quốc gia Hà Nội');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '144 Đường Xuân Thủy', '144 Đường Xuân Thủy, Hà Nội', 21.0388912, 105.7824312
FROM TruongDaiHoc t WHERE t.tenTruong='Đại học Quốc gia Hà Nội'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='144 Đường Xuân Thủy');

-- https://www.openstreetmap.org/way/1582527698
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Học viện Báo chí và Tuyên truyền', 'AJC' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Học viện Báo chí và Tuyên truyền');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '36 Đường Xuân Thủy', '36 Đường Xuân Thủy, Hà Nội', 21.0375962, 105.7889046
FROM TruongDaiHoc t WHERE t.tenTruong='Học viện Báo chí và Tuyên truyền'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='36 Đường Xuân Thủy');

-- https://www.openstreetmap.org/way/1582895757
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Trường Đại học Thương mại', 'TMU' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Trường Đại học Thương mại');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '79 Đường Hồ Tùng Mậu', '79 Đường Hồ Tùng Mậu, Hà Nội', 21.036572, 105.7750123
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Thương mại'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='79 Đường Hồ Tùng Mậu');

-- https://www.openstreetmap.org/relation/16092230
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Đại học Bách khoa Hà Nội', 'HUST' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Đại học Bách khoa Hà Nội');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '1 Đường Đại Cồ Việt', '1 Đường Đại Cồ Việt, Hà Nội', 21.0043689, 105.8455332
FROM TruongDaiHoc t WHERE t.tenTruong='Đại học Bách khoa Hà Nội'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='1 Đường Đại Cồ Việt');

-- https://www.openstreetmap.org/relation/16092231
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Đại học Kinh tế Quốc dân', 'NEU' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Đại học Kinh tế Quốc dân');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '207 Đường Giải Phóng', '207 Đường Giải Phóng, Hà Nội', 20.9994833, 105.8449781
FROM TruongDaiHoc t WHERE t.tenTruong='Đại học Kinh tế Quốc dân'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='207 Đường Giải Phóng');

-- https://www.openstreetmap.org/relation/16802530
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Trường Đại học Y Hà Nội', 'HMU' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Trường Đại học Y Hà Nội');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '1 Phố Tôn Thất Tùng', '1 Phố Tôn Thất Tùng, Hà Nội', 21.002324, 105.8322323
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Y Hà Nội'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='1 Phố Tôn Thất Tùng');

-- https://www.openstreetmap.org/relation/17178908
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Trường Đại học Sư phạm Hà Nội', 'HNUE' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Trường Đại học Sư phạm Hà Nội');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '136 Đường Xuân Thuỷ', '136 Đường Xuân Thuỷ, Hà Nội', 21.0390005, 105.7841768
FROM TruongDaiHoc t WHERE t.tenTruong='Trường Đại học Sư phạm Hà Nội'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='136 Đường Xuân Thuỷ');

-- https://www.openstreetmap.org/way/1497686726
INSERT INTO TruongDaiHoc (tenTruong, tenVietTat)
SELECT 'Học viện Công nghệ Bưu chính Viễn thông', 'PTIT' WHERE NOT EXISTS (SELECT 1 FROM TruongDaiHoc WHERE tenTruong='Học viện Công nghệ Bưu chính Viễn thông');
INSERT INTO CoSoTruong (truongDaiHocId, tenCoSo, diaChi, viDo, kinhDo)
SELECT t.id, '33 Đường Đại Mỗ', '33 Đường Đại Mỗ, Hà Nội', 20.9850293, 105.7677732
FROM TruongDaiHoc t WHERE t.tenTruong='Học viện Công nghệ Bưu chính Viễn thông'
  AND NOT EXISTS (SELECT 1 FROM CoSoTruong c WHERE c.truongDaiHocId=t.id AND c.tenCoSo='33 Đường Đại Mỗ');

COMMIT;
