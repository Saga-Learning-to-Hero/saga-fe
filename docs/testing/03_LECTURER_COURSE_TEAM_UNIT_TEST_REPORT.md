# 📑 BÁO CÁO KIỂM THỬ ĐƠN VỊ — PHÂN HỆ GIẢNG VIÊN, TỔ CHỨC NHÓM & NHÓM SINH VIÊN (DEV 2)

| **Thông tin dự án** | **Chi tiết** |
| :--- | :--- |
| **Dự án** | SAGA — Academic Graph Analytics System |
| **Phân hệ** | Frontend Web Application (`saga-fe`) |
| **Nhóm nghiệp vụ** | **Phân hệ Giảng viên, Roster ACTIVE, Import nhóm Excel & Nhóm sinh viên (Dev 2 — Part E, Part F, G1)** |
| **Các Service kiểm thử** | `LecturerCourseService`, `LecturerTeamService`, `StudentCourseService` |
| **Nhánh Git** | `feat/SAGA-52-lecturer-course-and-team-management` |
| **Framework kiểm thử** | Vitest 4.1.11 + V8 Coverage + helper `fptTest` (`UTCID` + `[N]`/`[A]`/`[B]`) |
| **Tiêu chuẩn áp dụng** | Quy chuẩn Mẫu Báo cáo Kiểm thử Đơn vị — FPT University Capstone Project |
| **Ngày thực thi** | **08/09/2026** |
| **Lệnh thực thi** | `npx vitest run src/features/lecturer/courses/api/lecturer-course-service.spec.ts src/features/lecturer/teams/api/lecturer-team-service.spec.ts src/features/student/courses/api/student-course-service.spec.ts --reporter=verbose` |
| **Thời lượng** | **1.86s** (bắt đầu `15:47:38`) |
| **Trạng thái nghiệm thu** | <mark style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">✅ 100% PASSED (37/37 Test Cases)</mark> |

---

## 🔄 NHẬT KÝ THỰC THI (TEST EXECUTION LOG)

> Báo cáo này ghi nhận **kết quả chạy thật** trên máy phát triển ngày `08/09/2026`. Toàn bộ 37 ca đã được khai báo sẵn trong `*.spec.ts` (metadata `executedDate: 07/09/2026`) và chạy hồi quy thành công 100%. Không có ca Failed, không có ca skipped.

### 📊 Bảng Kết Quả Chạy Nghiệm Thu

| Đợt Kiểm Thử (Run) | Thời Gian Thực Hiện | Tổng Số Ca | Số Ca Đạt (Passed) | Số Ca Lỗi (Failed) | Tỷ Lệ Đạt (Pass Rate) | Ghi Chú |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Đợt nghiệm thu Dev 2** | `08/09/2026 - 15:47` | 37 | **37** | **0** | **100.00%** | 3 file spec, 0 lỗi, Vitest 4.1.11 + jsdom |

```text
Kết quả chạy Vitest (verbose):
Test Files  3 passed (3)
     Tests  37 passed (37)
  Duration  1.86s

LecturerCourseService  : 10/10 PASSED
LecturerTeamService    : 18/18 PASSED
StudentCourseService   :  9/9  PASSED
```

---

## 📊 PHẦN 1: BẢNG THỐNG KÊ TỔNG HỢP (STATISTICS)

> Bảng này đối soát trực tiếp với output `FPTUnitTestReporter` (`src/testing/fpt-reporter.ts`) và sheet **Statistics** trong mẫu báo cáo FPT.

