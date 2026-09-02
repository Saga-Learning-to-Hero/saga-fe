# 📑 BÁO CÁO KẾT QUẢ KIỂM THỬ ĐƠN VỊ (UNIT TEST REPORT)

| **Thông tin dự án** | **Chi tiết** |
| :--- | :--- |
| **Dự án** | SAGA — Academic Graph Analytics System |
| **Phân hệ** | Frontend Web Application (`saga-fe`) |
| **Module kiểm thử** | **Authentication & Google OIDC (`LOG_OAU`)** |
| **Framework kiểm thử** | Vitest 4.x + V8 Engine + TanStack Query Hooks |
| **Tiêu chuẩn áp dụng** | Quy chuẩn Mẫu Báo cáo Kiểm thử Đơn vị — FPT University Capstone Project |
| **Trạng thái tổng thể** | <mark style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">✅ 100% PASSED (8/8 Test Cases)</mark> |

---

## 📊 PHẦN 1: BẢNG THỐNG KÊ TỔNG HỢP (STATISTICS)

> Bảng này đối soát trực tiếp với sheet **Statistics** trong file Excel báo cáo kiểm thử.

| STT | Tên Hàm / Module Kiểm Thử | Passed | Failed | Normal (N) | Abnormal (A) | Boundary (B) | Tổng Số Ca | Ngày Thực Thi |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **`LoginWithGoogleOAuth`** | `8` | `0` | `3` | `5` | `0` | **`8`** | `10/08/2026` |
| | **TỔNG CỘNG (SUB TOTAL)** | **`8`** | **`0`** | **`3`** | **`5`** | **`0`** | **`8`** | — |

<br/>

### 🎯 Phân Tích Tỷ Lệ Bao Phủ & Phân Loại Ca Kiểm Thử

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  📈 Tỷ lệ kiểm thử thành công (Success Rate)  : 100.00% (8/8 Passed)         │
│  🔹 Ca kiểm thử luồng chuẩn (Normal - N)      : 37.50%  (3/8 Cases)          │
│  🔸 Ca kiểm thử luồng ngoại lệ (Abnormal - A) : 62.50%  (5/8 Cases)          │
│  ▫️ Ca kiểm thử giá trị biên (Boundary - B)   : 0.00%   (0/8 Cases)          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 PHẦN 2: CHI TIẾT TỪNG CA KIỂM THỬ (TEST CASE SPECIFICATION)

> Bảng này đối soát trực tiếp với sheet **Test Cases** trong mẫu tài liệu của FPT.

