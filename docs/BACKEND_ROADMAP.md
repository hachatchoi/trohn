# Roadmap nhúng Backend vào TROHN

Trạng thái xuất phát (kiểm tra 29/09/2026): `backend/` chỉ có 10 file `.gitkeep`, chưa có
`pom.xml`, chưa có dòng code nào. Frontend đã hoàn thiện nhưng lấy toàn bộ dữ liệu từ
`src/assets/preview.ts`, `src/services/` rỗng, đăng nhập là giả (`signIn: setUser`).

Stack đã chốt: **Spring Boot 3.4 + H2 in-memory (giai đoạn dev) → MySQL 8.0 (giai đoạn cuối)**.
Lý do dùng H2 trước: không phải cài MySQL, không phải viết migration tay, JPA tự sinh bảng từ
Entity. Đổi sang MySQL sau này chỉ là thay 4 dòng trong `application.yml` + thêm dependency.

---

## Nguyên tắc quan trọng nhất: đi theo "lát dọc", không đi theo "lát ngang"

Sai lầm phổ biến là viết hết tất cả Entity → hết tất cả Repository → hết tất cả Service →
hết tất cả Controller. Làm vậy thì phải viết 3-4 ngày mới biết mình có sai không.

Cách đúng: chọn **một tính năng duy nhất** (danh sách phòng), làm xuyên suốt từ DB lên tới UI,
chạy thử, thấy dữ liệu thật hiện trên giao diện. Lúc đó bạn đã có bộ khung hoàn chỉnh, mọi
tính năng còn lại chỉ là lặp lại cùng một khuôn.

Thứ tự lát dọc đầu tiên: `Room` (Entity) → `RoomRepository` → `RoomService` → `RoomController`
→ `GET /api/listings` → `src/services/listingService.ts` → `SearchPage.tsx`.

Đăng nhập/JWT để **sau cùng**, không phải đầu tiên. Security bật sớm sẽ chặn hết request và
bạn mất nhiều giờ debug 401 trong khi chưa có gì để test.

---

## Các quyết định phải chốt TRƯỚC khi viết Entity

Ba điểm này nếu chốt sai sẽ phải sửa lan ra cả FE lẫn DB, nên quyết dứt điểm ngay:

### 1. Đơn vị giá tiền

Mock hiện lưu `price: 3.5` nghĩa là 3,5 triệu. Trong DB **không được** lưu như vậy — số thực
gây sai số và không sắp xếp/so sánh chính xác được.

Chốt: DB lưu **VND nguyên, kiểu `BIGINT`** (`3500000`). Frontend nhận số nguyên rồi tự format.
Hệ quả: phải sửa hàm `formatPrice` trong `preview.ts` và các bộ lọc `max` trong `SearchPage`
(đang so sánh theo triệu).

### 2. Khóa chính: slug hay số?

FE đang dùng slug làm id (`'studio-nguyen-trai'`) và URL là `/phong/studio-nguyen-trai`.

Chốt: Entity có **cả hai** — `id BIGINT AUTO_INCREMENT` làm khóa chính (đúng chuẩn thiết kế DB,
giảng viên sẽ nhìn vào chỗ này) và `slug VARCHAR(160) UNIQUE` để FE tra cứu theo URL.
Endpoint chi tiết nhận slug: `GET /api/listings/{slug}`. Khóa ngoại trong DB trỏ vào `id`.

### 3. Ảnh phòng: một hay nhiều?

`Room.image` hiện là một string. Thực tế tin cho thuê luôn có nhiều ảnh.

Chốt: DB có bảng riêng `room_images(id, room_id, url, sort_order)`. API trả về
`images: string[]`. FE sửa `room.image` thành `room.images[0]` ở chỗ hiển thị thumbnail.

---

## Bước 0 — Chuẩn bị môi trường (~20 phút)

Cần: **JDK 21** (Spring Boot 3.4 yêu cầu tối thiểu JDK 17, nên chọn 21 LTS). Kiểm tra bằng
`java -version`. Nếu chưa có, tải Temurin 21.

