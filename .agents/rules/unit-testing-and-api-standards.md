---
trigger: always_on
description: Quy chuẩn viết Unit Test, phân loại ca kiểm thử (Normal, Abnormal, Boundary), thiết kế API Service và đo lường Test Coverage cho SAGA Frontend theo chuẩn FPT Capstone.
---

# Quy Chuẩn Kiểm Thử Đơn Vị (Unit Testing) & Thiết Kế API Service

## 1. Mục Đích & Chuẩn Mực Báo Cáo (Report Standards)
Hệ thống Frontend của SAGA tuân thủ mẫu báo cáo **Unit Test Report & Decision Matrix** (chuẩn Đồ án Tốt nghiệp FPT University / FPT Software):
- Mọi hàm xử lý nghiệp vụ tính toán hoặc gọi API (API Services) **BẮT BUỘC** phải có file test tương ứng (`*.spec.ts`).
- Mỗi hàm phải được phân tích ca kiểm thử theo 3 nhóm:
  1. **`N` (Normal Case - Ca thông thường / Happy Path)**: Dữ liệu hợp lệ, API trả về `200 OK`, hàm xử lý đúng logic và trả về kết quả mong đợi.
  2. **`A` (Abnormal Case - Ca bất thường / Ngoại lệ)**: Thiếu trường bắt buộc, dữ liệu sai định dạng, API trả về `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`, hoặc Network Timeout. Bắt buộc kiểm tra việc ném ra `Exception` chính xác.
  3. **`B` (Boundary Case - Ca giá trị biên / Edge Cases)**: Giá trị 0, danh sách rỗng `[]`, tổng tỷ lệ 100%, chuỗi ký tự độ dài tối đa, phân trang ở trang đầu/trang cuối, giá trị cận trên / cận dưới.

---

## 2. Quy Ước Đặt Mã Ca Kiểm Thử (Test Case ID Convention)
Trong mỗi file test `*.spec.ts`, mô tả ca kiểm thử `it(...)` **BẮT BUỘC** phải chứa mã định danh `UTCIDxx` kèm loại ca `[N]`, `[A]`, hoặc `[B]`:

$$\text{UTCID<xx> - [<N|A|B>] <Loại ca>: <Mô tả điều kiện và kết quả mong đợi>}$$

### 📌 Ví Dụ Chuẩn:
```typescript
it("UTCID01 - [N] Normal: Tinh toan ty le co phan hop le khi tong trong so bang 100% va effort > 0", async () => { ... });
it("UTCID02 - [B] Boundary: Tinh toan hop le khi 1 tieu chi chiem tron 100% trong so", async () => { ... });
it("UTCID03 - [A] Abnormal: Throw ValidationException khi teamId bi rong", async () => { ... });
it("UTCID04 - [A] Abnormal: Throw ValidationException khi tong trong so khac 100%", async () => { ... });
it("UTCID05 - [B] Boundary: Throw ArithmeticException khi tong effort bang 0 (Division by zero)", async () => { ... });
it("UTCID06 - [A] Abnormal: Xu ly loi khi Server Backend tra ve HTTP 500", async () => { ... });
```

---

## 3. Kiến Trúc Gọi API Service (API Architecture Pattern)

Mọi lệnh gọi Backend API bên Frontend phải được trừu tượng hóa thành các **Service Classes** độc lập nằm trong thư mục `src/features/<feature>/api/`:

1. **Không gọi trực tiếp `fetch()` hoặc `axios.get()` bên trong React Components**:
   - Component chỉ gọi `useQuery` / `useMutation` (TanStack Query) hoặc gọi hàm từ `Service`.
2. **Khởi tạo Axios Client tập trung (`src/lib/axios.ts`)**:
   - Đính kèm `Authorization: Bearer <token>` tự động từ `useAuthStore`.
   - Cấu hình `timeout: 10000ms`.
   - Chuẩn hóa format lỗi trả về từ Backend.
3. **Cấu trúc mỗi Service Function**:
   - Nhận Input Interface có kiểu dữ liệu tường minh (TypeScript).
   - Kiểm tra validation đầu vào (nếu có logic ràng buộc).
   - Gọi API qua `apiClient`.
   - Trả về Promise chứa dữ liệu đã được định kiểu (`Promise<T>`).

---

## 4. Công Cụ & Lệnh Chạy Kiểm Thử (Testing Toolchain)

- **Framework**: `Vitest` (nhanh, hỗ trợ ESM & TypeScript gốc).
- **Engine đo Coverage**: `@vitest/coverage-v8`.

### 📌 Các Lệnh Thực Thi:
```bash
# Chạy toàn bộ Unit Tests 1 lần
npm run test

# Chạy test ở chế độ Watch (tự chạy lại khi sửa code)
npm run test:watch

# Chạy test và xuất Báo cáo Độ Phủ (Coverage Report)
npm run test:coverage
```

---

## 5. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)
Trước khi tạo Pull Request hoặc điền dữ liệu vào file Unit Test Report Excel:
1. **Pass Rate**: 100% các bài test phải đạt trạng thái **`Passed (P)`**, không có bài test nào bị `Failed (F)` hay bỏ qua `Untested`.
2. **Coverage Target**: Mục tiêu độ phủ tối thiểu $\ge 90\%$ (khuyến khích $100\%$) đối với các file Service trong thư mục `api/`.
3. **Tỷ lệ phân bổ ca kiểm thử**:
   - Ca Normal `N`: $\approx 20\% - 30\%$
   - Ca Abnormal `A`: $\approx 40\% - 50\%$
   - Ca Boundary `B`: $\approx 25\% - 35\%$
