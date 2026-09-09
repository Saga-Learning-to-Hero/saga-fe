# 📑 BÁO CÁO KIỂM THỬ ĐƠN VỊ — PHÂN HỆ GIẢNG VIÊN, TỔ CHỨC NHÓM, TRỌNG SỐ & ĐÁNH GIÁ ĐÓNG GÓP (DEV 2)

| **Thông tin dự án** | **Chi tiết** |
| :--- | :--- |
| **Dự án** | SAGA — Academic Graph Analytics System |
| **Phân hệ** | Frontend Web Application (`saga-fe`) |
| **Nhóm nghiệp vụ** | **Dev 2 — Part E, F, G1 + DEC-002 (trọng số lát cắt, trọng số nhóm, đánh giá đóng góp)** |
| **Các Service / module kiểm thử** | `LecturerCourseService`, `LecturerTeamService`, `StudentCourseService`, `LecturerWeightsService`, `ProjectWeightsService`, `TeamContributionService`, `contribution-utils` |
| **Nhánh Git** | `feat/SAGA-52-lecturer-course-and-team-management` |
| **Framework kiểm thử** | Vitest 4.1.11 + V8 Coverage + helper `fptTest` (`UTCID` + `[N]`/`[A]`/`[B]`) |
| **Tiêu chuẩn áp dụng** | Quy chuẩn Mẫu Báo cáo Kiểm thử Đơn vị — FPT University Capstone Project |
| **Ngày thực thi gần nhất** | **10/09/2026** |
| **Lệnh thực thi** | `npx vitest run src/features/lecturer/courses src/features/lecturer/teams src/features/lecturer/contribution src/features/student/courses` |
| **Thời lượng** | **2.58s** (bắt đầu `00:16:41`) |
| **Trạng thái nghiệm thu** | <mark style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">✅ 100% PASSED (92/92 Test Cases)</mark> |

---

## 🔄 NHẬT KÝ THỰC THI (TEST EXECUTION LOG)

> Báo cáo này ghi nhận **kết quả chạy thật** trên máy phát triển. So với bản `09/09/2026 02:45` (40 ca / 3 file spec), lần này gồm thêm 10 ca điều phối nhóm (`UTCID22`–`UTCID31`) và 42 ca trọng số / đánh giá đóng góp (4 file spec mới).

### 📊 Bảng Kết Quả Chạy Nghiệm Thu

| Đợt Kiểm Thử (Run) | Thời Gian Thực Hiện | Tổng Số Ca | Số Ca Đạt (Passed) | Số Ca Lỗi (Failed) | Tỷ Lệ Đạt (Pass Rate) | Ghi Chú |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Đợt nghiệm thu trước** | `09/09/2026 - 02:45` | 40 | **40** | **0** | **100.00%** | 3 file spec (course / team import / student team) |
| **Regression Task 4 + điều phối nhóm** | `10/09/2026 - 00:16` | 92 | **92** | **0** | **100.00%** | 7 file spec, Vitest 4.1.11 + jsdom |

```text
Kết quả chạy Vitest:
Test Files  7 passed (7)
     Tests  92 passed (92)
  Duration  2.58s

LecturerCourseService  : 10/10 PASSED
LecturerTeamService    : 31/31 PASSED
StudentCourseService   :  9/9  PASSED
LecturerWeightsService : 12/12 PASSED
ProjectWeightsService  : 10/10 PASSED
TeamContributionService: 12/12 PASSED
contribution-utils     :  8/8  PASSED
```

---

## 📊 PHẦN 1: BẢNG THỐNG KÊ TỔNG HỢP (STATISTICS)

> Bảng này đối soát trực tiếp với output `FPTUnitTestReporter` (`src/testing/fpt-reporter.ts`) và sheet **Statistics** trong mẫu báo cáo FPT.