Không cần cài Maven — dùng Maven Wrapper (`mvnw`) đi kèm project.
Không cần cài MySQL ở giai đoạn này.

Cách tạo project: vào <https://start.spring.io> với cấu hình sau, tải zip rồi giải nén
**đè vào thư mục `backend/`** đang có (giữ nguyên cây thư mục `.gitkeep` sẵn có).

| Trường | Giá trị |
|---|---|
| Project | Maven |
| Language | Java |
| Spring Boot | 3.4.x |
| Group | `vn.trohn` |
| Artifact | `trohn-backend` |
| Package name | `vn.trohn` |
| Packaging | Jar |
| Java | 21 |

Dependencies chọn đúng 5 cái, **chưa chọn Spring Security**:

- Spring Web
- Spring Data JPA
- H2 Database
- Validation
- Lombok

Sau khi giải nén, chạy `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`).
Thấy log `Started TrohnBackendApplication` và cổng 8080 là xong bước 0.
Nếu bước này không chạy được thì đừng đi tiếp — mọi bước sau đều dựa trên nó.

### `application.yml` cho giai đoạn dev

Xóa `application.properties`, tạo `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:trohn;DB_CLOSE_DELAY=-1
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop   # JPA tự tạo bảng từ Entity, mất khi tắt app
    show-sql: true            # xem SQL thật trong console, rất hữu ích để học
    properties:
      hibernate.format_sql: true
  h2:
    console:
      enabled: true           # xem DB qua browser: localhost:8080/h2-console
      path: /h2-console
server:
  port: 8080
```

`h2-console` là công cụ quan trọng nhất ở giai đoạn này: mở trình duyệt vào
`localhost:8080/h2-console`, JDBC URL điền `jdbc:h2:mem:trohn`, user `sa`, không mật khẩu.
Bạn sẽ thấy bảng JPA vừa sinh ra và chạy được SQL trực tiếp để kiểm tra dữ liệu.

---

## Bước 1 — CORS (~5 phút, nhưng bỏ qua là tắc ngay)

Frontend chạy ở `127.0.0.1:5173` (xem script `dev` trong `package.json`), backend ở
`localhost:8080`. Khác cổng = khác origin, browser sẽ chặn mọi request.

Tạo `config/CorsConfig.java` cho phép origin của Vite. Lưu ý FE của bạn dev trên
`127.0.0.1` chứ không phải `localhost` — hai cái này browser coi là **khác origin**, nên khai
báo cả hai cho chắc. Khi sang bước JWT, nếu dùng cookie thì phải bật thêm
`allowCredentials(true)`, và lúc đó **không được** dùng `allowedOrigins("*")`.

Cách kiểm tra đã đúng: mở DevTools tab Network khi FE gọi API, không thấy lỗi
`blocked by CORS policy`.

---

## Bước 2 — Lát dọc đầu tiên: danh sách phòng (~1 ngày)

Đây là bước quan trọng nhất của cả roadmap. Làm xong bước này là bạn đã hiểu toàn bộ luồng và
mọi thứ còn lại chỉ là sao chép khuôn.

Thứ tự tạo file trong `backend/src/main/java/vn/trohn/`:

**2.1 — `model/Room.java`**

Entity ánh xạ bảng `rooms`. Các trường cần có (đối chiếu `src/types/index.ts` rồi bổ sung
những gì DB bắt buộc phải có mà FE chưa có):

