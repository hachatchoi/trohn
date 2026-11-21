package vn.trohn;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
class Catalog {
    final JdbcTemplate db;
    final Accounts accounts;
    Catalog(JdbcTemplate db, Accounts accounts){this.db=db;this.accounts=accounts;}
    static final String STATUS = """
        CASE t.trangThai WHEN 'DANG_HIEN_THI' THEN 'Đang hiển thị' WHEN 'CHO_DUYET' THEN 'Chờ duyệt'
        WHEN 'BI_TU_CHOI' THEN 'Bị từ chối' ELSE 'Đã ẩn' END
        """;
    @GetMapping("/state") @Transactional(readOnly=true)
    Map<String,Object> state(HttpServletRequest req){
        var user=accounts.session(req);
        String role=user==null?"":user.get("role").toString();
        Object uid=user==null?0:user.get("id");
        var state=new HashMap<String,Object>();
        state.put("account",user);
        var rooms=db.queryForList("""
            SELECT CAST(t.id AS CHAR) id,CAST(t.chuTroId AS CHAR) ownerId,t.tieuDe title,t.moTa description,
            COALESCE(t.quanHuyen,'') district,t.diaChiChiTiet address,t.giaThue/1000000 price,t.dienTich area,
            t.phuongXa ward,t.thanhPho city,t.viDo lat,t.kinhDo lng,t.tenLienHe contact,t.soDienThoaiLienHe phone,
            t.lyDoXuLy reason,t.version,t.trangThai code,
            CASE t.loaiPhong WHEN 'STUDIO' THEN 'Studio' WHEN 'PHONG_TRO' THEN 'Phòng trọ' ELSE 'Chung cư mini' END type,
            """+STATUS+"""
             AS status FROM TinDang t JOIN TaiKhoan a ON a.id=t.chuTroId
             WHERE (t.trangThai='DANG_HIEN_THI' AND a.trangThai='HOAT_DONG') OR ?='ADMIN'
             OR (?='CHU_TRO' AND t.chuTroId=?) OR EXISTS(SELECT 1 FROM LichHen h WHERE h.tinDangId=t.id AND h.khachThueId=?)
             ORDER BY t.ngayCapNhat DESC,t.id DESC
             """,role,role,uid,uid);
        for(var room:rooms){
            Object id=room.get("id");
            room.put("amenities",db.queryForList("SELECT i.ten FROM TinDang_TienIch ti JOIN TienIch i ON ti.tienIchId=i.id WHERE ti.tinDangId=? ORDER BY i.ten",String.class,id));
            var images=db.queryForList("SELECT CONCAT('/api/photos/',id) FROM AnhPhong WHERE tinDangId=? ORDER BY thuTu",String.class,id);
            room.put("images",images);room.put("image",images.isEmpty()?"":images.get(0));
            room.put("costs",db.queryForList("SELECT tenChiPhi label,soTien amount,donViTinh unit FROM ChiPhiPhong WHERE tinDangId=? ORDER BY id",id));
            room.put("school","");room.put("distance","");
        }
        state.put("listings",rooms);
        state.put("universities",db.queryForList("SELECT CAST(c.id AS CHAR) id,t.tenTruong name,c.tenCoSo campus,t.tenVietTat short,c.viDo lat,c.kinhDo lng FROM CoSoTruong c JOIN TruongDaiHoc t ON c.truongDaiHocId=t.id ORDER BY name,campus"));
        state.put("favorites",db.queryForList("SELECT CAST(tinDangId AS CHAR) FROM YeuThich WHERE khachThueId=?",String.class,uid));
        state.put("appointments",db.queryForList("""
            SELECT CAST(h.id AS CHAR) id,CAST(h.tinDangId AS CHAR) roomId,a.hoTen name,h.soDienThoaiLienHe phone,
            DATE_FORMAT(h.thoiDiemHen+INTERVAL 7 HOUR,'%Y-%m-%d') date,DATE_FORMAT(h.thoiDiemHen+INTERVAL 7 HOUR,'%H:%i') time,
            COALESCE(h.ghiChu,'') note,COALESCE(h.lyDoHuy,h.lyDoTuChoi) cancelReason,
            CASE h.trangThai WHEN 'CHO_XAC_NHAN' THEN 'pending' WHEN 'DA_XAC_NHAN' THEN 'confirmed' WHEN 'BI_TU_CHOI' THEN 'rejected' ELSE 'cancelled' END status
            FROM LichHen h JOIN TaiKhoan a ON a.id=h.khachThueId JOIN TinDang t ON t.id=h.tinDangId
            WHERE h.khachThueId=? OR (?='CHU_TRO' AND t.chuTroId=?) ORDER BY h.thoiDiemHen DESC
            """,uid,role,uid));
        if(role.equals("ADMIN")){
            state.put("users",db.queryForList("""
                SELECT CAST(id AS CHAR) id,hoTen name,email,version,lyDoKhoa reason,
                CASE vaiTro WHEN 'ADMIN' THEN 'Admin' WHEN 'CHU_TRO' THEN 'Chủ trọ' ELSE 'Khách thuê' END role,
                IF(trangThai='HOAT_DONG','Hoạt động','Đã khóa') status FROM TaiKhoan ORDER BY id DESC
                """));
            state.put("logs",db.queryForList("SELECT id,CONCAT(hanhDong,' · ',COALESCE(tinDangMucTieuId,taiKhoanMucTieuId)) text,DATE_FORMAT(thoiDiem+INTERVAL 7 HOUR,'%d/%m/%Y %H:%i') time FROM NhatKyXuLy ORDER BY id DESC LIMIT 100"));
        }
        return state;
    }
}
