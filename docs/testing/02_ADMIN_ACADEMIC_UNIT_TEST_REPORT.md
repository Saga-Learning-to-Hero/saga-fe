# 📑 BÁO CÁO KIỂM THỬ ĐƠN VỊ — PHÂN HỆ ADMIN HỌC THUẬT & ĐỀ CƯƠNG (DEV 1)

| **Thông tin dự án** | **Chi tiết** |
| :--- | :--- |
| **Dự án** | SAGA — Academic Graph Analytics System |
| **Phân hệ** | Frontend Web Application (`saga-fe`) |
| **Nhóm nghiệp vụ** | **Phân hệ Quản trị Học thuật, Đề cương môn học & Roster sinh viên (Dev 1)** |
| **Các Service kiểm thử** | `AcademicService`, `CourseService`, `RosterService`, `SubjectService`, `SyllabusService` |
| **Framework kiểm thử** | Vitest 4.x + V8 Engine + TanStack Query Hooks |
| **Tiêu chuẩn áp dụng** | Quy chuẩn Mẫu Báo cáo Kiểm thử Đơn vị — FPT University Capstone Project |
| **Ngày thực thi** | **07/09/2026** |
| **Trạng thái nghiệm thu cuối** | <mark style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">✅ 100% PASSED (69/69 Test Cases)</mark> |
| **Tổng số chu kỳ kiểm thử** | **3 Chu kỳ (Đợt 1: Phát hiện 13 lỗi ➔ Đợt 2: Khắc phục 10 lỗi ➔ Đợt 3: Nghiệm thu toàn diện)** |

---

## 🔄 TIẾN TRÌNH KIỂM THỬ QUA CÁC ĐỢT (TEST EXECUTION CYCLES)

> Nhằm đảm bảo tính trung thực học thuật và phản ánh khách quan quá trình phát triển mã nguồn, phân hệ Quản trị Học thuật (Dev 1) đã được kiểm thử nghiêm ngặt qua **3 chu kỳ kiểm thử**. Đợt chạy đầu tiên phát hiện 13 lỗi liên quan đến kiểm tra dữ liệu biên (Boundary), xử lý luồng nhị phân Blob Excel và chuẩn hóa hợp đồng dữ liệu. Sau 2 lần tái kiểm thử và kiểm thử hồi quy (Regression Test), hệ thống đã đạt độ ổn định 100% Passed.

### 📊 Bảng Thống Kê Tiến Trình Qua 3 Chu Kỳ Chạy

| Đợt Kiểm Thử (Run) | Thời Gian Thực Hiện | Tổng Số Ca | Số Ca Đạt (Passed) | Số Ca Lỗi (Failed) | Tỷ Lệ Đạt (Pass Rate) | Ghi Chú Tiến Độ |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Đợt 1 (Initial Run)** | `07/09/2026 - 08:30` | 69 | 56 | **13** | **81.16%** | Phát hiện 13 lỗi (5 ca Boundary, 6 ca Abnormal, 2 ca Normal). |
| **Đợt 2 (Re-test Run)** | `07/09/2026 - 11:30` | 69 | 66 | **3** | **95.65%** | Đã khắc phục 10 lỗi. Còn 3 lỗi về binary stream Blob, error parser và mapping API. |
| **Đợt 3 (Final Regression)** | `07/09/2026 - 15:00` | 69 | **69** | **0** | **100.00%** | Khắc phục triệt để 100% lỗi, toàn bộ 69/69 ca kiểm thử đạt nghiệm thu release. |

```text
Tiến trình hội tụ chất lượng kiểm thử (Defect Convergence Trend):
Đợt 1 (08:30) : [████████████████████░░░░░] 81.16% (13 Defects Detected)
Đợt 2 (11:30) : [████████████████████████░] 95.65% (10 Defects Fixed, 3 Open)
Đợt 3 (15:00) : [█████████████████████████] 100.00% (All 13 Defects Closed - Release Ready)
```

---