| Trường | Kiểu Java | Ghi chú |
|---|---|---|
| `id` | `Long` | `@Id @GeneratedValue(strategy = IDENTITY)` |
| `slug` | `String` | `@Column(unique = true, length = 160)` — FE tra theo URL |
| `title` | `String` | |
| `description` | `String` | `@Column(columnDefinition = "TEXT")` — FE chưa có, thêm vào |
| `district` | `String` | Bước 2 để tạm String, bước 6 tách thành bảng riêng |
| `address` | `String` | |
| `price` | `Long` | **VND nguyên**, không phải triệu |
| `area` | `Double` | m² |
| `type` | `RoomType` | `@Enumerated(EnumType.STRING)` — enum `STUDIO, PHONG_TRO, CHUNG_CU_MINI` |
| `latitude` | `Double` | cho `MapPage` — FE đang hiển thị "vị trí minh họa" |
| `longitude` | `Double` | |
| `status` | `RoomStatus` | `AVAILABLE, RENTED, PENDING_REVIEW, REJECTED` — cần cho luồng admin duyệt tin |
| `createdAt` | `Instant` | `@CreationTimestamp` |
| `updatedAt` | `Instant` | `@UpdateTimestamp` |

Chưa cần quan hệ `landlord` ở bước này — thêm ở bước 6 khi đã có `User`. Cứ để Entity đơn giản
nhất có thể để chạy được trước.

**2.2 — `repository/RoomRepository.java`**

```java
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findBySlug(String slug);
}
```

Chỉ hai dòng. Spring Data tự sinh toàn bộ implementation, không cần viết SQL.
Đây là chỗ hay gây ngạc nhiên nhất khi mới học JPA: bạn chỉ khai báo interface.

**2.3 — `dto/RoomSummaryResponse.java` và `dto/RoomDetailResponse.java`**

Đừng trả Entity trực tiếp ra API. Hai lý do thực tế: (1) Entity có quan hệ lazy-load, trả trực
tiếp sẽ gây lỗi serialize vòng lặp vô hạn; (2) sau này thêm `passwordHash` vào `User` mà quên,
là lộ luôn ra API.

Dùng Java **record** cho gọn:

```java
public record RoomSummaryResponse(
    String slug, String title, String district, String address,
    Long price, Double area, String type, List<String> images,
    List<String> amenities
) {}
```

`RoomSummaryResponse` cho danh sách (nhẹ), `RoomDetailResponse` cho trang chi tiết (đầy đủ
description, toạ độ, tiện ích, trường gần đó).

**2.4 — `service/RoomService.java`**

Nhận tham số tìm kiếm, gọi repository, map Entity → DTO. Đặt `@Transactional(readOnly = true)`
cho các hàm chỉ đọc.

**2.5 — `controller/RoomController.java`**

```
GET /api/listings          → danh sách, có filter + phân trang
GET /api/listings/{slug}   → chi tiết một phòng
```

**2.6 — Seed data**

Không có dữ liệu thì không test được gì. Tạo `src/main/resources/data.sql` — H2 tự chạy file
này khi khởi động. Copy 8 phòng từ `frontend/src/assets/preview.ts` sang, **nhớ đổi giá từ
`3.5` thành `3500000`**.

Lưu ý thứ tự: với `ddl-auto: create-drop`, cần thêm `spring.jpa.defer-datasource-initialization: true`
vào `application.yml`, nếu không `data.sql` chạy trước khi bảng được tạo và sẽ lỗi.

**2.7 — Kiểm tra trước khi chuyển sang FE**

Đừng sửa frontend cho tới khi 3 việc sau đều chạy:

1. `curl http://localhost:8080/api/listings` trả về JSON có 8 phòng
2. `curl http://localhost:8080/api/listings/studio-nguyen-trai` trả về đúng một phòng
3. Slug không tồn tại → trả **404**, không phải 500 (dùng `@ResponseStatus(NOT_FOUND)` trên
   một exception riêng, hoặc `@RestControllerAdvice`)

---

## Bước 3 — Nối frontend vào, không làm vỡ giao diện (~1 ngày)

Nguyên tắc: **không xoá `preview.ts`**. Thêm một công tắc để chuyển qua lại giữa mock và API
thật. Lý do: khi backend lỗi hoặc bạn cần demo gấp, bật lại mock là giao diện chạy ngay.

**3.1 — Biến môi trường**

Tạo `frontend/.env.development`:

```
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK=false
```

Vite chỉ đọc biến có tiền tố `VITE_`. Truy cập bằng `import.meta.env.VITE_API_URL`.