| STT | Tên Service / Module | Mã Module | Passed | Failed | Normal (N) | Abnormal (A) | Boundary (B) | Tổng Số Ca | Ngày Thực Thi |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **`LecturerCourseService`** (Lớp giảng viên & Roster ACTIVE) | `LEC_CRS` | **`10`** | `0` | `3` | `4` | `3` | **`10`** | `07/09/2026` |
| **2** | **`LecturerTeamService`** (Template, Preview, Confirm, đổi Leader, chuyển thành viên) | `LEC_TEAM` | **`31`** | `0` | `7` | `14` | `10` | **`31`** | `07/09–10/09/2026` |
| **3** | **`StudentCourseService`** (Môn ACTIVE & nhóm của tôi `/team`) | `STU_CRS` | **`9`** | `0` | `2` | `4` | `3` | **`9`** | `07/09/2026` |
| **4** | **`LecturerWeightsService`** (Trọng số lát cắt lớp & mode COURSE / PROJECT_GROUP) | `LEC_WGT` | **`12`** | `0` | `4` | `5` | `3` | **`12`** | `09/09/2026` |
| **5** | **`ProjectWeightsService`** (GET/PUT trọng số dự án nhóm) | `PRJ_WGT` | **`10`** | `0` | `2` | `5` | `3` | **`10`** | `09/09/2026` |
| **6** | **`TeamContributionService`** (Đánh giá đóng góp & override) | `TEAM_CTR` | **`12`** | `0` | `2` | `7` | `3` | **`12`** | `09/09/2026` |
| **7** | **`contribution-utils`** (Quy đổi thang 0–1 / 0–100% và cổng PUT group-weights) | `CTR_UTIL` | **`8`** | `0` | `3` | `2` | `3` | **`8`** | `09/09/2026` |
| | **TỔNG CỘNG PHÂN HỆ DEV 2** | — | **`92`** | `0` | **`23`** | **`41`** | **`28`** | **`92`** | `10/09/2026` |

<br/>