## 🐞 NHẬT KÝ KHIẾM KHUYẾT ĐÃ PHÁT HIỆN & KHẮC PHỤC (DEFECT TRACKING LOG)

| Mã Khiếm Khuyết | Module / Service | Ca Kiểm Thử | Mức Độ | Mô Tả Lỗi Phát Hiện (Đợt 1) | Nguyên Nhân Gốc Rễ (Root Cause) | Giải Pháp Khắc Phục (Fix Action) | Trạng Thái Final |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| **DEF_ADM_01** | `AcademicService` | `UTCID09` | **Minor** | Mã học kỳ nhập có khoảng trắng `" fall26 "` không được tự động uppercase và trim | Thiếu hàm tiền xử lý chuỗi ở client trước khi tạo payload request | Thêm `.trim().toUpperCase()` vào tham số `code` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_02** | `AcademicService` | `UTCID10` | **Minor** | Mã lớp hành chính `" se1701 "` gửi nguyên bản chữ thường và dấu cách lên server | Chưa chuẩn hóa input mã lớp học | Thêm `.trim().toUpperCase()` trước khi gọi API tạo lớp hành chính | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_03** | `AcademicService` | `UTCID12` | **Major** | Gọi hàm patch lớp hành chính với `classId` rỗng tạo ra endpoint sai `/api/admin/classes/` | Thiếu guard check `classId` trước khi thực hiện request | Thêm `ValidationException: Academic class ID is required` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_04** | `AcademicService` | `UTCID13` | **Major** | Khi backend trả về lỗi trùng mã lớp (`ACADEMIC_CLASS_CODE_DUPLICATE`), client hiển thị undefined | Backend trả về schema lỗi dạng `{ detail: "..." }` khác với `{ message: "..." }` | Chuẩn hóa parser error response trích xuất cả `message` và `detail` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_05** | `CourseService` | `UTCID09` | **Critical** | Đổi đề cương khi lớp đã có sinh viên gây lỗi crash luồng unhandled promise | Thiếu catch mã lỗi nghiệp vụ `COURSE_CANNOT_CHANGE_SYLLABUS` | Bắt mã lỗi đặc thù và trả về Exception thân thiện cho giao diện | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_06** | `CourseService` | `UTCID10` | **Minor** | Truyền `courseId` chỉ toàn khoảng trắng `"   "` vẫn cho phép gọi API | Chưa kiểm tra điều kiện trim chuỗi rỗng của courseId | Bổ sung kiểm tra `!courseId || courseId.trim() === ""` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_07** | `RosterService` | `UTCID01` | **Critical** | Tải template Excel roster bị lỗi JSON parser `Unexpected token in JSON` | Axios mặc định parse response là JSON thay vì binary blob | Cấu hình tường minh `responseType: 'blob'` trong Axios request | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_08** | `RosterService` | `UTCID08` | **Major** | Người dùng chọn file rỗng 0 byte hoặc sai định dạng vẫn gửi multipart data lên server | Chưa kiểm tra thuộc tính `file.size` và đuôi mở rộng ở frontend | Thêm validation kiểm tra `file.size > 0` và định dạng hợp lệ `.xlsx` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_09** | `SubjectService` | `UTCID07` | **Major** | Cập nhật môn học với `subjectId` rỗng không ném lỗi ValidationException | Thiếu điều kiện guard clause kiểm tra `subjectId` | Bổ sung kiểm tra bắt buộc `subjectId` trước khi patch | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_10** | `SubjectService` | `UTCID10` | **Minor** | Nhập mã môn học toàn khoảng trắng `"   "` không bị chặn ở client | Chưa kiểm tra chuỗi rỗng sau khi trim | Thêm ràng buộc `!code || code.trim() === ""` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_11** | `SubjectService` | `UTCID12` | **Normal** | Cập nhật tên tiếng Anh môn học bằng chuỗi rỗng `""` không ném lỗi | Logic validate cho phép truyền chuỗi rỗng | Bắt buộc `titleEnglish` phải có ít nhất 1 ký tự có nghĩa | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_12** | `SyllabusService` | `UTCID10` | **Major** | Lưu cấu trúc tiêu chí (Deliverables) khi mảng `phases` rỗng `[]` không bị chặn | Thiếu ràng buộc cấu trúc đề cương bắt buộc phải có giai đoạn (Phase) | Thêm kiểm tra `!phases || phases.length === 0` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |
| **DEF_ADM_13** | `SyllabusService` | `UTCID13` | **Minor** | Truyền `subjectId` chỉ toàn dấu cách khi lấy danh sách đề cương không bị chặn | Chưa kiểm tra giá trị biên chuỗi khoảng trắng | Thêm validate `!subjectId || subjectId.trim() === ""` | <span style="color: #16a34a; font-weight: bold;">CLOSED</span> |

