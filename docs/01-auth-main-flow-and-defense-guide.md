# Kiến Trúc & Luồng Nghiệp Vụ Chính: Module Xác Thực (Auth Main Flow)

Tài liệu này giải thích chi tiết **Luồng chính (Main Flow)** của phân hệ Xác thực (**Authentication**) trong hệ thống SAGA, giúp thành viên nhóm hiểu rõ bản chất kỹ thuật từ Frontend đến Backend và tự tin trả lời phỏng vấn trước Hội đồng Đồ án Tốt nghiệp.

---

## 1. Bản Chất Kiến Trúc Xác Thực Của SAGA

Hệ thống SAGA sử dụng cơ chế:
$$\text{\textbf{Stateful Session Cookie}} \quad + \quad \text{\textbf{Double Submit CSRF Token (No Bearer JWT)}}$$

- **Tại sao không dùng JWT lưu ở `localStorage`?**
  - Lưu token trong `localStorage` rất dễ bị đánh cắp qua tấn công **XSS (Cross-Site Scripting)**.
  - Token JWT dạng Stateless không thể thu hồi tức thì (Instant Revocation) khi phát hiện tài khoản bị xâm nhập.
- **Giải pháp của SAGA**:
  - Session ID lưu trong cookie `SAGA_SESSION` có cờ `HttpOnly; Secure; SameSite=None` ➔ Trình duyệt tự động gửi, JavaScript không thể đọc trộm (chống XSS 100%).
  - Phòng chống tấn công giả mạo yêu cầu (**CSRF**) bằng cặp token `XSRF-TOKEN` (trong Cookie) và `X-XSRF-TOKEN` (trong Header của mỗi request POST/PUT/DELETE).

---

## 2. Luồng Nghiệp Vụ Chính (The Main Flow)

Luồng hoạt động từ lúc người dùng mở trình duyệt đến khi vào không gian làm việc bao gồm 4 giai đoạn nối tiếp:

```
[1. Bấm Đăng nhập Google] ──> [2. BE OAuth2 Callback] ──> [3. Ghi Cookie Phiên]
                                                                  │
                                                                  ▼
[5. Điều hướng Home Role] <── [passwordSetupRequired: false] <── [4. FE GET /api/auth/me]
                                          │
                                          ▼ [passwordSetupRequired: true]
                             [Chuyển sang /auth/setup-password]
                                          │
                             [Gửi POST /api/auth/password/setup kèm CSRF]
                                          │
                             [Cập nhật xong ──> Điều hướng Home Role]
```

