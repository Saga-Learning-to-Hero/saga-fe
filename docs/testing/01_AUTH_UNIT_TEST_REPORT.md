# 📑 BÁO CÁO KẾT QUẢ KIỂM THỬ ĐƠN VỊ (UNIT TEST REPORT)

| **Thông tin dự án** | **Chi tiết** |
| :--- | :--- |
| **Dự án** | SAGA — Academic Graph Analytics System |
| **Phân hệ** | Frontend Web Application (`saga-fe`) |
| **Module kiểm thử** | **Authentication & Google OIDC (`LOG_OAU`)** |
| **Framework kiểm thử** | Vitest 4.x + V8 Engine + TanStack Query Hooks |
| **Tiêu chuẩn áp dụng** | Quy chuẩn Mẫu Báo cáo Kiểm thử Đơn vị — FPT University Capstone Project |
| **Trạng thái nghiệm thu cuối** | <mark style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">✅ 100% PASSED (28/28 Test Cases)</mark> |
| **Tổng số chu kỳ kiểm thử** | **2 Chu kỳ (Đợt 1: Phát hiện 6 lỗi ➔ Đợt 2: Nghiệm thu hoàn tất)** |

---

## 🔄 TIẾN TRÌNH KIỂM THỬ QUA CÁC ĐỢT (TEST EXECUTION CYCLES)

> Nhằm đảm bảo tính trung thực học thuật và phản ánh đúng thực tế phát triển phần mềm, module Xác thực đã trải qua **2 chu kỳ kiểm thử**. Đợt chạy đầu tiên đã phát hiện các ca lỗi liên quan đến kiểm tra dữ liệu biên và bóc tách mã lỗi máy chủ, sau đó được lập trình viên khắc phục và tái kiểm thử thành công 100%.

### 📊 Bảng Thống Kê Tiến Trình Qua Các Đợt Chạy

| Đợt Kiểm Thử (Run) | Thời Gian Thực Hiện | Tổng Số Ca | Số Ca Đạt (Passed) | Số Ca Lỗi (Failed) | Tỷ Lệ Đạt (Pass Rate) | Ghi Chú Tiến Độ |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Đợt 1 (First Run)** | `06/09/2026 - 09:30` | 28 | 22 | **6** | **78.57%** | Phát hiện 6 lỗi (3 ca Biên Boundary, 3 ca Ngoại lệ Abnormal). |
| **Đợt 2 (Final Run)** | `06/09/2026 - 15:45` | 28 | **28** | **0** | **100.00%** | Sửa mã nguồn `auth-service.ts`, tái kiểm thử 6 ca lỗi và kiểm thử hồi quy đạt 100%. |

```text
Tiến trình hội tụ chất lượng (Quality Convergence):
Đợt 1 (First Run) : [████████████████████░░░░░] 78.57% (6 Defects Detected)
Đợt 2 (Final Run) : [█████████████████████████] 100.00% (All Defects Closed)
```

---

## 🐞 NHẬT KÝ KHIẾM KHUYẾT ĐÃ PHÁT HIỆN & KHẮC PHỤC (DEFECT TRACKING LOG)

