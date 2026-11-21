package vn.trohn;

import jakarta.servlet.http.*;
import java.security.*;
import java.util.*;
import java.nio.charset.StandardCharsets;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
class Accounts {
    final JdbcTemplate db;
    final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(12);
    Accounts(JdbcTemplate db) { this.db = db; }

    record Login(String email, String password) {}
    record Registration(String name, String email, String phone, String password, String role) {}
    static String required(String value, int max) {
        if (value == null || value.isBlank() || value.length() > max) throw fail(400,"Dữ liệu không hợp lệ.");
        return value.trim();
    }
    static ResponseStatusException fail(int status,String message) {
        return new ResponseStatusException(HttpStatus.valueOf(status),message);
    }
    String token(HttpServletRequest req) {
        if(req.getCookies()!=null) for(Cookie cookie:req.getCookies())
            if(cookie.getName().equals("trohn_session")) return cookie.getValue();
        return "";
    }
    static String digest(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch(NoSuchAlgorithmException ex){throw new IllegalStateException(ex);}
    }
    Map<String,Object> session(HttpServletRequest req) {
        var rows=db.queryForList("""
            SELECT CAST(a.id AS CHAR) id,a.hoTen name,a.email,a.soDienThoai phone,a.vaiTro role
            FROM TaiKhoan a JOIN PhienDangNhap s ON s.taiKhoanId=a.id
            WHERE a.trangThai='HOAT_DONG' AND s.maPhienBam=? AND s.thuHoiLuc IS NULL AND s.hetHanLuc>UTC_TIMESTAMP(6)
            """,digest(token(req)));
        return rows.isEmpty()?null:rows.get(0);
    }
    Map<String,Object> require(HttpServletRequest req,String role) {
        // Serialize protected writes with account locking and session revocation.
        db.queryForList("SELECT a.id FROM TaiKhoan a JOIN PhienDangNhap s ON s.taiKhoanId=a.id WHERE s.maPhienBam=? FOR UPDATE",digest(token(req)));
        var user=session(req);
        if(user==null) throw fail(401,"Bạn cần đăng nhập.");
        if(!role.equals(user.get("role"))) throw fail(403,"Tài khoản chưa có quyền thực hiện thao tác này.");
        return user;
    }
    @PostMapping("/register")
    void register(@RequestBody Registration body) {
        String role=required(body.role,20),email=required(body.email,255).toLowerCase(Locale.ROOT);
        if(!Set.of("KHACH_THUE","CHU_TRO").contains(role) || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")
           || body.phone==null || !body.phone.matches("0[0-9]{9}") || body.password==null ||
           body.password.length()<8 || body.password.getBytes(StandardCharsets.UTF_8).length>72) throw fail(400,"Kiểm tra email, điện thoại và mật khẩu (8–72 byte).");
        db.update("INSERT INTO TaiKhoan(hoTen,email,soDienThoai,matKhauBam,vaiTro) VALUES(?,?,?,?,?)",
          required(body.name,255),email,body.phone,passwords.encode(body.password),role);
    }
    @PostMapping("/login") @Transactional
    Map<String,Object> login(@RequestBody Login body,HttpServletRequest req,HttpServletResponse res) {
        var rows=db.queryForList("SELECT id,vaiTro,matKhauBam FROM TaiKhoan WHERE email=? AND trangThai='HOAT_DONG' FOR UPDATE",required(body.email,255));
        if(rows.isEmpty() || body.password==null || body.password.getBytes(StandardCharsets.UTF_8).length>72 ||
           !passwords.matches(body.password,(String)rows.get(0).get("matKhauBam"))) throw fail(401,"Email hoặc mật khẩu không đúng, hoặc tài khoản đã khóa.");
        byte[] bytes=new byte[32]; new SecureRandom().nextBytes(bytes);
        String key=HexFormat.of().formatHex(bytes);
        db.update("UPDATE PhienDangNhap SET thuHoiLuc=UTC_TIMESTAMP(6) WHERE maPhienBam=? AND thuHoiLuc IS NULL",digest(token(req)));
        db.update("INSERT INTO PhienDangNhap(taiKhoanId,maPhienBam,hetHanLuc) VALUES(?,?,UTC_TIMESTAMP(6)+INTERVAL 7 DAY)",rows.get(0).get("id"),digest(key));
        cookie(res,key,604800,req.isSecure());
        return Map.of("role",rows.get(0).get("vaiTro"));
    }
    static void cookie(HttpServletResponse res,String key,int age,boolean secure) {
        res.addHeader("Set-Cookie",ResponseCookie.from("trohn_session",key).httpOnly(true).secure(secure).sameSite("Strict").path("/api").maxAge(age).build().toString());
    }
    @PostMapping("/logout") void logout(HttpServletRequest req,HttpServletResponse res) {
        db.update("UPDATE PhienDangNhap SET thuHoiLuc=UTC_TIMESTAMP(6) WHERE maPhienBam=? AND thuHoiLuc IS NULL",digest(token(req)));
        cookie(res,"",0,req.isSecure());
    }
}
@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(ResponseStatusException.class) ResponseEntity<?> invalid(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message",ex.getReason()));
    }
    @ExceptionHandler(DuplicateKeyException.class) ResponseEntity<?> conflict() {
        return ResponseEntity.status(409).body(Map.of("message","Thông tin này đã tồn tại. Hãy kiểm tra lại."));
    }
    @ExceptionHandler(DataAccessResourceFailureException.class) ResponseEntity<?> unavailable() {
        return ResponseEntity.status(503).body(Map.of("message","Chưa kết nối được MySQL. Vui lòng thử lại."));
    }
}
