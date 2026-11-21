package vn.trohn;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.math.BigDecimal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import static vn.trohn.Accounts.*;

@RestController
@RequestMapping("/api")
class Listings {
    final JdbcTemplate db;
    final Accounts accounts;
    Listings(JdbcTemplate db,Accounts accounts){this.db=db;this.accounts=accounts;}
    record Listing(String title,String district,String ward,String address,String type,String description,BigDecimal price,BigDecimal area,Double lat,Double lng,List<String> amenities,List<String> images,Long version){}
    @PostMapping({"/listings","/listings/{id}"}) @Transactional
    Map<String,Object> save(@PathVariable(required=false) Long id,@RequestBody Listing room,HttpServletRequest req){
        var u=accounts.require(req,"CHU_TRO");
        String type=switch(required(room.type,30)){case "Studio"->"STUDIO";case "Chung cư mini"->"CHUNG_CU_MINI";case "Phòng trọ"->"PHONG_TRO";default->throw fail(400,"Loại phòng không hợp lệ.");};
        if(room.price==null||room.area==null||room.price.signum()<=0||room.area.signum()<=0||
            room.price.compareTo(BigDecimal.valueOf(9999))>0||room.area.compareTo(BigDecimal.valueOf(99999999))>0||
            (room.lat==null)!=(room.lng==null)||room.lat!=null&&(Math.abs(room.lat)>90||Math.abs(room.lng)>180)||
            room.images==null||room.images.isEmpty()||room.images.size()>8||room.amenities==null||room.amenities.size()>32)throw fail(400,"Kiểm tra giá, diện tích, vị trí và ảnh phòng.");
        var values=new ArrayList<Object>(Arrays.asList(required(room.title,255),required(room.description,20000),type,
            room.price.movePointRight(6),room.area,required(room.address,255),required(room.ward,100),required(room.district,100),
            "Hà Nội",room.lat,room.lng,u.get("name"),u.get("phone")));
        String fields="tieuDe=?,moTa=?,loaiPhong=?,giaThue=?,dienTich=?,diaChiChiTiet=?,phuongXa=?,quanHuyen=?,thanhPho=?,viDo=?,kinhDo=?,tenLienHe=?,soDienThoaiLienHe=?";
        values.add(u.get("id"));
        if(id==null){
            db.update("INSERT INTO TinDang SET "+fields+",chuTroId=?",values.toArray());
            id=db.queryForObject("SELECT LAST_INSERT_ID()",Long.class);
        }else{
            values.add(id);values.add(room.version);
            if(db.update("UPDATE TinDang SET "+fields+",trangThai='CHO_DUYET',lyDoXuLy=NULL,version=version+1 WHERE chuTroId=? AND id=? AND version=? AND trangThai <> 'ADMIN_AN'",values.toArray())!=1)throw fail(409,"Tin đã thay đổi hoặc bạn không thể chỉnh sửa.");
        }
        db.update("DELETE FROM TinDang_TienIch WHERE tinDangId=?",id);
        for(String amenity:new LinkedHashSet<>(room.amenities)){
            db.update("INSERT INTO TienIch(ten) VALUES(?) ON DUPLICATE KEY UPDATE ten=ten",required(amenity,100));
            db.update("INSERT INTO TinDang_TienIch SELECT ?,id FROM TienIch WHERE ten=?",id,amenity);
        }
        var old=db.queryForList("SELECT id FROM AnhPhong WHERE tinDangId=? FOR UPDATE",Long.class,id);
        db.update("UPDATE AnhPhong SET thuTu=thuTu+100 WHERE tinDangId=?",id);
        int position=0;
        for(String source:room.images){
            if(source.matches("/api/photos/[0-9]+")){
                long image=Long.parseLong(source.substring(12));
                if(!old.remove(image))throw fail(400,"Ảnh không thuộc tin đăng.");
                db.update("UPDATE AnhPhong SET thuTu=? WHERE id=?",position++,image);
            }else{
                int comma=source.indexOf(',');
                if(comma<0||comma>40||!source.substring(0,comma).matches("data:image/(png|jpeg|webp);base64")||source.length()>7000000)throw fail(400,"Ảnh không hợp lệ.");
                byte[] bytes;
                try{bytes=Base64.getDecoder().decode(source.substring(comma+1));}catch(IllegalArgumentException ex){throw fail(400,"Ảnh không hợp lệ.");}
                if(bytes.length==0||bytes.length>5242880)throw fail(400,"Ảnh quá lớn hoặc trống.");
                String mime=source.substring(5,source.indexOf(';')),key=UUID.randomUUID().toString();
                boolean valid=switch(mime){
                    case "image/png" -> bytes.length>=8 && HexFormat.of().formatHex(bytes,0,8).equals("89504e470d0a1a0a");
                    case "image/jpeg" -> bytes.length>=3 && (bytes[0]&255)==255 && (bytes[1]&255)==216 && (bytes[2]&255)==255;
                    case "image/webp" -> bytes.length>=12 && new String(bytes,0,4,java.nio.charset.StandardCharsets.US_ASCII).equals("RIFF") && new String(bytes,8,4,java.nio.charset.StandardCharsets.US_ASCII).equals("WEBP");
                    default -> false;
                };
                if(!valid)throw fail(400,"Nội dung ảnh không khớp định dạng.");
                db.update("INSERT INTO AnhPhong(tinDangId,khoaLuuTru,tenTep,loaiTep,dungLuong,thuTu) VALUES(?,?,?,?,?,?)",id,key,key,mime,bytes.length,position++);
                db.update("INSERT INTO NoiDungAnh(anhId,duLieu) VALUES(LAST_INSERT_ID(),?)",bytes);
            }
        }
        for(Long image:old) db.update("DELETE FROM AnhPhong WHERE id=?",image);
        return Map.of("id",id.toString());
    }
    @GetMapping("/photos/{id}") ResponseEntity<byte[]> photo(@PathVariable long id,HttpServletRequest req){
        var u=accounts.session(req);
        Object uid=u==null?0:u.get("id");
        var rows=db.queryForList("""
            SELECT a.loaiTep,a.khoaLuuTru,n.duLieu FROM AnhPhong a LEFT JOIN NoiDungAnh n ON n.anhId=a.id JOIN TinDang t ON t.id=a.tinDangId
            JOIN TaiKhoan owner ON owner.id=t.chuTroId WHERE a.id=? AND ((t.trangThai='DANG_HIEN_THI' AND owner.trangThai='HOAT_DONG') OR t.chuTroId=? OR ?='ADMIN'
            OR EXISTS(SELECT 1 FROM LichHen h WHERE h.tinDangId=t.id AND h.khachThueId=?))
            """,id,uid,u==null?"":u.get("role"),uid);
        if(rows.isEmpty())throw fail(404,"Không tìm thấy ảnh.");
        var image = rows.get(0);
        if (image.get("duLieu") == null) {
            String sample = switch ((String) image.get("khoaLuuTru")) {
                case "demo/tin1.jpg" -> "/images/room-cozy.jpg";
                case "demo/tin2.jpg" -> "/images/room-studio.jpg";
                case "demo/tin3.jpg" -> "/images/room-minimal.jpg";
                default -> throw fail(404,"Không tìm thấy ảnh.");
            };
            return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, sample)
                .cacheControl(CacheControl.noStore()).build();
        }
        return ResponseEntity.ok().header("X-Content-Type-Options","nosniff").cacheControl(CacheControl.noStore())
            .contentType(MediaType.parseMediaType((String)image.get("loaiTep"))).body((byte[])image.get("duLieu"));
    }
}
