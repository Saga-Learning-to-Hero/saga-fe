# Kế Hoạch Phân Chia Tích Hợp API & Phân Rã Nhiệm Vụ (API Integration Task Assignment)

Tài liệu này định hình kế hoạch phân chia công việc tích hợp API Backend cho nhóm **Frontend (3 thành viên)** của dự án SAGA, dựa trên tài liệu đặc tả kỹ thuật `docs/FRONTEND_API_STEP_BY_STEP.md`.

---

## 1. Phân Tích Khối Lượng & Chiến Lược Phân Chia (Workload Balancing)

Nếu phân chia cứng theo Vai trò (Role-based), khối lượng công việc sẽ bị **lệch rất lớn (mất cân bằng tải)**:

- **Lecturer**: Rất nhẹ (Backend hiện tại chỉ có ~6 API đơn giản: xem lớp, xem roster và import nhóm).
- **Student**: Bị quá tải nặng vì phải gánh toàn bộ luồng **Dự án + Tích hợp GitHub App + Tích hợp Jira OAuth 2 tầng (cá nhân + team) + Xử lý Callback Redirect**.
- **Admin**: Khá nhiều form nhập liệu học thuật và cây cấu trúc tiêu chí Syllabus.

### 🎯 Giải pháp: Phân chia theo "Miền nghiệp vụ & Tính năng" (Feature & Domain Driven)