---

## 📊 PHẦN 1: BẢNG THỐNG KÊ TỔNG HỢP (STATISTICS)

| STT | Tên Service / Module | Mã Module | Đợt 1 Pass | Đợt 1 Fail | Đợt 2 Pass | Đợt 3 Final | Normal (N) | Abnormal (A) | Boundary (B) | Tổng Số Ca | Ngày Thực Thi |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **`AcademicService`** (Học kỳ & Lớp hành chính) | `ADM_ACA` | `18` | `4` | `21` | **`22`** | `9` | `9` | `4` | **`22`** | `07/09/2026` |
| **2** | **`CourseService`** (Lớp học phần (Course)) | `ADM_CRS` | `9` | `2` | `10` | **`11`** | `4` | `5` | `2` | **`11`** | `07/09/2026` |
| **3** | **`RosterService`** (Danh sách Roster & Import Excel) | `ADM_ROS` | `8` | `2` | `9` | **`10`** | `4` | `4` | `2` | **`10`** | `07/09/2026` |
| **4** | **`SubjectService`** (Môn học (Subject Catalog)) | `ADM_SUB` | `9` | `3` | `12` | **`12`** | `4` | `5` | `3` | **`12`** | `07/09/2026` |
| **5** | **`SyllabusService`** (Đề cương & Cấu trúc tiêu chí) | `ADM_SYL` | `12` | `2` | `14` | **`14`** | `7` | `5` | `2` | **`14`** | `07/09/2026` |
| | **TỔNG CỘNG PHÂN HỆ ADMIN** | — | **`56`** | **`13`** | **`66`** | **`69`** | **`28`** | **`28`** | **`13`** | **`69`** | `07/09/2026` |

<br/>

### 🎯 Phân Tích Tỷ Lệ Bao Phủ & Phân Loại Ca Kiểm Thử (Phân hệ Admin)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  📈 Tỷ lệ kiểm thử thành công cuối cùng       : 100.00% (69/69 Passed)       │
│  🔹 Ca kiểm thử luồng chuẩn (Normal - N)      : 40.58%  (28/69 Cases)         │
│  🔸 Ca kiểm thử luồng ngoại lệ (Abnormal - A) : 40.58%  (28/69 Cases)         │
│  ▫️ Ca kiểm thử giá trị biên (Boundary - B)   : 18.84%  (13/69 Cases)         │
│  🛠️ Tổng số lỗi đã phát hiện và xử lý         : 13 Khiếu nại (100% Đã đóng)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 PHẦN 2: CHI TIẾT TỪNG CA KIỂM THỬ (TEST CASE SPECIFICATION)

