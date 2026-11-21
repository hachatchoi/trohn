package vn.trohn;

import jakarta.servlet.http.HttpServletRequest;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import static vn.trohn.Accounts.*;

@RestController
@RequestMapping("/api")
class Actions {
    final JdbcTemplate db;
    final Accounts accounts;
    Actions(JdbcTemplate db,Accounts accounts){this.db=db;this.accounts=accounts;}
    record Decision(String status,String reason,Long version){}
    record Booking(long roomId,String date,String time,String phone,String note){}
    void changed(int count){if(count!=1)throw fail(409,"Dữ liệu đã thay đổi. Vui lòng tải lại.");}
    @PutMapping("/favorites/{id}") @Transactional
    void favorite(@PathVariable long id,HttpServletRequest req){
        var u=accounts.require(req,"KHACH_THUE"); available(id);
        db.update("INSERT INTO YeuThich(khachThueId,tinDangId) VALUES(?,?) ON DUPLICATE KEY UPDATE id=id",u.get("id"),id);
    }
    @DeleteMapping("/favorites/{id}") @Transactional void unfavorite(@PathVariable long id,HttpServletRequest req){
        db.update("DELETE FROM YeuThich WHERE khachThueId=? AND tinDangId=?",accounts.require(req,"KHACH_THUE").get("id"),id);
    }
    void available(long id){
        if(db.queryForList("SELECT t.id FROM TinDang t JOIN TaiKhoan a ON a.id=t.chuTroId WHERE t.id=? AND t.trangThai='DANG_HIEN_THI' AND a.trangThai='HOAT_DONG' FOR SHARE",id).isEmpty())throw fail(404,"Phòng không còn khả dụng.");
    }
    @PostMapping("/appointments") @Transactional
    Map<String,Object> book(@RequestBody Booking b,HttpServletRequest req){
        var u=accounts.require(req,"KHACH_THUE"); available(b.roomId);
        LocalDateTime when;
        try{when=LocalDateTime.parse(b.date+"T"+b.time).minusHours(7);}catch(Exception ex){throw fail(400,"Ngày giờ không hợp lệ.");}
        if(!when.isAfter(LocalDateTime.now(ZoneOffset.UTC))||b.phone==null||!b.phone.matches("0[0-9]{9}")||b.note!=null&&b.note.length()>1000)throw fail(400,"Kiểm tra thời gian, số điện thoại và ghi chú.");
        db.update("INSERT INTO LichHen(khachThueId,tinDangId,thoiDiemHen,soDienThoaiLienHe,ghiChu) VALUES(?,?,?,?,?)",u.get("id"),b.roomId,when,b.phone,b.note);
        return Map.of("id",db.queryForObject("SELECT LAST_INSERT_ID()",String.class));
    }
    @PostMapping("/appointments/{id}") @Transactional
    void visit(@PathVariable long id,@RequestBody Decision d,HttpServletRequest req){
        if("cancelled".equals(d.status)){
            var u=accounts.require(req,"KHACH_THUE");
            changed(db.update("UPDATE LichHen SET trangThai='DA_HUY',lyDoHuy=?,nguonHuy='KHACH_THUE',nguoiHuyId=?,huyLuc=UTC_TIMESTAMP(6),version=version+1 WHERE id=? AND khachThueId=? AND trangThai IN ('CHO_XAC_NHAN','DA_XAC_NHAN') AND thoiDiemHen>UTC_TIMESTAMP(6)",required(d.reason,1000),u.get("id"),id,u.get("id")));
        }else{
            var u=accounts.require(req,"CHU_TRO");
            boolean confirm="Đã xác nhận".equals(d.status);
            if(!confirm&&!"Đã từ chối".equals(d.status))throw fail(400,"Trạng thái không hợp lệ.");
            if(confirm && !db.queryForList("SELECT h.id FROM LichHen h JOIN TinDang t ON t.id=h.tinDangId JOIN LichHen requested ON requested.thoiDiemHen=h.thoiDiemHen WHERE requested.id=? AND t.chuTroId=? AND h.trangThai='DA_XAC_NHAN' FOR UPDATE",id,u.get("id")).isEmpty())throw fail(409,"Bạn đã có lịch xác nhận vào giờ này.");
            changed(db.update("UPDATE LichHen h JOIN TinDang t ON t.id=h.tinDangId SET h.trangThai=?,h.lyDoTuChoi=?,h.version=h.version+1 WHERE h.id=? AND t.chuTroId=? AND h.trangThai='CHO_XAC_NHAN' AND h.thoiDiemHen>UTC_TIMESTAMP(6)",confirm?"DA_XAC_NHAN":"BI_TU_CHOI",confirm?null:required(d.reason,1000),id,u.get("id")));
        }
    }
    @PostMapping("/listings/{id}/hide") @Transactional void hide(@PathVariable long id,@RequestBody Decision d,HttpServletRequest req){
        changed(db.update("UPDATE TinDang SET trangThai='CHU_TRO_AN',version=version+1 WHERE id=? AND chuTroId=? AND version=? AND trangThai='DANG_HIEN_THI'",id,accounts.require(req,"CHU_TRO").get("id"),d.version));
        cancelListingVisits(id,accounts.session(req).get("id"));
    }
    void cancelListingVisits(long id,Object actor){
        db.update("UPDATE LichHen SET trangThai='DA_HUY',lyDoHuy='Tin đăng đã ẩn',nguonHuy='HE_THONG',nguoiHuyId=?,huyLuc=UTC_TIMESTAMP(6),version=version+1 WHERE tinDangId=? AND trangThai IN ('CHO_XAC_NHAN','DA_XAC_NHAN') AND thoiDiemHen>UTC_TIMESTAMP(6)",actor,id);
    }
    @PostMapping("/admin/listings/{id}") @Transactional
    void moderate(@PathVariable long id,@RequestBody Decision d,HttpServletRequest req){
        var admin=accounts.require(req,"ADMIN");
        String next,action,prev,reason=null;
        switch(required(d.status,40)){
            case "Đang hiển thị"->{next="DANG_HIEN_THI";action="DUYET_TIN";prev="CHO_DUYET";}
            case "Bị từ chối"->{next="BI_TU_CHOI";action="TU_CHOI_TIN";prev="CHO_DUYET";reason=required(d.reason,1000);}
            case "Đã ẩn"->{next="ADMIN_AN";action="AN_TIN";prev="DANG_HIEN_THI";reason=required(d.reason,1000);}
            default->throw fail(400,"Trạng thái không hợp lệ.");
        }
        changed(db.update("UPDATE TinDang SET trangThai=?,lyDoXuLy=?,version=version+1 WHERE id=? AND version=? AND trangThai=?",next,reason,id,d.version,prev));
        if(next.equals("ADMIN_AN"))cancelListingVisits(id,admin.get("id"));
        db.update("INSERT INTO NhatKyXuLy(nguoiThucHienId,tinDangMucTieuId,hanhDong,trangThaiTruoc,trangThaiSau,lyDo,phienBanDuocXuLy) VALUES(?,?,?,?,?,?,?)",admin.get("id"),id,action,prev,next,reason,d.version);
    }
    @PostMapping("/admin/users/{id}") @Transactional
    void account(@PathVariable long id,@RequestBody Decision d,HttpServletRequest req){
        var admin=accounts.require(req,"ADMIN"); boolean lock="Đã khóa".equals(d.status);
        if(!lock&&!"Hoạt động".equals(d.status))throw fail(400,"Trạng thái không hợp lệ.");
        String prev=lock?"HOAT_DONG":"BI_KHOA",next=lock?"BI_KHOA":"HOAT_DONG",reason=lock?required(d.reason,1000):null;
        changed(db.update("UPDATE TaiKhoan SET trangThai=?,lyDoKhoa=?,version=version+1 WHERE id=? AND vaiTro<>'ADMIN' AND version=? AND trangThai=?",next,reason,id,d.version,prev));
        if(lock){
            db.update("UPDATE PhienDangNhap SET thuHoiLuc=UTC_TIMESTAMP(6) WHERE taiKhoanId=? AND thuHoiLuc IS NULL",id);
            db.update("UPDATE TinDang SET trangThai='AN_DO_KHOA_TAI_KHOAN',version=version+1 WHERE chuTroId=? AND trangThai='DANG_HIEN_THI'",id);
            db.update("UPDATE LichHen h JOIN TinDang t ON t.id=h.tinDangId SET h.trangThai='DA_HUY',h.nguonHuy='HE_THONG',h.lyDoHuy='Tài khoản đã khóa',h.huyLuc=UTC_TIMESTAMP(6),h.version=h.version+1 WHERE (t.chuTroId=? OR h.khachThueId=?) AND h.trangThai IN ('CHO_XAC_NHAN','DA_XAC_NHAN') AND h.thoiDiemHen>UTC_TIMESTAMP(6)",id,id);
        }
        db.update("INSERT INTO NhatKyXuLy(nguoiThucHienId,taiKhoanMucTieuId,hanhDong,trangThaiTruoc,trangThaiSau,lyDo,phienBanDuocXuLy) VALUES(?,?,?,?,?,?,?)",admin.get("id"),id,lock?"KHOA_TAI_KHOAN":"MO_KHOA_TAI_KHOAN",prev,next,reason,d.version);
    }
}