Chia đều toàn bộ khối lượng công việc thành **3 trục nghiệp vụ độc lập (~33% mỗi người)**:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      🎯 BẢN ĐỒ PHÂN CHIA CÂN BẰNG TẢI (3 DEVS)                  │
├───────────────────────┬─────────────────────────────┬───────────────────────────┤
│  👤 DEV 1 (~33%)      │  👤 DEV 2 (~33%)            │  👤 DEV 3 (~34%)          │
│  Học thuật & Đề cương │  Quản trị Lớp & Phân Nhóm   │  Dự án & Tích hợp GH/Jira │
│  (Academic Catalog)   │  (Course, Roster & Teams)   │  (Project & Integrations) │
└───────────────────────┴─────────────────────────────┴───────────────────────────┘
```

---

## 2. Bảng Ma Trận Phân Chia Công Việc Chi Tiết

| Thành viên | Trục Nghiệp Vụ Phụ Trách                                                           |           Phần Tài Liệu            | Mã Task Jira & Nhánh Git                           | Thư Mục Mã Nguồn                                                                                   |
| :--------- | :--------------------------------------------------------------------------------- | :--------------------------------: | :------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **Dev 1**  | **Toàn bộ Phân hệ ADMIN** _(Học thuật, Đề cương, Lớp học phần & Roster sinh viên)_ |        **Part C & Part D**         | `feat/SAGA-43-admin-academic-course-roster`        | `src/features/admin/*`<br/>`src/app/(dashboard)/admin/*`                                           |
| **Dev 2**  | **Phân hệ GIẢNG VIÊN & TỔ CHỨC NHÓM** _(Lecturer Courses, Active Roster & Teams)_  |       **Part E, Part F, G1**       | `feat/SAGA-44-lecturer-course-and-team-management` | `src/features/lecturer/*`<br/>`src/features/student/courses/`<br/>`src/app/(dashboard)/lecturer/*` |
| **Dev 3**  | **Khởi tạo Dự án & Tích hợp GitHub / Jira** _(Project & Integrations Hub)_         | **Part H, Part I, Part J, Part N** | `feat/SAGA-45-project-and-tool-integrations`       | `src/features/student/project/`<br/>`src/features/integrations/*`<br/>`src/app/integrations/`      |

---

## 3. Chi Tiết Nhiệm Vụ Của Từng Lập Trình Viên

### 👤 DEV 1: Toàn bộ Phân hệ ADMIN (Academic Catalog, Course & Roster)

- **Mục tiêu**: Xây dựng toàn bộ nền tảng dữ liệu học thuật của trường, quản lý danh sách lớp học phần và import danh sách sinh viên vào Course.
- **Đặc thù UI**: Form nhập liệu nhiều bước, Cây cấu trúc tiêu chí môn học (Tree View), Bảng quản lý Course và bộ công cụ **Excel Roster Uploader (Template ➔ Preview lỗi/hợp lệ ➔ Confirm Import)**.
- **Danh mục API phụ trách (Part C & Part D)**:
  1. **Subject (Môn học - Part C1, C2)**:
     - `GET /api/admin/subjects` (Danh sách môn học)
     - `POST /api/admin/subjects` (Tạo môn học mới)
     - `GET /api/admin/subjects/{id}` (Chi tiết môn học)
     - `PATCH /api/admin/subjects/{id}` (Cập nhật môn học)
  2. **Syllabus (Đề cương môn học - Part C3 – C6)**:
     - `POST /api/admin/subjects/{subjectId}/syllabi` (Tạo phiên bản Syllabus DRAFT)
     - `GET /api/admin/subjects/{subjectId}/syllabi/{syllabusVersionId}` (Đọc chi tiết Syllabus)
     - `PUT /api/admin/subjects/{subjectId}/syllabi/{syllabusVersionId}/structure` (Thay thế cây cấu trúc tiêu chí DRAFT)
     - `POST /api/admin/subjects/{subjectId}/syllabi/{syllabusVersionId}/publish` (Xuất bản chính thức sang ACTIVE / Bất biến)
     - `POST /api/admin/subjects/{subjectId}/syllabi/{syllabusVersionId}/archive` (Lưu trữ Syllabus cũ)
  3. **Semester & Academic Class (Học kỳ & Lớp hành chính - Part C7, C8)**:
     - `GET /api/admin/semesters` & `POST /api/admin/semesters` (Quản lý học kỳ)
     - `GET /api/admin/classes` & `POST /api/admin/classes` (Quản lý lớp hành chính)
  4. **Course Operations (Lớp học phần của Admin - Part C9 – C11)**:
     - `POST /api/admin/courses` (Tạo lớp học phần mới từ Subject, Semester, Class, Lecturer)
     - `GET /api/admin/courses` (Liệt kê tất cả lớp học phần)
  5. **Roster Sinh viên (Admin Roster Import - Part D1 – D4)**:
     - `GET /api/admin/courses/{id}/roster/template` (Tải file mẫu Excel)
     - `GET /api/admin/courses/{id}/roster` (Xem danh sách sinh viên kèm trạng thái lời mời)
     - `POST /api/admin/courses/{id}/roster/import/preview` (Upload xem trước danh sách import)
     - `POST /api/admin/courses/{id}/roster/import/confirm` (Xác nhận import sinh viên vào lớp)

---

### 👤 DEV 2: Phân hệ GIẢNG VIÊN & TỔ CHỨC NHÓM (Lecturer Courses & Teams)

- **Mục tiêu**: Quản lý không gian lớp học của giảng viên, theo dõi sinh viên ACTIVE và phân chia sinh viên vào các nhóm đồ án.
- **Đặc thù UI**: Bảng lớp học giảng dạy, Danh sách sinh viên đang học thực tế và bộ xử lý **Excel Team Uploader (Tải template ➔ Upload xem trước nhóm/leader ➔ Xác nhận phân nhóm)**.
- **Danh mục API phụ trách (Part E, Part F, G1)**:
  1. **Không gian Lớp của Giảng viên (Part E1 – E3)**:
     - `GET /api/lecturer/courses` (Danh sách lớp giảng viên được phân công)
     - `GET /api/lecturer/courses/{courseId}` (Chi tiết thông tin lớp học phần)
     - `GET /api/lecturer/courses/{courseId}/roster` (Xem danh sách sinh viên ACTIVE)
  2. **Tổ chức Nhóm Đồ án (Lecturer Team Management - Part E4 – E7)**:
     - `GET /api/lecturer/courses/{courseId}/teams/template` (Tải file mẫu chia nhóm)
     - `POST /api/lecturer/courses/{courseId}/teams/import/preview` (Upload xem trước danh sách nhóm, Leader, Member)
     - `POST /api/lecturer/courses/{courseId}/teams/import/confirm` (Xác nhận tạo nhóm hàng loạt)
     - `GET /api/lecturer/courses/{courseId}/teams` (Xem danh sách nhóm, `teamId`, `leader`, `projectId`)
  3. **Sinh viên xem Môn & Nhóm (Part F, G1)**:
     - `GET /api/student/courses` (Môn học sinh viên đang tham gia)
     - `GET /api/student/courses/{courseId}/team` (Sinh viên xem nhóm và vai trò của mình)
  4. **Điều phối Nhóm Đồ án Bổ sung**:
     - `PUT /api/lecturer/courses/{courseId}/teams/{teamId}/leader` (Chỉ định / thay đổi Trưởng nhóm mới)
     - `PATCH /api/lecturer/courses/{courseId}/team-members/{teamMemberId}/team` (Chuyển thành viên sang nhóm khác trong lớp)

---

### 👤 DEV 3: Khởi tạo Dự án & Trung tâm Tích hợp GitHub / Jira (Project & Integrations Hub)

- **Mục tiêu**: Xây dựng không gian làm việc của nhóm đồ án, Team Leader tạo dự án, kết nối GitHub App & Jira Software và đồng bộ dữ liệu chiếu (Project Projections).
- **Đặc thù UI**: Luồng kết nối nhiều bước (Multi-step Integration Wizard), xử lý OAuth Redirect / Popup, Callback Route Handlers, Thẻ tóm tắt tích hợp và Bảng đối soát Task / Commit.
- **Danh mục API phụ trách (Part H, Part I, Part J, Part N)**:
  1. **Khởi tạo Dự án Nhóm (Part H)**:
     - `GET /api/student/project-types` (Danh mục loại đồ án)
     - `GET /api/student/courses/{courseId}/project` (Xem thông tin dự án hiện tại)
     - `POST /api/student/courses/{courseId}/project` (Chỉ Team Leader tạo dự án)
  2. **Tích hợp GitHub Workspace Nhóm (Part I)**:
     - `POST /api/projects/{projectId}/integrations/github/connect` (Khởi tạo kết nối GitHub App cho nhóm)
     - `GET /api/projects/{projectId}/integrations/github/repositories` (Liệt kê repositories được cấp quyền)
     - `PUT /api/projects/{projectId}/integrations/github/repositories` (Chọn repo kèm role `FRONTEND` / `BACKEND` / `OTHER`)
     - `DELETE /api/projects/{projectId}/integrations/github` (Hủy liên kết GitHub)
  3. **Tích hợp Jira Workspace Nhóm (Part J)**:
     - `POST /api/projects/{projectId}/integrations/jira/connect` (Bắt đầu luồng OAuth Jira nhóm)
     - `GET /api/projects/{projectId}/integrations/jira/sites` (Chọn Atlassian Site / `cloudId`)
     - `GET /api/projects/{projectId}/integrations/jira/projects?cloudId={cloudId}` (Chọn Jira Project)
     - `GET /api/projects/{projectId}/integrations/jira/boards?cloudId={cloudId}&jiraProjectId={jiraProjectId}` (Chọn Jira Board)
     - `PUT /api/projects/{projectId}/integrations/jira` (Lưu cấu hình Jira: `cloudId`, `jiraProjectId`, `boardId`)
     - `DELETE /api/projects/{projectId}/integrations/jira` (Hủy liên kết Jira)
  4. **Liên kết Danh tính Cá nhân (Personal Integrations)**:
     - `GET /api/integrations/me` (Xem danh sách tài khoản cá nhân đã liên kết)
     - `POST /api/integrations/github/link` (Khởi tạo OAuth liên kết GitHub cá nhân)
     - `POST /api/integrations/jira/link` (Khởi tạo OAuth liên kết Jira cá nhân)
     - `PATCH /api/integrations/github/{identityId}/primary` & `PATCH /api/integrations/jira/{identityId}/primary` (Đặt làm tài khoản chính)
     - `DELETE /api/integrations/github/{identityId}` & `DELETE /api/integrations/jira/{identityId}` (Hủy liên kết cá nhân)
  5. **Chiếu Dữ Liệu Dự Án & Đồng Bộ Ngầm (Project Projections & Sync)**:
     - `POST /api/projects/{projectId}/sync` (Team Leader kích hoạt backfill dữ liệu ngầm)
     - `GET /api/projects/{projectId}/sync-status` (Xem tiến độ và trạng thái đồng bộ của Jira & GitHub)
     - `GET /api/projects/{projectId}/tasks` (Danh sách Jira tasks đã chiếu)
     - `GET /api/projects/{projectId}/tasks/{taskId}/commits` (Danh sách commits nối với Jira task)
     - `GET /api/projects/{projectId}/commits` (Danh sách GitHub commits đã chiếu)
  6. **OAuth Callback & Tóm Tắt Tích Hợp**:
     - Tuyến callback redirect: `/api/integrations/github/oauth/callback`, `/api/integrations/jira/oauth/callback`, `/api/projects/{projectId}/integrations/github/setup/callback`.
     - `GET /api/projects/{projectId}/integrations` (Thẻ trạng thái tích hợp của dự án).

---

## 4. Quy Chuẩn Kỹ Thuật Bắt Buộc Cho Cả 3 Thành Viên

1. **Giao tiếp API tập trung**:
   - Tuyệt đối không dùng `fetch()` trực tiếp trong Component.
   - Mọi Service class đều dùng `apiClient` từ `src/lib/axios.ts` (đã tích hợp tự động Redis Session Cookie và CSRF Header `X-XSRF-TOKEN`).
2. **Quy tắc Phân quyền (Security & Role Guard)**:
   - Body request **không bao giờ gửi trường `role`**. Quyền hạn do Backend xác định từ session.
   - Không hoán đổi `courseId` với `projectId`.
3. **Quy chuẩn Unit Test (Chuẩn FPT Report)**:
   - Mọi API Service đều phải có file `*.spec.ts` tương ứng.
   - Viết test bằng helper `fptTest` phân loại đủ 3 nhóm ca kiểm thử:
     - `N` (Normal / Happy path)
     - `A` (Abnormal / Lỗi máy chủ, thiếu trường, 401, 403, 409, Network Error)
     - `B` (Boundary / Giá trị biên, chuỗi rỗng, khoảng trắng)
   - Đảm bảo `npm run test` đạt 100% Passed.
4. **Quy chuẩn Git & Workflow**:
   - Nhánh tính năng: `feat/SAGA-xx-<mo-ta-ngan-gon>`.
   - Commit message bằng Tiếng Việt: `feat: [FE][SAGA-xx] <Mô tả nội dung>`.
   - Trước khi tạo PR: `npm run lint` đạt 0 Error, 0 Warning và `npm run build` pass 100%.

---

## 5. Danh Mục Tính Năng Chưa Có Trên Backend (CẢNH BÁO: KHÔNG LÀM)

Các tính năng sau **chưa được backend triển khai**, các thành viên không dựng mock hay gọi API cho các phần này:

- Dashboard webhook / task board Kanban sync tự động.
- SSE Realtime Event Stream.
- Graph snapshot / Neo4j delta API.
- Assessment / Continuous scoring API.
- Quên mật khẩu / Xác minh email.
- WebAuthn Step-up Authentication.