`.gitignore` của repo đã có `.env`, `.env.*` và `!.env.example` — nên file này tự động không bị
commit, không cần làm gì thêm. Việc cần làm là cập nhật `.env.example` ở gốc repo (hiện chỉ có
2 dòng comment) để liệt kê các biến cần khai báo: `VITE_API_URL`, `JWT_SECRET`, `DB_USER`,
`DB_PASSWORD`.

**3.2 — Proxy để khỏi lo CORS (tuỳ chọn, nhưng nên làm)**

Thêm vào `vite.config.ts`:

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
})
```

Khi đó FE gọi `/api/listings` (đường dẫn tương đối), Vite chuyển tiếp sang backend. Browser
thấy cùng origin nên CORS không còn là vấn đề trong dev. Vẫn cần `CorsConfig` ở bước 1 cho môi
trường production.

**3.3 — `src/services/http.ts`**

Không cần cài axios. `fetch` có sẵn trong browser là đủ, và bớt được một dependency:

```ts
const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('accessToken')
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.message ?? 'Có lỗi xảy ra, vui lòng thử lại')
  }
  return res.status === 204 ? (undefined as T) : res.json()
}
```

Chỗ đọc `Authorization` để sẵn từ giờ, tới bước 5 có JWT là tự động hoạt động.

**3.4 — `src/services/listingService.ts` với công tắc mock**

Đây là mấu chốt giúp không làm vỡ giao diện:

```ts
import { rooms as mockRooms } from '../assets/preview'
import { request } from './http'
import type { Room } from '../types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const listingService = {
  search: async (params: SearchParams): Promise<Page<Room>> => {
    if (USE_MOCK) return mockSearch(params)          // lọc client-side như hiện tại
    const qs = new URLSearchParams(clean(params)).toString()
    return request<Page<Room>>(`/listings?${qs}`)
  },
  getBySlug: async (slug: string): Promise<Room> => {
    if (USE_MOCK) {
      const found = mockRooms.find((r) => r.id === slug)
      if (!found) throw new ApiError(404, 'Không tìm thấy phòng')
      return found
    }
    return request<Room>(`/listings/${slug}`)
  },
}
```

`clean()` là hàm bỏ các key có giá trị rỗng/undefined — nếu không, URL sẽ thành
`?district=&max=` và backend nhận chuỗi rỗng rồi lọc sai.

**3.5 — Sửa `SearchPage.tsx`**

Thay `import { rooms } from '../assets/preview'` bằng gọi service trong `useEffect`.
Ba state phải có: `data`, `loading`, `error`. Giao diện hiện tại chưa có trạng thái nào trong
số này nên phải thêm mới — đây là phần việc thật sự của bước 3.

Hai chi tiết dễ bỏ sót:

- **Race condition**: người dùng đổi filter nhanh, response cũ về sau response mới và ghi đè
  kết quả đúng. Xử lý bằng `AbortController` trong hàm cleanup của `useEffect`.
- **Bộ lọc giá**: `SearchPage` đang so sánh theo đơn vị triệu. Sau khi backend trả VND nguyên
  thì phải nhân/chia cho khớp, hoặc đổi luôn cả input sang VND.

**3.6 — Sửa `RoomDetailPage.tsx`**

`rooms.find(...)` thành `getBySlug(id)`. Có ba nhánh hiển thị: đang tải (skeleton), lỗi 404
(dùng `EmptyState` đã có sẵn — không phải viết mới), lỗi khác (thông báo + nút thử lại).

**3.7 — Xoá nhãn "minh họa"**

`RoomDetailPage` đang hiện "Thông tin minh họa", "Số minh họa", "Vị trí minh họa", và component
`PreviewNote` xuất hiện nhiều nơi. Khi dữ liệu đã là thật thì bỏ dần các nhãn này.

---

## Bước 4 — Phân trang và lọc phía server (~nửa ngày)

Hiện `SearchPage` tải toàn bộ mảng rồi lọc bằng `useMemo`. Với 8 phòng thì không sao, với 5000
phòng thì sập. Đây cũng là điểm giảng viên hay hỏi khi bảo vệ.

Backend nhận query params: `district`, `minPrice`, `maxPrice`, `type`, `minArea`, `universityId`,
`radiusKm`, `sort`, `page`, `size`.

Cách làm lọc động: dùng **JPA Specification** (`JpaSpecificationExecutor<Room>`). Mỗi filter là
một `Specification` nhỏ, trả `null` khi tham số rỗng, rồi ghép bằng `Specification.allOf(...)`.
Tránh viết `@Query` với một chuỗi JPQL khổng lồ đầy `AND (:x IS NULL OR ...)` — rất khó đọc và
khó sửa.

Phân trang: nhận `Pageable`, trả `Page<RoomSummaryResponse>`. Spring tự sinh JSON có
`content`, `totalElements`, `totalPages`, `number`. Type ở FE:

```ts
export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number   // lưu ý: Spring dùng "number", 0-based
}
```

Sắp xếp: whitelist các giá trị hợp lệ (`price-asc`, `price-desc`, `area-desc`, `newest`) rồi map
sang `Sort`. **Không** truyền trực tiếp string của người dùng vào `Sort.by()` — đó là lỗ hổng
cho phép sắp xếp theo cột bất kỳ, kể cả cột không nên lộ.

Lọc theo khoảng cách tới trường (`radiusKm`) là phần khó nhất. Cách đơn giản và đủ dùng cho đồ
án: bảng `room_campus_distances(room_id, campus_id, distance_km)` tính sẵn, join rồi lọc — đúng
với cấu trúc `roomCampuses` mà FE đang dùng. Không cần công thức Haversine trong SQL.

---

## Bước 5 — Xác thực JWT (~1-2 ngày)

Làm ở bước này, không làm sớm hơn. Giờ bạn đã có API chạy được để so sánh trước/sau.

**5.1 — Thêm dependency**

Vào `pom.xml`: `spring-boot-starter-security` và `jjwt` (`io.jsonwebtoken:jjwt-api`,
`jjwt-impl`, `jjwt-jackson`, bản 0.12.x).

Cảnh báo: ngay khi thêm Security, **mọi endpoint bị chặn** và Spring sinh mật khẩu random trong
log. Đừng nghĩ là bạn làm sai — cấu hình `SecurityFilterChain` ở bước 5.4 là xong.

**5.2 — `model/User.java`**

| Trường | Ghi chú |
|---|---|
| `id` | `Long`, khóa chính |
| `email` | `@Column(unique = true)` |
| `passwordHash` | **Không bao giờ** đưa trường này vào DTO response |
| `fullName` | |
| `phone` | Ràng buộc 10 số bắt đầu bằng 0, khớp regex FE đang dùng |
| `role` | enum `TENANT, LANDLORD, ADMIN` |
| `enabled` | `boolean` |
| `createdAt` | `@CreationTimestamp` |

Mã hoá mật khẩu bằng `BCryptPasswordEncoder` (khai báo một `@Bean` trong `config/`).
Không tự viết hàm hash, không dùng MD5/SHA.

**5.3 — Secret key và cấu hình token**

`application.yml`:

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:doi-thanh-chuoi-that-dai-toi-thieu-32-ky-tu-cho-HS256}
    access-token-minutes: 15
    refresh-token-days: 7
```