### 🎯 Phân Tích Tỷ Lệ Bao Phủ & Phân Loại Ca Kiểm Thử (Dev 2)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  📈 Tỷ lệ kiểm thử thành công                 : 100.00% (92/92 Passed)       │
│  🔹 Ca kiểm thử luồng chuẩn (Normal - N)      : 25.00%  (23/92 Cases)        │
│  🔸 Ca kiểm thử luồng ngoại lệ (Abnormal - A) : 44.57%  (41/92 Cases)        │
│  ▫️ Ca kiểm thử giá trị biên (Boundary - B)   : 30.43%  (28/92 Cases)        │
└──────────────────────────────────────────────────────────────────────────────┘
```

Đối chiếu mục tiêu FPT (`N` 20–30%, `A` 40–50%, `B` 25–35%): **đạt**.

---

## 📋 PHẦN 2: CHI TIẾT TỪNG CA KIỂM THỬ (TEST CASE SPECIFICATION)

### 🔹 Module `LecturerCourseService` — Lớp giảng viên & Roster ACTIVE (`LEC_CRS`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `10/09/2026 00:16` | Trạng Thái |
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

### 🔹 Module `LecturerTeamService` — Import nhóm Excel & điều phối nhóm (`LEC_TEAM`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `10/09/2026 00:16` | Trạng Thái |
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
| **UTCID19** | `LecturerTeamService` | `transformRequest` xóa `Content-Type` cho `FormData` và giữ nguyên payload khác | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID20** | `LecturerTeamService` | Payload thiếu mảng `teams` được chuẩn hóa thành `[]` | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID21** | `LecturerTeamService` | Adapter role và tổng hợp team không bịa tên dự án | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID22** | `LecturerTeamService` | `PUT .../teams/{teamId}/leader` gửi đúng `courseId`, `teamId` và body `{ teamMemberId }` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID23** | `LecturerTeamService` | `PATCH .../team-members/{teamMemberId}/team` chỉ gửi `{ targetTeamId }` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID24** | `LecturerTeamService` | Không nuốt lỗi `401` khi đổi trưởng nhóm | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID25** | `LecturerTeamService` | Không nuốt lỗi `403` khi chuyển thành viên | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID26** | `LecturerTeamService` | Không nuốt lỗi `404 TEAM_NOT_FOUND` khi đổi trưởng nhóm | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID27** | `LecturerTeamService` | Không nuốt lỗi khi backend từ chối chuyển thành viên không hợp lệ | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID28** | `LecturerTeamService` | Throw `ValidationException` khi `teamMemberId` rỗng lúc đổi trưởng nhóm | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID29** | `LecturerTeamService` | Throw `ValidationException` khi `courseId` hoặc `teamId` rỗng lúc đổi trưởng nhóm | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID30** | `LecturerTeamService` | Throw `ValidationException` khi `targetTeamId` rỗng lúc chuyển thành viên | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID31** | `LecturerTeamService` | `GET teams` giữ `teamMemberId` thật, không thay bằng `studentProfileId` | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `StudentCourseService` — Môn ACTIVE & nhóm của tôi (`STU_CRS`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `10/09/2026 00:16` | Trạng Thái |
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

> **Ghi nhận (không sửa trong đợt này):** `GET /api/student/courses/{courseId}/team` còn được gọi lần nữa bởi `StudentProjectService.getStudentTeam` (`src/features/student/project/api/student-project-service.ts`, hook `useStudentProject` — khu vực Dev 3). File `student-project-service.spec.ts` **không tồn tại**. Hợp đồng Dev 2 được khóa bởi `StudentCourseService.getMyTeam` + 9 ca trên. Việc hợp nhất hai method để tránh trùng lặp là việc dọn dẹp sau, không thuộc phạm vi Dev 2.

---

### 🔹 Module `LecturerWeightsService` — Trọng số lát cắt lớp (`LEC_WGT`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `10/09/2026 00:16` | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `LecturerWeightsService` | `GET .../contribution-slice-weights` trả `mode` và bốn trọng số cấp lớp | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `LecturerWeightsService` | `PUT .../contribution-slice-weights` chỉ gửi bốn trọng số, **không** gửi `mode` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `LecturerWeightsService` | `PUT .../contribution-config-mode` chuyển sang `PROJECT_GROUP` thành công | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `LecturerWeightsService` | `GET .../contribution-team-weights` trả `teamId`, `projectId`, `configured` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `LecturerWeightsService` | Không nuốt lỗi `401 INVALID_CREDENTIALS` khi đọc trọng số lớp | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `LecturerWeightsService` | Không nuốt lỗi `403 LECTURER_COURSE_FORBIDDEN` khi đổi mode | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `LecturerWeightsService` | Không nuốt lỗi `404 COURSE_NOT_FOUND` khi đọc team weights | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `LecturerWeightsService` | Không nuốt lỗi mạng khi PUT trọng số lớp | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `LecturerWeightsService` | Throw `ValidationException` khi `courseId` rỗng lúc lấy trọng số | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `LecturerWeightsService` | Danh sách nhóm rỗng `teams=[]` vẫn hợp lệ khi chưa phân nhóm | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID11** | `LecturerWeightsService` | Throw `ValidationException` khi `courseId` chỉ toàn khoảng trắng | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID12** | `LecturerWeightsService` | Nhóm chưa có `projectId` được chuẩn hóa thành `null`, không dùng mock ID | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `ProjectWeightsService` — Trọng số dự án nhóm (`PRJ_WGT`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `10/09/2026 00:16` | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `ProjectWeightsService` | `GET /api/projects/{projectId}/group-weights` trả bộ trọng số dự án nhóm | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `ProjectWeightsService` | `PUT group-weights` gửi bốn trọng số kèm `teamId` và `note` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `ProjectWeightsService` | Không nuốt lỗi `401 INVALID_CREDENTIALS` khi đọc group-weights | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `ProjectWeightsService` | Không nuốt lỗi `403` khi giảng viên không được PUT group-weights | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `ProjectWeightsService` | Không nuốt lỗi `404 PROJECT_NOT_FOUND` khi đọc group-weights | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `ProjectWeightsService` | Không nuốt lỗi mạng khi GET group-weights | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `ProjectWeightsService` | Throw `ValidationException` khi `projectId` rỗng | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `ProjectWeightsService` | PUT chỉ bốn trọng số bắt buộc khi không có `teamId` và `note` | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `ProjectWeightsService` | Throw `ValidationException` khi `projectId` chỉ toàn khoảng trắng | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `ProjectWeightsService` | Response thiếu `note` vẫn chuẩn hóa thành chuỗi rỗng | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `TeamContributionService` — Đánh giá & ghi đè đóng góp (`TEAM_CTR`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `10/09/2026 00:16` | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `TeamContributionService` | `GET .../contribution-evaluation` trả mode, trọng số và bảng thành viên từ BE | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `TeamContributionService` | `POST .../contribution-override` dùng `studentProfileId`, không dùng `teamMemberId` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `TeamContributionService` | Không nuốt lỗi `401 INVALID_CREDENTIALS` khi đọc đánh giá | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `TeamContributionService` | Không nuốt lỗi `403` khi giảng viên không được override | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `TeamContributionService` | Không nuốt lỗi `404 TEAM_NOT_FOUND` khi đọc đánh giá | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `TeamContributionService` | Không nuốt lỗi mạng khi GET contribution-evaluation | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `TeamContributionService` | Throw `ValidationException` khi `teamId` rỗng | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `TeamContributionService` | Throw `ValidationException` khi `studentProfileId` rỗng lúc override | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID09** | `TeamContributionService` | Throw `ValidationException` khi `percentage` không phải số | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID10** | `TeamContributionService` | Danh sách thành viên rỗng vẫn hợp lệ, không tự tính tỷ lệ ở FE | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID11** | `TeamContributionService` | Override `percentage = 0` là giá trị biên hợp lệ | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID12** | `TeamContributionService` | Throw `ValidationException` khi `teamId` chỉ toàn khoảng trắng | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

### 🔹 Module `contribution-utils` — Quy đổi thang trọng số (`CTR_UTIL`)

| Mã Ca (ID) | Tên Chức Năng | Mô Tả Ca Kiểm Thử | Loại | Kết Quả `10/09/2026 00:16` | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **UTCID01** | `contribution-utils` | Tổng 100 được nhận là đơn vị phần trăm | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID02** | `contribution-utils` | Tổng 1.0 được nhận là tỷ lệ 0–1 và quy đổi hiển thị 100% | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID03** | `contribution-utils` | Tổng khác 100% không hợp lệ để lưu | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID04** | `contribution-utils` | Giá trị âm hoặc `NaN` là trọng số không hợp lệ | **`A`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID05** | `contribution-utils` | Quy đổi ngược từ hiển thị phần trăm về tỷ lệ 0–1 khi lưu | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID06** | `contribution-utils` | Tổng 0 không suy ra tỷ lệ 0–1, giữ đơn vị phần trăm | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID07** | `contribution-utils` | Chỉ cho phép PUT group-weights khi mode `PROJECT_GROUP` và có `projectId` | **`N`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |
| **UTCID08** | `contribution-utils` | Không mở form lưu khi mode `COURSE` hoặc thiếu `projectId` | **`B`** | <span style="color: #16a34a; font-weight: bold;">PASSED</span> | <mark style="background-color: #dcfce7; color: #166534;">PASSED</mark> |

---

## 🔗 PHẦN 3: ĐỐI SOÁT HỢP ĐỒNG API BACKEND DEV 2

> Endpoint nhóm sinh viên **bắt buộc** là `GET /api/student/courses/{courseId}/team`. Ca **UTCID09** (`STU_CRS`) khóa không gọi `/my-team`.

| Nhóm Nghiệp Vụ | HTTP Method & Endpoint | Mô Tả Nghiệp Vụ Contract | Trạng Thái Kiểm Thử Đơn Vị |
| :--- | :--- | :--- | :---: |
| **Lớp giảng viên (Part E1–E3)** | `GET /api/lecturer/courses` | Danh sách lớp giảng viên được phân công | **PASSED (`LEC_CRS` UTCID01, UTCID04, UTCID08)** |
| | `GET /api/lecturer/courses/{courseId}` | Chi tiết lớp học phần | **PASSED (`LEC_CRS` UTCID02, UTCID05, UTCID07)** |
| | `GET /api/lecturer/courses/{courseId}/roster` | Roster sinh viên ACTIVE | **PASSED (`LEC_CRS` UTCID03, UTCID06, UTCID09, UTCID10)** |
| **Tổ chức nhóm Excel (Part E4–E7)** | `GET /api/lecturer/courses/{courseId}/teams/template` | Tải file mẫu chia nhóm (Blob) | **PASSED (`LEC_TEAM` UTCID01, UTCID05)** |
| | `POST /api/lecturer/courses/{courseId}/teams/import/preview` | Upload xem trước, nhận `previewToken` | **PASSED (`LEC_TEAM` UTCID02, UTCID06, UTCID08, UTCID09, UTCID14, UTCID16)** |
| | `POST /api/lecturer/courses/{courseId}/teams/import/confirm` | Xác nhận tạo nhóm, body `{ previewToken }` | **PASSED (`LEC_TEAM` UTCID03, UTCID10–UTCID13)** |
| | `GET /api/lecturer/courses/{courseId}/teams` | Danh sách nhóm, `teamId`, `projectId` có thể `null` | **PASSED (`LEC_TEAM` UTCID04, UTCID07, UTCID15, UTCID18, UTCID31)** |
| **Điều phối nhóm bổ sung** | `PUT /api/lecturer/courses/{courseId}/teams/{teamId}/leader` | Đổi trưởng nhóm, body `{ teamMemberId }` | **PASSED (`LEC_TEAM` UTCID22, UTCID24, UTCID26, UTCID28, UTCID29)** |
| | `PATCH /api/lecturer/courses/{courseId}/team-members/{teamMemberId}/team` | Chuyển thành viên, body `{ targetTeamId }` | **PASSED (`LEC_TEAM` UTCID23, UTCID25, UTCID27, UTCID30)** |
| **Confirm bị chặn (client)** | `canConfirmTeamImport(preview)` | Disable confirm khi `hasBlockingErrors === true` | **PASSED (`LEC_TEAM` UTCID17)** |
| **Sinh viên môn & nhóm (Part F, G1)** | `GET /api/student/courses` | Môn ACTIVE theo session, không gửi `userId` | **PASSED (`STU_CRS` UTCID01, UTCID03, UTCID07)** |
| | `GET /api/student/courses/{courseId}/team` | Nhóm của tôi: `myRole`, `members` | **PASSED (`STU_CRS` UTCID02, UTCID04–UTCID06, UTCID08, UTCID09)** |
| **Trọng số lát cắt lớp (DEC-002)** | `GET /api/lecturer/courses/{courseId}/contribution-slice-weights` | Bộ trọng số mặc định của lớp | **PASSED (`LEC_WGT` UTCID01, UTCID05, UTCID09)** |
| | `PUT /api/lecturer/courses/{courseId}/contribution-slice-weights` | Cập nhật bốn tiêu chí, không gửi `mode` | **PASSED (`LEC_WGT` UTCID02, UTCID08)** |
| | `PUT /api/lecturer/courses/{courseId}/contribution-config-mode` | Đổi `COURSE` / `PROJECT_GROUP` | **PASSED (`LEC_WGT` UTCID03, UTCID06, UTCID11)** |
| | `GET /api/lecturer/courses/{courseId}/contribution-team-weights` | Nhóm nào đã có trọng số riêng | **PASSED (`LEC_WGT` UTCID04, UTCID07, UTCID10, UTCID12)** |
| **Trọng số dự án nhóm** | `GET /api/projects/{projectId}/group-weights` | Xem trọng số riêng của dự án | **PASSED (`PRJ_WGT` UTCID01, UTCID03, UTCID05, UTCID06, UTCID10)** |
| | `PUT /api/projects/{projectId}/group-weights` | Cập nhật bốn tiêu chí + `teamId`/`note` tùy chọn | **PASSED (`PRJ_WGT` UTCID02, UTCID04, UTCID07–UTCID09)** |
| **Đánh giá đóng góp** | `GET /api/teams/{teamId}/contribution-evaluation` | Tỷ lệ % đóng góp từng thành viên | **PASSED (`TEAM_CTR` UTCID01, UTCID03, UTCID05–UTCID07, UTCID10, UTCID12)** |
| | `POST /api/teams/{teamId}/contribution-override` | Ghi đè tỷ lệ, body `{ studentProfileId, percentage, reason }` | **PASSED (`TEAM_CTR` UTCID02, UTCID04, UTCID08, UTCID09, UTCID11)** |

---

## 🏆 TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

1. **Pass Rate**: Đạt **100% Passed (92/92)** trên lần chạy `10/09/2026 00:16`.
2. **Phân bổ ca kiểm thử chuẩn FPT**:
   - Ca Normal (`N`): **25.00%** (mục tiêu 20–30%)
   - Ca Abnormal (`A`): **44.57%** (mục tiêu 40–50%)
   - Ca Boundary (`B`): **30.43%** (mục tiêu 25–35%)
3. **Hợp đồng ID**: Các ca dùng `courseId` demo `2bf1c497-71d4-43f2-a683-b74b7ad74327`; không hoán đổi với `teamId` / `projectId` / `teamMemberId` / `studentProfileId`.
4. **Hợp đồng team sinh viên**: `GET .../team`, không `/my-team`. `404 TEAM_NOT_FOUND` là trạng thái chờ phân nhóm, không phải lỗi hệ thống.
5. **Hợp đồng trọng số**: PUT slice-weights không gửi `mode`; PUT group-weights chỉ khi `PROJECT_GROUP` và có `projectId`; override dùng `studentProfileId`.
6. **Điều phối nhóm**: `PUT .../leader` gửi `{ teamMemberId }`; `PATCH .../team` gửi `{ targetTeamId }`; parser giữ `teamMemberId` thật.

---

> 📌 **File spec nguồn**:
> - `src/features/lecturer/courses/api/lecturer-course-service.spec.ts`
> - `src/features/lecturer/teams/api/lecturer-team-service.spec.ts`
> - `src/features/student/courses/api/student-course-service.spec.ts`
> - `src/features/lecturer/contribution/api/lecturer-weights-service.spec.ts`
> - `src/features/lecturer/contribution/api/project-weights-service.spec.ts`
> - `src/features/lecturer/contribution/api/team-contribution-service.spec.ts`
> - `src/features/lecturer/contribution/lib/contribution-utils.spec.ts`
>
> Dashboard tổng hợp: [UNIT_TEST_RESULTS.md](UNIT_TEST_RESULTS.md)