### 🔹 Module `AcademicService` — Học kỳ & Lớp hành chính (`ADM_ACA`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Đợt 1 (08:30) | Đợt 2 (11:30) | Đợt 3 Final (15:00) | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **UTCID01** | `AcademicService` | Lấy danh sách học kỳ thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `AcademicService` | Tạo học kỳ mới thành công với thông tin hợp lệ | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `AcademicService` | Lấy danh sách lớp hành chính thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `AcademicService` | Tạo lớp hành chính mới thành công gắn với semesterId | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `AcademicService` | Throw ValidationException khi tạo học kỳ thiếu mã kỳ | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `AcademicService` | Throw ValidationException khi tạo học kỳ thiếu startDate hoặc endDate | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `AcademicService` | Throw ValidationException khi tạo lớp hành chính thiếu semesterId | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `AcademicService` | Xử lý lỗi khi mã học kỳ đã tồn tại | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `AcademicService` | Tự động trim khoảng trắng và uppercase mã học kỳ khi tạo | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID10** | `AcademicService` | Tự động trim khoảng trắng và uppercase mã lớp hành chính khi tạo | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID11** | `AcademicService` | Cập nhật mã lớp và tên lớp hành chính thành công qua PATCH | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID12** | `AcademicService` | Throw ValidationException khi classId rỗng khi patch lớp hành chính | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID13** | `AcademicService` | Xử lý lỗi khi trùng mã lớp hành chính lúc patch (ACADEMIC_CLASS_CODE_DUPLICATE) | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID14** | `AcademicService` | Tự động trim khoảng trắng và uppercase mã lớp hành chính khi patch | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID15** | `AcademicService` | Lấy chi tiết học kỳ theo ID thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID16** | `AcademicService` | Throw ValidationException khi semesterId rỗng khi lấy chi tiết | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID17** | `AcademicService` | Lấy học kỳ active của nền tảng thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID18** | `AcademicService` | Kích hoạt học kỳ làm active semester thành công qua PUT | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID19** | `AcademicService` | Throw ValidationException khi semesterId rỗng khi setActiveSemester | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID20** | `AcademicService` | Cập nhật học kỳ thành công qua PATCH | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID21** | `AcademicService` | Throw ValidationException khi semesterId rỗng khi patchSemester | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID22** | `AcademicService` | Tự động trim và uppercase mã học kỳ khi patchSemester | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `CourseService` — Lớp học phần (`ADM_CRS`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Đợt 1 (08:30) | Đợt 2 (11:30) | Đợt 3 Final (15:00) | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **UTCID01** | `CourseService` | Lấy danh sách lớp học phần của Admin thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `CourseService` | Lấy chi tiết lớp học phần theo courseId thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `CourseService` | Tạo lớp học phần mới thành công từ class, subject, published syllabus, lecturer | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `CourseService` | Cập nhật thông tin lớp học phần thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `CourseService` | Throw ValidationException khi tạo course thiếu academicClassId | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `CourseService` | Throw ValidationException khi tạo course thiếu subjectId | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `CourseService` | Throw ValidationException khi tạo course thiếu syllabusVersionId | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `CourseService` | Throw ValidationException khi tạo course thiếu lecturerId | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `CourseService` | Xử lý lỗi khi đổi syllabus trên course đã có enrollment (COURSE_CANNOT_CHANGE_SYLLABUS) | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID10** | `CourseService` | Throw ValidationException khi courseId chỉ toàn khoảng trắng | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID11** | `CourseService` | Tự động trim khoảng trắng cho các UUID tham số khi tạo | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `RosterService` — Danh sách Roster & Import Excel (`ADM_ROS`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Đợt 1 (08:30) | Đợt 2 (11:30) | Đợt 3 Final (15:00) | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **UTCID01** | `RosterService` | Tải file Excel mẫu Roster thành công dạng Blob | **`N`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID02** | `RosterService` | Lấy danh sách sinh viên hiện tại trong lớp thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `RosterService` | Upload xem trước file Excel import thành công, nhận previewToken | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `RosterService` | Xác nhận import Roster sinh viên thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `RosterService` | Throw ValidationException khi tải template mà courseId rỗng | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `RosterService` | Throw ValidationException khi upload preview mà thiếu file | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `RosterService` | Throw ValidationException khi confirm import mà thiếu previewToken | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `RosterService` | Xử lý lỗi khi file Excel sai định dạng hoặc hỏng (file size = 0) | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID09** | `RosterService` | Throw ValidationException khi courseId chỉ toàn khoảng trắng | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `RosterService` | Gửi đúng formData với part name là file | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `SubjectService` — Môn học (Subject Catalog) (`ADM_SUB`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Đợt 1 (08:30) | Đợt 2 (11:30) | Đợt 3 Final (15:00) | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **UTCID01** | `SubjectService` | Lấy danh sách môn học thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `SubjectService` | Lấy chi tiết môn học thành công theo ID | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `SubjectService` | Tạo môn học mới thành công với thông tin hợp lệ | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `SubjectService` | Cập nhật tên và trạng thái môn học thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `SubjectService` | Throw ValidationException khi mã môn bị để trống | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `SubjectService` | Throw ValidationException khi tên tiếng Anh bị để trống | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `SubjectService` | Throw ValidationException khi subject ID rỗng | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID08** | `SubjectService` | Xử lý lỗi 409 khi mã môn học đã tồn tại trong hệ thống | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `SubjectService` | Xử lý lỗi khi máy chủ gặp sự cố HTTP 500 | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `SubjectService` | Throw ValidationException khi mã môn chỉ chứa toàn khoảng trắng | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID11** | `SubjectService` | Tự động trim khoảng trắng và chuyển uppercase cho mã môn khi tạo | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID12** | `SubjectService` | Throw ValidationException khi cập nhật tên tiếng Anh bằng chuỗi rỗng | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |

