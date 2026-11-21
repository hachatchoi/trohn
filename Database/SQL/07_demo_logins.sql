-- Demo logins for a newly initialized local Docker database.
START TRANSACTION;
INSERT INTO TaiKhoan(id,hoTen,email,soDienThoai,matKhauBam,vaiTro) VALUES(1,'Admin TROHN','admin@example.invalid','0100000000','$2a$12$FlOn.28S73MqzREAQFjs0eZmFukBOHU8xZ0UZj5q7ODXgF/WC2IOK','ADMIN');
UPDATE TaiKhoan SET matKhauBam='$2a$12$opUih.2Sm18G/Bx6FIC/buS7p5MAiZLqFhArEPlterIqLAe/SdHd6' WHERE id=2 AND email='owner-2@example.invalid' AND vaiTro='CHU_TRO';
UPDATE TaiKhoan SET matKhauBam='$2a$12$HMiFApniv1OzQA5nKC2pteaP2pQvNzFIzmIlL1Z851zVLfg0pR7XK' WHERE id=3 AND email='owner-3@example.invalid' AND vaiTro='CHU_TRO';
UPDATE TaiKhoan SET matKhauBam='$2a$12$LAh4Dnf6l5Eifg8Tx43uvu4KYTzhI8MqLNLbZbjX6wolIMgSacb82' WHERE id=4 AND email='owner-4@example.invalid' AND vaiTro='CHU_TRO';
UPDATE TaiKhoan SET matKhauBam='$2a$12$0klzVETjFJ2S90Kul0Gk4eEOAbidlKq0uMucEO2qggnqWdPuvz8R2' WHERE id=5 AND email='owner-5@example.invalid' AND vaiTro='CHU_TRO';
UPDATE TaiKhoan SET matKhauBam='$2a$12$alB0FaVxDTp/yoIj45p9duZ0I4qsHXufHgqrTIBgzBixVLGkR3ifO' WHERE id=6 AND email='owner-6@example.invalid' AND vaiTro='CHU_TRO';
COMMIT;