### Bước 1: Khởi tạo Đăng nhập Google Workspace FPT / FE
1. Người dùng bấm nút **"Tiếp tục với Google (FPT / FE)"** tại trang `/login`.
2. Frontend chuyển hướng người dùng đến endpoint Backend:
   $$\text{\texttt{GET https://saga-be-production.up.railway.app/oauth2/authorization/google}}$$
3. Người dùng đăng nhập tài khoản mail trường (`@fpt.edu.vn` hoặc `@fe.edu.vn`). Backend từ chối các email cá nhân `@gmail.com` không thuộc tổ chức.

### Bước 2: Backend xử lý OAuth2 & Cấp phát Phiên làm việc
1. Sau khi Google xác thực thành công, Google callback về Backend.
2. Backend kiểm tra tài khoản trong database:
   - Nếu là lần đầu tiên đăng nhập: Đánh dấu cờ `passwordSetupRequired = true`.
   - Nếu đã từng thiết lập tài khoản: Đánh dấu `passwordSetupRequired = false`.
3. Backend trả về 2 Cookie quan trọng trong Header `Set-Cookie`:
   - `SAGA_SESSION`: Chứa mã phiên làm việc máy chủ (`HttpOnly; Secure; SameSite=None`).
   - `XSRF-TOKEN`: Chứa mã bảo vệ CSRF (`Secure; SameSite=None`).
4. Backend chuyển hướng trình duyệt người dùng quay trở lại:
   $$\text{\texttt{https://<frontend-domain>/login}}$$

### Bước 3: Frontend kiểm tra phiên hiện tại (`GET /api/auth/me`)
1. Khi trang `/login` nạp, hook `useSession()` tự động gửi request:
   $$\text{\texttt{GET /api/auth/me}} \quad \text{với} \quad \text{\texttt{withCredentials: true}}$$
2. Backend đọc cookie `SAGA_SESSION` và trả về thông tin người dùng:
   ```json
   {
     "passwordSetupRequired": false,
     "user": {
       "id": "91e2e046-8173-40bc-bf7b-6040d509481b",
       "email": "haihlse183904@fpt.edu.vn",
       "username": null,
       "fullName": "Le Hoang Hai (K18 HCM)",
       "avatarUrl": "https://lh3.googleusercontent.com/...",
       "role": "STUDENT"
     }
   }
   ```
3. Frontend lưu dữ liệu vào Zustand store (`useAuthStore`) và kích hoạt cờ `isAuthenticated = true`.

### Bước 4: Phân nhánh nghiệp vụ (Branching Logic)
Dựa vào cờ `passwordSetupRequired`, Frontend phân tách 2 hướng:

#### Trường hợp A: `passwordSetupRequired === true` (Tài khoản Google đăng nhập lần đầu)
1. Frontend tự động điều hướng người dùng sang trang `/auth/setup-password`.
2. Người dùng nhập mật khẩu nội bộ mới (yêu cầu tối thiểu 10 ký tự).
3. Khi bấm **"Lưu mật khẩu & Bắt đầu"**, Axios thực thi:
   - Đọc giá trị cookie `XSRF-TOKEN`.
   - Gắn header `X-XSRF-TOKEN: <token_value>`.
   - Gửi `POST /api/auth/password/setup` kèm body `{ newPassword, confirmPassword }`.
4. Backend xác thực CSRF thành công, băm mật khẩu (BCrypt) lưu vào DB và cập nhật `passwordSetupRequired = false`.
5. Frontend chuyển tiếp người dùng về không gian làm việc theo vai trò.

#### Trường hợp B: `passwordSetupRequired === false` (Tài khoản bình thường)
Frontend gọi hàm `getRoleHomePath(user.role)` trong `src/features/auth/lib/role-routes.ts` để điều hướng lập tức:
- **`STUDENT` (Sinh viên)**: Điều hướng sang `/student/courses` (Trang chọn môn học kỳ hiện tại).
- **`LECTURER` (Giảng viên)**: Điều hướng sang `/lecturer/courses` (Trang chọn lớp học phần phụ trách).
- **`ADMIN` (Quản trị viên)**: Điều hướng sang `/admin/dashboard` (Trung tâm quản trị hệ thống).

---

## 3. Cơ Chế Nhận Diện Đăng Nhập Trên Landing Page

1. Khi người dùng quay lại Landing Page (`/`):
   - Hook `useSession()` tự động chạy nền để kiểm tra phiên.
   - Nếu đã đăng nhập (`isAuthenticated && user`):
     - Nút **"Đăng nhập"** tự động chuyển thành nút **"Vào ứng dụng"** (dẫn thẳng tới Home Path của vai trò).
     - Hiển thị Avatar người dùng kèm Dropdown Menu cá nhân (truy cập nhanh "Không gian làm việc", "Hồ sơ cá nhân", "Đăng xuất").
2. Bất kỳ khi nào người dùng nhấp vào **Logo SAGA** hoặc chữ **SAGA** ở bất kỳ thanh điều hướng nào trong ứng dụng, hệ thống đều đưa người dùng quay trở lại trang chủ Landing Page (`/`).

---

## 4. Ba Điểm Cốt Lõi Trả Lời Khi Hội Đồng Hỏi Về Luồng Này

### Câu 1: Tại sao lúc gọi API giữa Frontend (localhost / Vercel) và Backend (Railway) bị lỗi `403 ACCESS_DENIED` hoặc `401`?
- **Nguyên nhân**:
  - Đây là môi trường **Cross-Origin (Khác domain)**. Mặc định trình duyệt sẽ chặn Cookie nếu cookie không có `SameSite=None; Secure`.
  - Nếu `XSRF-TOKEN` bị đặt `SameSite=Lax`, Frontend sẽ không thể đọc và gửi header `X-XSRF-TOKEN` ➔ Backend Spring Security chặn lại với mã lỗi `403 ACCESS_DENIED`.
  - Tương tự, nếu `SAGA_SESSION` bị `SameSite=Lax`, trình duyệt sẽ không gửi cookie phiên khi Frontend gọi API ➔ Backend không nhận diện được người dùng và trả về `401 INVALID_CREDENTIALS`.
- **Cách giải quyết của nhóm**:
  - Cấu hình Backend Spring Session ép buộc `SameSite=None; Secure` cho cả 2 cookie `SAGA_SESSION` và `XSRF-TOKEN`.
  - Cấu hình Axios Client trên Frontend luôn bật `withCredentials: true` và tự động trích xuất `XSRF-TOKEN` gửi kèm header `X-XSRF-TOKEN`.

### Câu 2: Nếu một Sinh viên cố tình gõ URL `/admin/dashboard` trên trình duyệt thì hệ thống xử lý ra sao?
- **Trả lời**: Hệ thống bảo vệ 2 lớp:
  1. **Lớp Frontend (Route Guards)**: Trong `DashboardLayout`, hệ thống gọi hàm `isPathAllowedForRole(pathname, user.role)`. Nếu sinh viên cố tình truy cập tuyến `/admin/*` hoặc `/lecturer/*`, hệ thống ngay lập tức gọi `router.replace(getRoleHomePath("STUDENT"))` đưa sinh viên về lại trang của mình.
  2. **Lớp Backend (Spring Security Authority Guard)**: Mọi endpoint API đều được kiểm tra phân quyền bằng `@PreAuthorize("hasRole('ADMIN')")`. Kể cả khi có can thiệp client-side, API vẫn trả về `403 Forbidden` và từ chối cung cấp dữ liệu.

### Câu 3: Tại sao người dùng đăng nhập bằng Google lại phải có thêm bước đặt mật khẩu (`setup-password`)?
- **Trả lời**:
  - Đảm bảo tính linh hoạt: Khi sinh viên hoặc giảng viên sử dụng các công cụ bên ngoài hoặc khi hệ thống SSO gặp sự cố tạm thời, họ vẫn có thể đăng nhập bằng tài khoản nội bộ (Username/Email + Password).
  - Tách biệt phiên đăng nhập: Mật khẩu này thuộc về hệ thống SAGA và không làm ảnh hưởng đến mật khẩu tài khoản Google FPT của người dùng.