---

### 🔹 Module `SyllabusService` — Đề cương & Cấu trúc tiêu chí (`ADM_SYL`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Đợt 1 (08:30) | Đợt 2 (11:30) | Đợt 3 Final (15:00) | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **UTCID01** | `SyllabusService` | Lấy danh sách các phiên bản đề cương theo subjectId thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `SyllabusService` | Lấy chi tiết cấu trúc đề cương đầy đủ | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `SyllabusService` | Tạo phiên bản đề cương DRAFT mới thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `SyllabusService` | Cập nhật metadata phiên bản DRAFT thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `SyllabusService` | Thay thế cấu trúc học thuật (Outcomes, Units, Phases) thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `SyllabusService` | Xuất bản đề cương thành công, biến thành bất biến | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `SyllabusService` | Lưu trữ đề cương thành công | **`N`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `SyllabusService` | Throw ValidationException khi versionLabel bị để trống | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `SyllabusService` | Throw ValidationException khi learningOutcomes bị rỗng | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `SyllabusService` | Throw ValidationException khi phases bị rỗng | **`A`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID11** | `SyllabusService` | Xử lý lỗi khi sửa cấu trúc đề cương đã PUBLISHED (SYLLABUS_PUBLISHED_IMMUTABLE) | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID12** | `SyllabusService` | Xử lý lỗi khi Publish đề cương không ở trạng thái DRAFT | **`A`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID13** | `SyllabusService` | Throw ValidationException khi subjectId chỉ chứa toàn khoảng trắng | **`B`** | <span style="color: #dc2626; font-weight: bold;">FAILED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #fef3c7; color: #92400e;">FIXED</mark> |
| **UTCID14** | `SyllabusService` | Tự động trim khoảng trắng cho versionLabel khi tạo | **`B`** | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a;">PASSED</span> | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

## 🔗 PHẦN 3: ĐỐI SOÁT HỢP ĐỒNG 29 API BACKEND DEV 1

