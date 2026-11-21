# Đối chiếu thiết kế TROHN ngày 14/10/2026

Prefix API: /api/v1. R = đọc, W = ghi theo nhánh. Xác thực dùng thêm TaiKhoan và PhienDangNhap. Phạm vi bảng: 21 thao tác nghiệp vụ chính; 13 endpoint hỗ trợ được đặc tả riêng trong API.

## Tài khoản

| UC và endpoint | Controller → Service | Dữ liệu |
|---|---|---|
| UC01 Đăng ký — POST /auth/register | TaiKhoanController.dangKy → TaiKhoanService.dangKy | R: TaiKhoan; W: TaiKhoan |
| UC02 Đăng nhập — POST /auth/login | TaiKhoanController.dangNhap → TaiKhoanService.dangNhap | R: TaiKhoan; W: PhienDangNhap |
| UC03 Đăng xuất — POST /auth/logout | TaiKhoanController.dangXuat → TaiKhoanService.dangXuat | R: PhienDangNhap; W: PhienDangNhap |
| UC20 Khóa tài khoản — POST /admin/users/{id}/lock | TaiKhoanController.khoaTaiKhoan → TaiKhoanService.khoaTaiKhoan | R: TaiKhoan, PhienDangNhap, TinDang, LichHen; W: TaiKhoan, PhienDangNhap, TinDang, LichHen, NhatKyXuLy |
| UC21 Mở khóa tài khoản — POST /admin/users/{id}/unlock | TaiKhoanController.moKhoaTaiKhoan → TaiKhoanService.moKhoaTaiKhoan | R: TaiKhoan; W: TaiKhoan, NhatKyXuLy |
## Tìm kiếm và tin đăng

| UC và endpoint | Controller → Service | Dữ liệu |
|---|---|---|
| UC04 Tìm phòng — GET /listings | TinDangController.timKiem → TinDangService.timKiem | R: TinDang, TaiKhoan, AnhPhong, TienIch, TinDang_TienIch, CoSoTruong; W: — |
| UC05 Chi tiết phòng — GET /listings/{id} | TinDangController.xemChiTiet → TinDangService.xemChiTiet | R: TinDang, TaiKhoan, AnhPhong, ChiPhiPhong, TienIch, TinDang_TienIch; W: — |
| UC12 Đăng tin — POST /listings | TinDangController.dangTin → TinDangService.dangTin | R: TaiKhoan, TienIch; W: TinDang, AnhPhong, ChiPhiPhong, TinDang_TienIch |
| UC13 Sửa tin — PUT /listings/{id} | TinDangController.suaTin → TinDangService.suaTin | R: TaiKhoan, TinDang, AnhPhong, TienIch, ChiPhiPhong, TinDang_TienIch; W: TinDang, AnhPhong, ChiPhiPhong, TinDang_TienIch |
| UC14 Chủ ẩn tin — POST /listings/{id}/hide | TinDangController.anTinCuaChuTro → TinDangService.anTinCuaChuTro | R: TaiKhoan, TinDang, LichHen; W: TinDang, LichHen, NhatKyXuLy |
| UC17 Duyệt tin — POST /admin/listings/{id}/approve | TinDangController.duyetTin → TinDangService.duyetTin | R: TaiKhoan, TinDang; W: TinDang, NhatKyXuLy |
| UC18 Từ chối tin — POST /admin/listings/{id}/reject | TinDangController.tuChoiTin → TinDangService.tuChoiTin | R: TaiKhoan, TinDang; W: TinDang, NhatKyXuLy |
| UC19 Admin ẩn tin — POST /admin/listings/{id}/hide | TinDangController.anTinViPham → TinDangService.anTinViPham | R: TaiKhoan, TinDang, LichHen; W: TinDang, LichHen, NhatKyXuLy |
## Yêu thích

| UC và endpoint | Controller → Service | Dữ liệu |
|---|---|---|
| UC06 Thêm yêu thích — PUT /favorites/{tinId} | YeuThichController.themYeuThich → YeuThichService.themYeuThich | R: TinDang, TaiKhoan, YeuThich; W: YeuThich |
| UC07 Bỏ yêu thích — DELETE /favorites/{tinId} | YeuThichController.boYeuThich → YeuThichService.boYeuThich | R: YeuThich; W: YeuThich (xóa mục lưu) |
| UC08 Xem yêu thích — GET /favorites | YeuThichController.xemDanhSach → YeuThichService.xemDanhSach | R: YeuThich, TinDang, TaiKhoan, AnhPhong; W: — |
## Lịch hẹn

| UC và endpoint | Controller → Service | Dữ liệu |
|---|---|---|
| UC09 Đặt lịch — POST /appointments | LichHenController.datLich → LichHenService.datLich | R: TaiKhoan, TinDang, LichHen; W: LichHen |
| UC10 Hủy lịch — POST /appointments/{id}/cancel | LichHenController.huyLich → LichHenService.huyLich | R: TaiKhoan, TinDang, LichHen; W: LichHen |
| UC11 Xem lịch — GET /appointments | LichHenController.xemDanhSach → LichHenService.xemDanhSach | R: LichHen, TinDang, TaiKhoan; W: — |
| UC15 Xác nhận lịch — POST /appointments/{id}/confirm | LichHenController.xacNhanLich → LichHenService.xacNhanLich | R: TaiKhoan, TinDang, LichHen; W: LichHen |
| UC16 Từ chối lịch — POST /appointments/{id}/reject | LichHenController.tuChoiLich → LichHenService.tuChoiLich | R: TaiKhoan, TinDang, LichHen; W: LichHen |

## Quy ước và đồng bộ

- UC04: timKiem trả Page<TinTomTat>, phù hợp danh sách công khai.
- UC06 / UC08: Thêm yêu thích trả LuuYeuThichResponse {tinId, saved}; danh sách nhận page, size và trả Page<YeuThichResponse>.
- UC10 / UC15 / UC16: Hủy, xác nhận, từ chối lịch trả LichHenResponse thay cho void.
- UC12 / UC13: Tạo tin nhận TinDangRequest và photos; sửa nhận SuaTinRequest có version, giuAnhIds và photos; cả hai trả TinQuanLyResponse.
- UC14 / UC19: Ẩn tin trả TrangThaiTinResponse {id, trangThai, version}; không trả nội dung riêng qua endpoint công khai.
- UC17 / UC18: Duyệt và từ chối tin trả TinQuanLyResponse.
- UC20 / UC21: Khóa và mở khóa tài khoản trả TaiKhoanResponse.

ActorContext lấy từ phiên. DTO HTTP được ánh xạ thành tham số Service; return type mô tả data, không gồm envelope/header/mã HTTP. UC09 cần metadata tạo mới để phân biệt 201/200. Các phương thức hỗ trợ HTTP và thông điệp Sequence chưa được xác nhận bằng backend chạy thật.