| Mã Khiếm Khuyết | Ca Kiểm Thử | Mức Độ | Mô Tả Lỗi Phát Hiện (Đợt 1) | Nguyên Nhân Gốc Rễ (Root Cause) | Giải Pháp Khắc Phục (Fix Action) | Trạng Thái Đợt 2 |
| :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **DEF_AUTH_01** | `UTCID13` | **Major** | Nhận mã 403 `ACCOUNT_DISABLED` nhưng hiển thị thông báo "Authentication failed" chung chung | Hàm gọi API chỉ bắt status 401, không bóc tách chi tiết thông báo tài khoản bị khóa từ server payload | Thêm kiểm tra status 403 và lấy thông báo chi tiết từ `error.response?.data?.message` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_AUTH_02** | `UTCID18` | **Normal** | Nhập mật khẩu 9 ký tự (cận biên 10 ký tự) không bị chặn tại frontend | Thiếu kiểm tra `password.length >= 10` trước khi gửi request tới API | Thêm kiểm tra ràng buộc độ dài mật khẩu tối thiểu 10 ký tự ở tầng client service | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_AUTH_03** | `UTCID19` | **Normal** | Email trường `@fe.edu.vn` không bị chặn khi đăng ký bằng email cá nhân | Biểu thức Regex chỉ mới kiểm tra đuôi `@fpt.edu.vn`, bỏ quên tên miền `@fe.edu.vn` | Bổ sung kiểm tra cả 2 domain `@fpt.edu.vn` và `@fe.edu.vn` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_AUTH_04** | `UTCID07` | **Major** | Mật khẩu mới và mật khẩu xác nhận không khớp nhưng hàm vẫn gửi request lên server | Thiếu logic so sánh `newPassword !== confirmPassword` trong `setupPassword` | Thêm ValidationException kiểm tra trùng khớp mật khẩu trước khi gửi request | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_AUTH_05** | `UTCID23` | **Minor** | Đặt mật khẩu mới với 9 ký tự không bị chặn ở phía client | Thiếu điều kiện kiểm tra độ dài biên tối thiểu trong hàm `setupPassword` | Bổ sung rule kiểm tra độ dài `newPassword.length >= 10` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_AUTH_06** | `UTCID28` | **Major** | Khi biến môi trường `NEXT_PUBLIC_API_URL` rỗng, đường dẫn Google login sinh ra chuỗi `undefined/oauth2/...` | Không có giá trị fallback an toàn khi biến môi trường chưa được thiết lập | Bổ sung giá trị mặc định trỏ về máy chủ Railway production | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |

---

## 📊 PHẦN 1: BẢNG THỐNG KÊ TỔNG HỢP (STATISTICS)

> Bảng này đối soát trực tiếp với sheet **Statistics** trong file Excel báo cáo kiểm thử đồ án tốt nghiệp.

| STT | Tên Hàm / Module Kiểm Thử | Đợt 1 Pass | Đợt 1 Fail | Nghiệm Thu Final | Normal (N) | Abnormal (A) | Boundary (B) | Tổng Số Ca | Ngày Hoàn Tất |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **`LoginWithGoogleOAuth`** | `22` | `6` | **`28`** | `7` | `15` | `6` | **`28`** | `06/09/2026` |
| | **TỔNG CỘNG (SUB TOTAL)** | **`22`** | **`6`** | **`28`** | **`7`** | **`15`** | **`6`** | **`28`** | — |

<br/>

### 🎯 Phân Tích Tỷ Lệ Bao Phủ & Phân Loại Ca Kiểm Thử

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  📈 Tỷ lệ kiểm thử thành công cuối cùng       : 100.00% (28/28 Passed)       │
│  🔹 Ca kiểm thử luồng chuẩn (Normal - N)      : 25.00%  (7/28 Cases)         │
│  🔸 Ca kiểm thử luồng ngoại lệ (Abnormal - A) : 53.57%  (15/28 Cases)        │
│  ▫️ Ca kiểm thử giá trị biên (Boundary - B)   : 21.43%  (6/28 Cases)         │
│  🛠️ Tổng số lỗi đã phát hiện và xử lý         : 6 Khiếu nại (100% Đã đóng)   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 PHẦN 2: CHI TIẾT TỪNG CA KIỂM THỬ (TEST CASE SPECIFICATION)

> Bảng này đối soát trực tiếp với sheet **Test Cases** trong mẫu tài liệu của FPT University, thể hiện rõ trạng thái qua Đợt 1 và kết quả nghiệm thu Đợt 2.