Thời hạn khớp với `SYSTEM_ARCHITECTURE.docx` đã nộp. Secret đọc từ biến môi trường, chỉ có giá
trị mặc định cho dev. **Không commit secret thật** — `.env.example` trong repo đã ghi rõ điều
này rồi, giữ đúng nguyên tắc đó.

**5.4 — Các lớp cần viết trong `security/`**

- `JwtService` — sinh và kiểm tra token, đọc claims (`sub` = userId, thêm claim `role`)
- `JwtAuthenticationFilter` — extends `OncePerRequestFilter`, đọc header `Authorization`,
  xác thực rồi nạp vào `SecurityContext`
- `SecurityConfig` — `SecurityFilterChain` với:
  - `sessionCreationPolicy(STATELESS)` — API không dùng session
  - `csrf.disable()` — hợp lý khi token nằm ở header, **không** hợp lý nếu bạn để token trong cookie
  - `permitAll()` cho `POST /api/auth/**` và `GET /api/listings/**`
  - `hasRole("LANDLORD")` cho `POST/PUT/DELETE /api/landlord/**`
  - `hasRole("ADMIN")` cho `/api/admin/**`
  - `anyRequest().authenticated()`

**5.5 — Endpoint**

```
POST /api/auth/register   → tạo user, mã hoá mật khẩu, trả 201
POST /api/auth/login      → trả { accessToken, refreshToken, user }
POST /api/auth/refresh    → nhận refreshToken, trả accessToken mới
POST /api/auth/logout     → vô hiệu refreshToken
GET  /api/auth/me         → thông tin user đang đăng nhập
```