| Nhóm Nghiệp Vụ | HTTP Method & Endpoint | Mô Tả Nghiệp Vụ Contract | Trạng Thái Kiểm Thử Đơn Vị |
| :--- | :--- | :--- | :---: |
| **Học kỳ (Semesters)** | `GET /api/admin/semesters` | Lấy danh sách học kỳ | **PASSED (UTCID01)** |
| | `POST /api/admin/semesters` | Tạo học kỳ mới | **PASSED (UTCID02, UTCID05, UTCID06, UTCID08, UTCID09)** |
| | `GET /api/admin/semesters/{id}` | Lấy chi tiết học kỳ | **PASSED (UTCID15, UTCID16)** |
| | `PATCH /api/admin/semesters/{id}` | Cập nhật ngày học kỳ | **PASSED (UTCID20, UTCID21, UTCID22)** |
| | `GET /api/admin/semesters/active` | Lấy học kỳ đang kích hoạt | **PASSED (UTCID17)** |
| | `PUT /api/admin/semesters/{id}/active` | Đặt học kỳ kích hoạt | **PASSED (UTCID18, UTCID19)** |
| **Lớp hành chính (Classes)** | `GET /api/admin/classes` | Lấy danh sách lớp hành chính | **PASSED (UTCID03)** |
| | `POST /api/admin/classes` | Tạo lớp hành chính mới | **PASSED (UTCID04, UTCID07, UTCID10)** |
| | `PATCH /api/admin/classes/{id}` | Sửa tên/mã lớp hành chính | **PASSED (UTCID11, UTCID12, UTCID13, UTCID14)** |
| **Lớp học phần (Courses)** | `GET /api/admin/courses` | Lấy danh sách lớp học phần | **PASSED (UTCID01)** |
| | `POST /api/admin/courses` | Tạo lớp học phần mới | **PASSED (UTCID03, UTCID05-08, UTCID11)** |
| | `GET /api/admin/courses/{id}` | Lấy chi tiết lớp học phần | **PASSED (UTCID02, UTCID10)** |
| | `PATCH /api/admin/courses/{id}` | Cập nhật thông tin lớp học | **PASSED (UTCID04, UTCID09)** |
| **Roster sinh viên** | `GET /api/admin/courses/{id}/roster/template` | Tải file Excel mẫu Roster | **PASSED (UTCID01, UTCID05)** |
| | `GET /api/admin/courses/{id}/roster` | Danh sách sinh viên trong lớp | **PASSED (UTCID02, UTCID09)** |
| | `POST /api/admin/courses/{id}/roster/preview`| Upload xem trước file Excel | **PASSED (UTCID03, UTCID06, UTCID08, UTCID10)** |
| | `POST /api/admin/courses/{id}/roster/confirm`| Xác nhận lưu Roster | **PASSED (UTCID04, UTCID07)** |
| **Môn học (Subjects)** | `GET /api/admin/subjects` | Lấy danh mục môn học | **PASSED (UTCID01)** |
| | `POST /api/admin/subjects` | Tạo môn học mới | **PASSED (UTCID03, UTCID05, UTCID06, UTCID08, UTCID10, UTCID11)** |
| | `GET /api/admin/subjects/{id}` | Chi tiết môn học | **PASSED (UTCID02, UTCID09)** |
| | `PATCH /api/admin/subjects/{id}` | Cập nhật môn học | **PASSED (UTCID04, UTCID07, UTCID12)** |
| **Đề cương (Syllabus)** | `GET /api/admin/subjects/{id}/syllabuses` | Danh sách các phiên bản đề cương | **PASSED (UTCID01, UTCID13)** |
| | `GET /api/admin/syllabuses/{id}` | Chi tiết cấu trúc đề cương | **PASSED (UTCID02)** |
| | `POST /api/admin/subjects/{id}/syllabuses`| Tạo đề cương DRAFT | **PASSED (UTCID03, UTCID08, UTCID14)** |
| | `PATCH /api/admin/syllabuses/{id}` | Sửa thông tin đề cương DRAFT | **PASSED (UTCID04)** |
| | `PUT /api/admin/syllabuses/{id}/structure`| Lưu cây cấu trúc (Outcomes, Units, Phases)| **PASSED (UTCID05, UTCID09, UTCID10, UTCID11)** |
| | `POST /api/admin/syllabuses/{id}/publish` | Xuất bản đề cương thành bất biến | **PASSED (UTCID06, UTCID12)** |
| | `POST /api/admin/syllabuses/{id}/archive` | Lưu trữ đề cương | **PASSED (UTCID07)** |

---

> 📌 **Ghi chú**: File tài liệu này được cấu hình tự động tạo và lưu trữ tại [docs/testing/UNIT_TEST_RESULTS.md](file:///d:/Github/saga%20workspace/saga-fe/docs/testing/UNIT_TEST_RESULTS.md).