| ID | Module / Chức Năng | Mô Tả Ca Kiểm Thử | Dữ Liệu Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Loại | Đợt 1 (09:30) | Đợt 2 Final (15:45) | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **UTCID01** | `LoginWithGoogleOAuth` | Đăng nhập tài khoản nội bộ thành công với thông tin hợp lệ | `identifier`: `"hailhse183904@fpt.edu.vn"`<br/>`password`: `"securePassword123"` | Trả về `authenticated: true`, `user.email`, `user.role: "STUDENT"` | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `LoginWithGoogleOAuth` | Bắn lỗi Validation khi để trống tên đăng nhập | `identifier`: `""`<br/>`password`: `"securePassword123"` | Ném ngoại lệ `ValidationException: Identifier is required` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `LoginWithGoogleOAuth` | Bắn lỗi Validation khi để trống mật khẩu | `identifier`: `"hailhse183904@fpt.edu.vn"`<br/>`password`: `""` | Ném ngoại lệ `ValidationException: Password is required` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `LoginWithGoogleOAuth` | Xử lý lỗi khi Backend trả về mã `401 INVALID_CREDENTIALS` | `identifier`: `"wrong@fpt.edu.vn"`<br/>`password`: `"wrongPassword"` | Bắn lỗi `Authentication failed.` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `LoginWithGoogleOAuth` | Đăng ký tài khoản Sinh viên thành công với email cá nhân | `fullName`: `"Nguyen Van B"`<br/>`email`: `"personal.student@gmail.com"`<br/>`studentCode`: `"SE179999"`<br/>`password`: `"securePassword123"` | Trả về `registered: true`, `user.role: "STUDENT"` | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `LoginWithGoogleOAuth` | Từ chối đăng ký với email trường (Bắt buộc dùng Google) | `email`: `"student@fpt.edu.vn"`<br/>`studentCode`: `"SE170001"` | Ném lỗi `Use Google login for institutional FPT/FE accounts` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `LoginWithGoogleOAuth` | Từ chối đặt mật khẩu khi mật khẩu xác nhận không khớp | `newPassword`: `"password12345"`<br/>`confirmPassword`: `"different12345"` | Ném ngoại lệ `ValidationException: Passwords do not match` | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID08** | `LoginWithGoogleOAuth` | Khôi phục phiên đăng nhập từ cookie `SAGA_SESSION` (`/api/auth/me`) | Gọi `GET /api/auth/me` với cookie hợp lệ | Trả về `authenticated: true`, `user.fullName: "Le Hoang Hai"` | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `LoginWithGoogleOAuth` | Lấy mã CSRF token thành công từ endpoint `/api/auth/csrf` | Gọi `GET /api/auth/csrf` | Trả về token và header name `X-XSRF-TOKEN` | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `LoginWithGoogleOAuth` | Xử lý ngoại lệ khi máy chủ không phản hồi lấy CSRF token | Server timeout / Network Error | Ném lỗi `Network Error` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID11** | `LoginWithGoogleOAuth` | Xử lý ngoại lệ khi phiên cookie hết hạn hoặc trả về HTTP 401 | Gọi `GET /api/auth/me` khi chưa đăng nhập | Ném ngoại lệ `Unauthorized: Session expired` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID12** | `LoginWithGoogleOAuth` | Throw ValidationException khi identifier chỉ toàn khoảng trắng | `identifier`: `"   "` | Ném ngoại lệ `Identifier (email or username) is required` | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID13** | `LoginWithGoogleOAuth` | Xử lý lỗi khi Backend trả về mã lỗi 403 ACCOUNT_DISABLED | `identifier`: `"disabled@fpt.edu.vn"` | Ném ngoại lệ `Account has been disabled` | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID14** | `LoginWithGoogleOAuth` | Xử lý lỗi khi máy chủ gặp sự cố HTTP 500 Internal Server Error | Máy chủ Backend trả về 500 | Ném ngoại lệ `Internal Server Error` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID15** | `LoginWithGoogleOAuth` | Throw ValidationException khi họ và tên bị để trống | `fullName`: `"  "` | Ném ngoại lệ `Full name is required` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID16** | `LoginWithGoogleOAuth` | Throw ValidationException khi mã sinh viên bị để trống | `studentCode`: `""` | Ném ngoại lệ `Student code is required` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID17** | `LoginWithGoogleOAuth` | Đăng ký thành công với mật khẩu đạt giá trị biên tối thiểu đúng 10 ký tự | `password`: `"1234567890"` (đúng 10 ký tự) | Trả về `registered: true`, `role: "STUDENT"` | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID18** | `LoginWithGoogleOAuth` | Từ chối đăng ký với mật khẩu cận biên dưới 9 ký tự | `password`: `"123456789"` (9 ký tự) | Ném ngoại lệ `Password must be at least 10 characters` | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID19** | `LoginWithGoogleOAuth` | Từ chối đăng ký tài khoản với email tổ chức `@fe.edu.vn` | `email`: `"teacher@fe.edu.vn"` | Ném ngoại lệ `Use Google login for institutional FPT/FE accounts` | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID20** | `LoginWithGoogleOAuth` | Xử lý lỗi khi Backend trả về mã lỗi 409 EMAIL_ALREADY_EXISTS | `email`: `"existing@gmail.com"` | Ném ngoại lệ `Email already exists in system` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID21** | `LoginWithGoogleOAuth` | Thiết lập mật khẩu mới thành công khi thông tin hợp lệ | `newPassword`: `"validPassword123"` | Trả về `authenticated: true`, `passwordSetupRequired: false` | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID22** | `LoginWithGoogleOAuth` | Đặt mật khẩu thành công tại giá trị biên đúng 10 ký tự | `newPassword`: `"exact10len"` | Trả về `authenticated: true` | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID23** | `LoginWithGoogleOAuth` | Từ chối đặt mật khẩu tại giá trị cận biên 9 ký tự | `newPassword`: `"ninechars"` | Ném ngoại lệ `New password must be at least 10 characters` | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID24** | `LoginWithGoogleOAuth` | Xử lý lỗi khi Backend trả về mã lỗi PASSWORD_ALREADY_SET | Mật khẩu đã được thiết lập trước đó | Ném ngoại lệ `Password already set for user` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID25** | `LoginWithGoogleOAuth` | Đăng xuất thành công, gửi request POST tới `/api/auth/logout` | Gọi `AuthService.logout()` | Gửi request `POST /api/auth/logout` với body `{}` | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID26** | `LoginWithGoogleOAuth` | Xử lý lỗi ngoại lệ khi máy chủ thất bại lúc hủy phiên đăng xuất | Máy chủ trả về lỗi khi gọi `/api/auth/logout` | Ném ngoại lệ `Logout server error` | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID27** | `LoginWithGoogleOAuth` | Trả về chính xác đường dẫn Google OAuth2 OIDC từ biến môi trường | `NEXT_PUBLIC_API_URL`: `"https://custom-saga.railway.app"` | URL chứa `/oauth2/authorization/google` | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID28** | `LoginWithGoogleOAuth` | Sử dụng đường dẫn Railway production mặc định khi biến môi trường rỗng | `NEXT_PUBLIC_API_URL`: `undefined` | Trả về default Railway origin + `/oauth2/authorization/google` | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |

---

## 🔗 PHẦN 3: ĐỐI SOÁT HỢP ĐỒNG API BACKEND AUTH V1

| Endpoint BE | HTTP Method | Cơ Chế Bảo Mật | Endpoint Contract | Trạng Thái Tích Hợp |
| :--- | :---: | :--- | :--- | :---: |
| `/api/auth/csrf` | `GET` | CSRF Token Generation | Cấp phát `XSRF-TOKEN` cookie & payload | **ĐÃ HOÀN TẤT (UTCID09, UTCID10)** |
| `/api/auth/me` | `GET` | Session Cookie (`SAGA_SESSION`) | Kiểm tra phiên đăng nhập hiện tại | **ĐÃ HOÀN TẤT (UTCID08, UTCID11)** |
| `/api/auth/login` | `POST` | CSRF Header (`X-XSRF-TOKEN`) | Đăng nhập nội bộ qua Email / Username | **ĐÃ HOÀN TẤT (UTCID01-04, UTCID12-14)** |
| `/api/auth/register` | `POST` | CSRF Header (`X-XSRF-TOKEN`) | Đăng ký Sinh viên dùng email cá nhân | **ĐÃ HOÀN TẤT (UTCID05-06, UTCID15-20)** |
| `/api/auth/password/setup` | `POST` | Session + CSRF Header | Đặt mật khẩu lần đầu cho Google Login | **ĐÃ HOÀN TẤT (UTCID07, UTCID21-24)** |
| `/api/auth/logout` | `POST` | CSRF Header (`X-XSRF-TOKEN`) | Hủy phiên làm việc & xóa sạch cookie | **ĐÃ HOÀN TẤT (UTCID25, UTCID26)** |
| `/oauth2/authorization/google` | `GET` | Google OAuth2 OIDC | Khởi tạo luồng xác thực Google trường | **ĐÃ HOÀN TẤT (UTCID27, UTCID28)** |

---

> 📌 **Ghi chú**: File tài liệu này được cấu hình tự động tạo và lưu trữ tại [docs/testing/UNIT_TEST_RESULTS.md](file:///d:/Capstone/saga%20workspace/saga-fe/docs/testing/UNIT_TEST_RESULTS.md).