| STT | Tên Service / Module | Mã Module | Passed | Failed | Normal (N) | Abnormal (A) | Boundary (B) | Tổng Số Ca | Ngày Thực Thi |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **`LecturerCourseService`** (Lớp giảng viên & Roster ACTIVE) | `LEC_CRS` | **`10`** | `0` | `3` | `4` | `3` | **`10`** | `08/09/2026` |
| **2** | **`LecturerTeamService`** (Template, Preview, Confirm nhóm Excel) | `LEC_TEAM` | **`18`** | `0` | `4` | `10` | `4` | **`18`** | `08/09/2026` |
| **3** | **`StudentCourseService`** (Môn ACTIVE & nhóm của tôi `/team`) | `STU_CRS` | **`9`** | `0` | `2` | `4` | `3` | **`9`** | `08/09/2026` |
| | **TỔNG CỘNG PHÂN HỆ DEV 2** | — | **`37`** | **`0`** | **`9`** | **`18`** | **`10`** | **`37`** | `08/09/2026` |

<br/>

### 🎯 Phân Tích Tỷ Lệ Bao Phủ & Phân Loại Ca Kiểm Thử (Dev 2)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  📈 Tỷ lệ kiểm thử thành công                 : 100.00% (37/37 Passed)       │
│  🔹 Ca kiểm thử luồng chuẩn (Normal - N)      : 24.32%  (9/37 Cases)         │
│  🔸 Ca kiểm thử luồng ngoại lệ (Abnormal - A) : 48.65%  (18/37 Cases)        │
│  ▫️ Ca kiểm thử giá trị biên (Boundary - B)   : 27.03%  (10/37 Cases)        │
└──────────────────────────────────────────────────────────────────────────────┘
```

Đối chiếu mục tiêu FPT (`N` 20–30%, `A` 40–50%, `B` 25–35%): **đạt**.

### 📐 Độ Phủ Mã Nguồn Service (V8, chỉ 3 file Dev 2)

| File Service | % Statements | % Branch | % Functions | % Lines | Ghi chú |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `lecturer-course-service.ts` | **100** | 41.66 | **100** | **100** | Nhánh fallback roster (`data?.entries`) chưa bị kích hoạt hết |
| `lecturer-team-service.ts` | **86.36** | 57.14 | 80 | **86.36** | Nhánh `headers.delete("Content-Type")` trong `transformRequest` (dòng 35–38) không được V8 ghi nhận khi mock Axios |
| `student-course-service.ts` | **100** | 50 | **100** | **100** | Nhánh payload không phải mảng đã được `getCourses()` bảo vệ |

---

## 📋 PHẦN 2: CHI TIẾT TỪNG CA KIỂM THỬ (TEST CASE SPECIFICATION)

### 🔹 Module `LecturerCourseService` — Lớp giảng viên & Roster ACTIVE (`LEC_CRS`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `08/09/2026 15:47` | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `LecturerCourseService` | `GET /api/lecturer/courses` trả đúng `CourseResponse`, trường `id` dùng làm `courseId` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `LecturerCourseService` | `GET /api/lecturer/courses/{courseId}` lấy chi tiết lớp thành công | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `LecturerCourseService` | `GET .../roster` trả đúng `entries`, `courseEnrollmentId`, `studentProfileId`, `enrolledCount` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `LecturerCourseService` | Không nuốt lỗi `401 INVALID_CREDENTIALS` khi lấy danh sách lớp | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `LecturerCourseService` | Không nuốt lỗi `403 LECTURER_COURSE_FORBIDDEN` khi đọc chi tiết lớp | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `LecturerCourseService` | Không nuốt lỗi `404 COURSE_NOT_FOUND` khi đọc roster | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `LecturerCourseService` | Throw `ValidationException` khi `courseId` rỗng lúc lấy chi tiết lớp | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `LecturerCourseService` | Danh sách lớp rỗng `200 []` hợp lệ khi giảng viên chưa được phân công | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `LecturerCourseService` | Roster rỗng vẫn hợp lệ, `enrolledCount = 0` | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `LecturerCourseService` | Throw `ValidationException` khi `courseId` chỉ toàn khoảng trắng | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `LecturerTeamService` — Import nhóm Excel (`LEC_TEAM`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `08/09/2026 15:47` | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `LecturerTeamService` | `GET .../teams/template` trả về `Blob`, `responseType: "blob"` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `LecturerTeamService` | Preview import gửi `FormData` đúng key `file` và nhận `previewToken` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `LecturerTeamService` | Confirm import gửi JSON `{ previewToken }` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `LecturerTeamService` | `GET .../teams` thành công, `projectId === null` vẫn hợp lệ | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `LecturerTeamService` | Không nuốt lỗi `401 INVALID_CREDENTIALS` khi tải template | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `LecturerTeamService` | Không nuốt lỗi `403 LECTURER_COURSE_FORBIDDEN` khi preview | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `LecturerTeamService` | Không nuốt lỗi `404 COURSE_NOT_FOUND` khi lấy danh sách team | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `LecturerTeamService` | Không nuốt lỗi `TEAM_FILE_INVALID` khi file Excel không hợp lệ | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `LecturerTeamService` | Không nuốt lỗi `TEAM_FILE_TOO_LARGE` khi file vượt 2MB | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `LecturerTeamService` | Không nuốt lỗi `TEAM_PREVIEW_EXPIRED` khi token hết hạn | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID11** | `LecturerTeamService` | Không nuốt lỗi `TEAM_PREVIEW_MISMATCH` khi token sai course/user | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID12** | `LecturerTeamService` | Không nuốt lỗi `TEAM_CONFIRM_BLOCKED` khi preview còn lỗi chặn | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID13** | `LecturerTeamService` | Throw `ValidationException` khi confirm thiếu `previewToken` | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID14** | `LecturerTeamService` | Throw `ValidationException` khi preview thiếu file | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID15** | `LecturerTeamService` | Danh sách team rỗng `[]` vẫn hợp lệ | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID16** | `LecturerTeamService` | Preview toàn bộ `ALREADY_ASSIGNED` vẫn hợp lệ và **không** chặn confirm | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID17** | `LecturerTeamService` | `canConfirmTeamImport()` trả `false` khi `hasBlockingErrors = true` | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID18** | `LecturerTeamService` | Throw `ValidationException` khi `courseId` rỗng trước khi gọi API team | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `StudentCourseService` — Môn ACTIVE & nhóm của tôi (`STU_CRS`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `08/09/2026 15:47` | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `StudentCourseService` | `GET /api/student/courses` lấy course ACTIVE, **không** gửi `userId` hay filter | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `StudentCourseService` | `GET /api/student/courses/{courseId}/team` trả đúng `team`, `myRole`, `members` (không có `email`) | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `StudentCourseService` | Không nuốt lỗi `401 INVALID_CREDENTIALS` khi lấy danh sách course | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `StudentCourseService` | Không nuốt lỗi `403 STUDENT_COURSE_FORBIDDEN` khi xem team | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `StudentCourseService` | Không nuốt lỗi `404 TEAM_NOT_FOUND`; `isTeamNotFound()` trả `true` | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `StudentCourseService` | Throw `ValidationException` khi `courseId` rỗng lúc xem team | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `StudentCourseService` | Danh sách course rỗng `200 []` hợp lệ khi không có enrollment ACTIVE | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `StudentCourseService` | Throw `ValidationException` khi `courseId` chỉ toàn khoảng trắng | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `StudentCourseService` | **Không** gọi `/my-team`; chỉ dùng `GET .../team` theo contract backend | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

## 🔗 PHẦN 3: ĐỐI SOÁT HỢP ĐỒNG API BACKEND DEV 2

> Endpoint nhóm sinh viên **bắt buộc** là `GET /api/student/courses/{courseId}/team`. Ca **UTCID09** khóa không gọi `/my-team`.

| Nhóm Nghiệp Vụ | HTTP Method & Endpoint | Mô Tả Nghiệp Vụ Contract | Trạng Thái Kiểm Thử Đơn Vị |
| :--- | :--- | :--- | :---: |
| **Lớp giảng viên (Part E1–E3)** | `GET /api/lecturer/courses` | Danh sách lớp giảng viên được phân công | **PASSED (`LEC_CRS` UTCID01, UTCID04, UTCID08)** |
| | `GET /api/lecturer/courses/{courseId}` | Chi tiết lớp học phần | **PASSED (`LEC_CRS` UTCID02, UTCID05, UTCID07)** |
| | `GET /api/lecturer/courses/{courseId}/roster` | Roster sinh viên ACTIVE | **PASSED (`LEC_CRS` UTCID03, UTCID06, UTCID09, UTCID10)** |
| **Tổ chức nhóm Excel (Part E4–E7)** | `GET /api/lecturer/courses/{courseId}/teams/template` | Tải file mẫu chia nhóm (Blob) | **PASSED (`LEC_TEAM` UTCID01, UTCID05)** |
| | `POST /api/lecturer/courses/{courseId}/teams/import/preview` | Upload xem trước, nhận `previewToken` | **PASSED (`LEC_TEAM` UTCID02, UTCID06, UTCID08, UTCID09, UTCID14, UTCID16)** |
| | `POST /api/lecturer/courses/{courseId}/teams/import/confirm` | Xác nhận tạo nhóm, body `{ previewToken }` | **PASSED (`LEC_TEAM` UTCID03, UTCID10–UTCID13)** |
| | `GET /api/lecturer/courses/{courseId}/teams` | Danh sách nhóm, `teamId`, `projectId` có thể `null` | **PASSED (`LEC_TEAM` UTCID04, UTCID07, UTCID15, UTCID18)** |
| **Confirm bị chặn (client)** | `canConfirmTeamImport(preview)` | Disable confirm khi `hasBlockingErrors === true` | **PASSED (`LEC_TEAM` UTCID17)** |
| **Sinh viên môn & nhóm (Part F, G1)** | `GET /api/student/courses` | Môn ACTIVE theo session, không gửi `userId` | **PASSED (`STU_CRS` UTCID01, UTCID03, UTCID07)** |
| | `GET /api/student/courses/{courseId}/team` | Nhóm của tôi: `myRole`, `members` | **PASSED (`STU_CRS` UTCID02, UTCID04–UTCID06, UTCID08, UTCID09)** |

---

## 🏆 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

1. **Pass Rate**: Đạt **100% Passed (37/37)** trên lần chạy `08/09/2026 15:47`.
2. **Phân bổ ca kiểm thử chuẩn FPT**:
   - Ca Normal (`N`): **24.32%** (mục tiêu 20–30%)
   - Ca Abnormal (`A`): **48.65%** (mục tiêu 40–50%)
   - Ca Boundary (`B`): **27.03%** (mục tiêu 25–35%)
3. **Hợp đồng ID**: Các ca dùng `courseId` demo `2bf1c497-71d4-43f2-a683-b74b7ad74327`; không hoán đổi với `teamId` / `projectId`.
4. **Hợp đồng team sinh viên**: `GET .../team`, không `/my-team`. `404 TEAM_NOT_FOUND` là trạng thái chờ phân nhóm, không phải lỗi hệ thống.
5. **Độ phủ statement** hai service `LecturerCourseService` và `StudentCourseService` đạt 100%. `LecturerTeamService` đạt 86.36% statement vì nhánh xóa `Content-Type` trên `FormData` chạy trong Axios interceptor thật, không kích hoạt khi mock `apiClient.post`.

---

> 📌 **File spec nguồn**:
> - `src/features/lecturer/courses/api/lecturer-course-service.spec.ts`
> - `src/features/lecturer/teams/api/lecturer-team-service.spec.ts`
> - `src/features/student/courses/api/student-course-service.spec.ts`
>
> Dashboard tổng hợp: [UNIT_TEST_RESULTS.md](UNIT_TEST_RESULTS.md)