Refresh token nên lưu DB (bảng `refresh_tokens`) để `logout` thu hồi được. Nếu chỉ ký JWT mà
không lưu thì logout không có tác dụng thật — token vẫn hợp lệ tới khi hết hạn.

**5.6 — Sửa frontend**

Đổi `hooks/usePreview.tsx` thành `hooks/useAuth.tsx`. Việc cần làm:

- `user` từ `string | null` thành object `{ id, fullName, email, role } | null`
- `signIn` gọi `authService.login()` thật, lưu token, set user
- `signOut` gọi API logout rồi xoá localStorage
- Thêm `useEffect` khôi phục session khi F5 (đọc localStorage hoặc gọi `/auth/me`)
- Thêm state `loading` để tránh nháy về trang đăng nhập trong lúc đang khôi phục session
- `AuthPage.tsx`: bỏ `signIn('Minh Anh')` và `navigate('/dang-nhap?registered=1')`,
  thay bằng gọi API thật, có `loading` và hiển thị lỗi từ server

**Chỗ cần lưu ý về bảo mật:** `localStorage` dễ bị đánh cắp token nếu có lỗ hổng XSS. Đúng chuẩn
là refresh token để trong cookie `HttpOnly`. Với đồ án thì `localStorage` chấp nhận được, nhưng
nên nêu hạn chế này trong báo cáo — đó là điểm cộng khi bảo vệ.

**5.7 — Route guard (hiện đang thiếu hoàn toàn)**

`/chu-tro/*` và `/admin/*` bây giờ ai gõ URL cũng vào được. Viết component
`<RequireRole roles={['ADMIN']}>` bọc quanh các nhóm route trong `App.tsx`, chưa đăng nhập thì
`<Navigate to="/dang-nhap" replace state={{ from: location }} />`.

Nhớ: guard ở FE chỉ để trải nghiệm người dùng, **không phải bảo mật**. Chặn thật nằm ở
`SecurityConfig` phía backend. Ai cũng sửa được JavaScript trong browser.

---

## Bước 6 — Các nghiệp vụ còn lại (~3-4 ngày)

Giờ đã có khuôn từ bước 2 và có user từ bước 5, mỗi tính năng chỉ là lặp lại.
Làm theo thứ tự này vì tính sau phụ thuộc tính trước:

**6.1 — Bổ sung quan hệ vào `Room`**

`@ManyToOne User landlord` — giờ mới làm được, vì bước 2 chưa có `User`.
Kèm theo: `@OneToMany` tới `RoomImage`, `@ManyToMany` tới `Amenity`.

**6.2 — Yêu thích**

Bảng `favorites(user_id, room_id, created_at)` với khóa chính kép. Endpoint:

```
GET    /api/me/favorites
POST   /api/me/favorites/{roomSlug}
DELETE /api/me/favorites/{roomSlug}
```

FE: `toggleFavorite` trong `usePreview` đang chỉ sửa state. Giờ gọi API. Nên dùng **optimistic
update**: đổi UI ngay, nếu API lỗi thì revert — vì chờ round-trip mạng mới đổi màu trái tim
sẽ cảm giác chậm.