| ID | Module / Chức Năng | Mô Tả Ca Kiểm Thử | Dữ Liệu Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Loại | Ngày Chạy | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `LoginWithGoogleOAuth` | Đăng nhập tài khoản nội bộ thành công với thông tin hợp lệ | `identifier`: `"hailhse183904@fpt.edu.vn"`<br/>`password`: `"securePassword123"` | Trả về `authenticated: true`, `user.email`, `user.role: "STUDENT"` | Đăng nhập thành công, nhận đúng User payload | **`N`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |
| **UTCID02** | `LoginWithGoogleOAuth` | Bắn lỗi Validation khi để trống tên đăng nhập | `identifier`: `""`<br/>`password`: `"securePassword123"` | Ném ngoại lệ `ValidationException: Identifier is required` | Ném lỗi `Identifier is required` chính xác | **`A`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |
| **UTCID03** | `LoginWithGoogleOAuth` | Bắn lỗi Validation khi để trống mật khẩu | `identifier`: `"hailhse183904@fpt.edu.vn"`<br/>`password`: `""` | Ném ngoại lệ `ValidationException: Password is required` | Ném lỗi `Password is required` chính xác | **`A`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |
| **UTCID04** | `LoginWithGoogleOAuth` | Xử lý lỗi khi Backend trả về mã `401 INVALID_CREDENTIALS` | `identifier`: `"wrong@fpt.edu.vn"`<br/>`password`: `"wrongPassword"` | Bắn lỗi `Authentication failed.` | Nhận mã 401 và hiển thị đúng thông báo lỗi | **`A`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |
| **UTCID05** | `LoginWithGoogleOAuth` | Đăng ký tài khoản Sinh viên thành công với email cá nhân | `fullName`: `"Nguyen Van B"`<br/>`email`: `"personal.student@gmail.com"`<br/>`studentCode`: `"SE179999"`<br/>`password`: `"securePassword123"` | Trả về `registered: true`, `user.role: "STUDENT"` | Đăng ký thành công tài khoản Sinh viên | **`N`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |
| **UTCID06** | `LoginWithGoogleOAuth` | Từ chối đăng ký với email trường (Bắt buộc dùng Google) | `email`: `"student@fpt.edu.vn"`<br/>`studentCode`: `"SE170001"` | Ném lỗi `Use Google login for institutional FPT/FE accounts` | Chặn đăng ký và yêu cầu dùng Google Login | **`A`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |
| **UTCID07** | `LoginWithGoogleOAuth` | Từ chối đặt mật khẩu khi mật khẩu xác nhận không khớp | `newPassword`: `"password12345"`<br/>`confirmPassword`: `"different12345"` | Ném ngoại lệ `ValidationException: Passwords do not match` | Ném lỗi xác nhận mật khẩu không khớp | **`A`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |
| **UTCID08** | `LoginWithGoogleOAuth` | Khôi phục phiên đăng nhập từ cookie `SAGA_SESSION` (`/api/auth/me`) | Gọi `GET /api/auth/me` với cookie hợp lệ | Trả về `authenticated: true`, `user.fullName: "Le Hoang Hai"` | Khôi phục thành công phiên đăng nhập thực | **`N`** | 10/08/2026 | <span style="color: #16a34a; font-weight: bold;">PASSED</span> |

---

## 🔗 PHẦN 3: ĐỐI SOÁT HỢP ĐỒNG API BACKEND AUTH V1

| Endpoint BE | HTTP Method | Cơ Chế Bảo Mật | Endpoint Contract | Trạng Thái Tích Hợp |
| :--- | :---: | :--- | :--- | :---: |
| `/api/auth/csrf` | `GET` | CSRF Token Generation | Cấp phát `XSRF-TOKEN` cookie & payload | **ĐÃ HOÀN TẤT** |
| `/api/auth/me` | `GET` | Session Cookie (`SAGA_SESSION`) | Kiểm tra phiên đăng nhập hiện tại | **ĐÃ HOÀN TẤT** |
| `/api/auth/login` | `POST` | CSRF Header (`X-XSRF-TOKEN`) | Đăng nhập nội bộ qua Email / Username | **ĐÃ HOÀN TẤT** |
| `/api/auth/register` | `POST` | CSRF Header (`X-XSRF-TOKEN`) | Đăng ký Sinh viên dùng email cá nhân | **ĐÃ HOÀN TẤT** |
| `/api/auth/password/setup` | `POST` | Session + CSRF Header | Đặt mật khẩu lần đầu cho Google Login | **ĐÃ HOÀN TẤT** |
| `/api/auth/logout` | `POST` | CSRF Header (`X-XSRF-TOKEN`) | Hủy phiên làm việc & xóa sạch cookie | **ĐÃ HOÀN TẤT** |
| `/oauth2/authorization/google` | `GET` | Google OAuth2 OIDC | Khởi tạo luồng xác thực Google trường | **ĐÃ HOÀN TẤT** |

---

> 📌 **Ghi chú**: File tài liệu này được cấu hình tự động tạo và lưu trữ tại [docs/testing/UNIT_TEST_RESULTS.md](file:///d:/Github/saga%20workspace/saga-fe/docs/testing/UNIT_TEST_RESULTS.md).