**6.3 — Đặt lịch xem phòng**

Entity `Appointment` cần sửa so với type FE hiện tại:

| FE hiện tại | DB nên là | Lý do |
|---|---|---|
| `date: string` + `time: string` | `visitAt: LocalDateTime` | tách rời không so sánh/sắp xếp được |
| không có | `tenant: User` (FK) | phải biết ai đặt |
| không có | `room: Room` (FK) | thay cho `roomId` dạng string |
| không có | `createdAt`, `updatedAt` | audit |
| `id: 'LH-123456'` | `id: Long` + `code: String` | `LH-${Date.now()}` ở FE có thể trùng; mã hiển thị nên do server sinh |

Nghiệp vụ phải kiểm ở service, không kiểm ở controller: không đặt lịch trong quá khứ, không đặt
trùng slot cho cùng phòng, chỉ chủ trọ của phòng đó mới xác nhận/từ chối được, chỉ người đặt mới
huỷ được lịch của mình. Đây chính là phần "kiểm tra quyền theo nghiệp vụ" mà
`docs/architecture.md` đã ghi là nhiệm vụ của tầng `service/`.

**6.4 — Chủ trọ đăng và quản lý tin**

```
GET    /api/landlord/listings        → tin của chính mình
POST   /api/landlord/listings        → tạo, status = PENDING_REVIEW
PUT    /api/landlord/listings/{id}
DELETE /api/landlord/listings/{id}   → xoá mềm (deletedAt), không xoá cứng
GET    /api/landlord/appointments
PATCH  /api/landlord/appointments/{id}  → confirm / cancel
```

Điểm dễ sai nhất: phải kiểm tra phòng đang sửa **thuộc về** chủ trọ đang đăng nhập. Chỉ có
`hasRole('LANDLORD')` là chưa đủ — chủ trọ A vẫn sửa được tin của chủ trọ B. Đây là lỗi
IDOR, và là câu hỏi bảo vệ rất hay gặp.

**6.5 — Upload ảnh**

Giai đoạn đồ án: lưu file vào thư mục local (`uploads/`), DB lưu đường dẫn. Bắt buộc kiểm tra
content-type, giới hạn dung lượng (`spring.servlet.multipart.max-file-size`), và **đổi tên file
thành UUID** — không dùng tên gốc do người dùng đặt (tránh path traversal kiểu `../../`).

**6.6 — Admin**

```
GET   /api/admin/listings?status=PENDING_REVIEW
PATCH /api/admin/listings/{id}/approve
PATCH /api/admin/listings/{id}/reject    → kèm lý do
GET   /api/admin/users
PATCH /api/admin/users/{id}/toggle-enabled
GET   /api/admin/stats
```

**6.7 — Tách bảng tham chiếu**

Bước 2 để `district` là String cho nhanh. Giờ tách thành bảng `districts`, `universities`,
`amenities` với FK. Thêm endpoint `GET /api/metadata` trả về cả ba để FE đổ vào dropdown thay
cho mảng cứng trong `preview.ts`.

---

## Bước 7 — Chuyển sang MySQL (~2 giờ)

Chỉ làm khi mọi nghiệp vụ đã chạy ổn trên H2. Đổi sớm chỉ thêm việc.

**7.1** Cài MySQL 8.0, tạo database:

```sql
CREATE DATABASE trohn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`utf8mb4` là bắt buộc — dữ liệu của bạn toàn tiếng Việt, và `utf8` của MySQL chỉ là 3 byte,
sẽ lỗi với emoji hoặc một số ký tự.

**7.2** Thêm dependency `mysql-connector-j`, giữ H2 ở scope `test`.

**7.3** Tách profile trong `application.yml`:

```yaml
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
---
spring:
  config.activate.on-profile: dev
  datasource.url: jdbc:h2:mem:trohn
  jpa.hibernate.ddl-auto: create-drop
---
spring:
  config.activate.on-profile: prod
  datasource:
    url: jdbc:mysql://localhost:3306/trohn?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Ho_Chi_Minh
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa.hibernate.ddl-auto: validate   # KHÔNG bao giờ dùng update/create ở prod
```

**7.4 — Migration bằng Flyway**

Thư mục `backend/src/main/resources/db/migration/` đã có sẵn trong repo, đúng đường dẫn mặc
định của Flyway. Thêm dependency `flyway-core` + `flyway-mysql`, viết
`V1__init_schema.sql`, `V2__seed_reference_data.sql`.

Cách lấy SQL mà không phải viết tay: chạy app với `ddl-auto: create` trên MySQL một lần, dump
schema bằng `mysqldump --no-data`, dọn lại rồi bỏ vào `V1__init_schema.sql`. Sau đó đổi
`ddl-auto` thành `validate` vĩnh viễn.

Từ lúc này trở đi: **không sửa file migration đã chạy** — Flyway kiểm tra checksum và sẽ báo
lỗi. Mọi thay đổi schema là một file `V{n+1}__...sql` mới.

**7.5** Cập nhật `docs/database.md` — hiện chỉ là stub 6 dòng. Bổ sung ERD, danh sách bảng,
khóa ngoại, ràng buộc. Đây là mục giảng viên chắc chắn đọc.

---

## Thứ tự tóm gọn

| Bước | Việc | Thời gian | Xong khi nào thì đúng |
|---|---|---|---|
| 0 | Tạo project Spring Boot + H2 | 20 phút | Log `Started ...`, vào được `/h2-console` |
| 1 | CORS | 5 phút | Không còn lỗi CORS trong DevTools |
| 2 | Lát dọc `Room`: Entity → Controller | 1 ngày | `curl /api/listings` ra 8 phòng |
| 3 | Nối FE, có công tắc mock | 1 ngày | `SearchPage` hiện dữ liệu từ server |
| 4 | Lọc + phân trang server-side | 0.5 ngày | Đổi filter thấy URL query đổi, kết quả đúng |
| 5 | JWT + route guard | 1-2 ngày | Đăng nhập thật, F5 không mất session, gõ URL `/admin` bị chặn |
| 6 | Nghiệp vụ còn lại | 3-4 ngày | Yêu thích, đặt lịch, đăng tin, duyệt tin đều lưu DB |
| 7 | Chuyển MySQL + Flyway | 2 giờ | Tắt app bật lại dữ liệu vẫn còn |

Tổng: khoảng **2 tuần** làm đều.

---

## Ba lỗi tốn nhiều thời gian nhất, biết trước để tránh

**Bật Spring Security từ bước 0.** Mọi endpoint bị chặn, bạn không biết lỗi do code hay do
config, và debug 401 khi chưa có gì chạy là mò mẫm. Luôn để Security sau cùng.

**Trả Entity trực tiếp thay vì DTO.** Lúc đầu thấy tiện, đến khi thêm quan hệ `landlord` thì
Jackson serialize vòng lặp `Room → User → Room` và tràn stack. Lúc đó phải sửa lại toàn bộ
controller. Dùng DTO từ đầu.

**Đổi đơn vị giá tiền giữa chừng.** Nếu bước 2 để `price: Double` theo triệu rồi bước 6 mới đổi
sang `Long` VND, bạn phải sửa Entity, migration, seed data, DTO, `formatPrice`, bộ lọc
`SearchPage`, input form đăng tin. Chốt `BIGINT` VND ngay từ đầu.

---

## Song song: cập nhật tài liệu

`docs/api.md`, `docs/database.md`, `docs/requirements.md` hiện đều là stub. Thay vì viết tay,
thêm dependency `springdoc-openapi-starter-webmvc-ui` — bạn sẽ có Swagger UI ở
`localhost:8080/swagger-ui.html` tự sinh từ code, luôn khớp với thực tế. Xuất ra rồi đưa vào
`docs/api.md`.

Cập nhật `docs/plan.md`: mục "Duyệt giao diện với người dùng trước khi nối backend" tick xong
thì đánh dấu để theo dõi tiến độ.

