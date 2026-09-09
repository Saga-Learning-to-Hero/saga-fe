# Kế Hoạch Phân Chia Tích Hợp API & Phân Rã Nhiệm Vụ (API Integration Task Assignment)

Tài liệu này định hình kế hoạch phân chia công việc tích hợp API Backend cho nhóm **Frontend (3 thành viên)** của dự án SAGA, dựa trên tài liệu đặc tả kỹ thuật `docs/FRONTEND_API_STEP_BY_STEP.md`.

> 📋 **Sổ bộ đăng ký & Đối soát trạng thái API (Live Registry):** Xem chi tiết tại [.agents/rules/api-integration-registry.md](file:///d:/Capstone/saga%20workspace/saga-fe/.agents/rules/api-integration-registry.md). Mọi thành viên và AI Agent khi tích hợp xong bất kỳ API nào bắt buộc phải cập nhật trạng thái tại đây.

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
│              🎯 BẢN ĐỒ TÁI CÂN BẰNG TẢI HOÀN HẢO (3 DEVS - 97 APIS)            │
├───────────────────────┬─────────────────────────────┬───────────────────────────┤
│  👤 DEV 1 (~33%)      │  👤 DEV 2 (~33%)            │  👤 DEV 3 (~34%)          │
│  Học thuật & Đề cương │  Quản trị Lớp, Phân Nhóm    │  Dự án, Tích hợp GH/Jira  │
│  + Minh Chứng Task    │  + Trọng Số Slicing Pie     │  + Đồng Bộ Chiếu Dữ Liệu  │
│  (Academic & Evidence)│  (Course, Team & Weights)   │  (Project & Sync Engine)  │
├───────────────────────┼─────────────────────────────┼───────────────────────────┤
│ • 32 API Admin (Xong) │ • 11 API Lớp/Nhóm (Xong)    │ • 18 API Tích hợp (Xong)  │
│ • 10 API MỚI CẦN LÀM: │ • 8 API MỚI CẦN LÀM:        │ • 5 API MỚI CẦN LÀM:      │
│   - Work Sessions (2) │   - Course Weights (4)      │   - Sync & Status (2)     │
│   - Confirmations (1) │   - Group Weights (2)       │   - Tasks & Commits (3)   │
│   - Web Links (3)     │   - Team Eval DEC-002 (2)   │ • Viết Unit Tests cho 12  │
│   - File Evidence (4) │                             │   Services tích hợp       │
└───────────────────────┴─────────────────────────────┴───────────────────────────┘
```

---

## 2. Bảng Ma Trận Phân Chia Công Việc Chi Tiết

| Thành viên | Trục Nghiệp Vụ Phụ Trách                                                                     |         Phần Tài Liệu          | Mã Task Jira & Nhánh Git                           | Thư Mục Mã Nguồn                                                                                   |
| :--------- | :------------------------------------------------------------------------------------------- | :----------------------------: | :------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **Dev 1**  | **HỌC THUẬT & MINH CHỨNG TASK** _(Admin Catalog, Course Roster, Work Sessions & Task Evidence)_ |  **Part C, D & Task Evidence** | `feat/SAGA-43-admin-academic-and-task-evidence`    | `src/features/admin/*`<br/>`src/features/student/sprint-progress/*`<br/>`src/app/(dashboard)/admin/*` |
| **Dev 2**  | **LỚP HỌC, PHÂN NHÓM & TRỌNG SỐ** _(Lecturer Courses, Teams, Slicing Pie Weights & Team Eval)_ | **Part E, F, G1, Weights & DEC-002** | `feat/SAGA-44-lecturer-course-and-team-management` | `src/features/lecturer/*`<br/>`src/features/student/courses/`<br/>`src/app/(dashboard)/lecturer/*` |
| **Dev 3**  | **DỰ ÁN, TÍCH HỢP & ĐỒNG BỘ** _(Project, GitHub/Jira Integrations, OAuth Callbacks & Projections Sync)_ |   **Part H, I, J, N & Sync**   | `feat/SAGA-45-project-and-tool-integrations`       | `src/features/student/project/`<br/>`src/features/integrations/*`<br/>`src/features/student/commits/*`      |

---

## 3. Chi Tiết Nhiệm Vụ Của Từng Lập Trình Viên

### 👤 DEV 1: Học Thuật, Quản Lý Lớp & Thu Thập Minh Chứng Task (Academic & Task Evidence)

- **Mục tiêu**: Xây dựng toàn bộ nền tảng dữ liệu học thuật của trường, quản lý lớp học phần, import danh sách sinh viên vào Course, và phụ trách toàn bộ hệ thống thu thập minh chứng làm việc (Task Evidence: link, file, bấm giờ phiên làm việc).
- **Đặc thù UI**: Form nhập liệu nhiều bước, Cây cấu trúc tiêu chí môn học (Tree View), Bảng Course, **Excel Roster Uploader**, và **Hộp thoại Minh chứng Công sức (Task Evidence Dialog: Upload file minh chứng, đính kèm link tài liệu/Figma, Widget bấm giờ làm việc)**.
- **Danh mục API phụ trách (32 API Nền tảng + 10 API MỚI CẦN LÀM)**:
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
  6. **Thu Thập Chứng Cứ & Minh Chứng Phiên Làm Việc (Task Evidence & Work Sessions - 10 API MỚI CẦN LÀM)**:
     - `POST /api/tasks/{taskId}/work-sessions/start` (Bắt đầu phiên bấm giờ làm việc trên task)
     - `POST /api/tasks/{taskId}/work-sessions/{sessionId}/stop` (Dừng và lưu lại thời lượng phiên làm việc)
     - `POST /api/tasks/{taskId}/contribution-confirmations` (Đồng đội xác nhận đóng góp chéo)
     - `GET /api/tasks/{taskId}/web-links` (Lấy danh sách URL tài liệu/thiết kế đính kèm)
     - `POST /api/tasks/{taskId}/web-links` (Đính kèm liên kết web minh chứng đầu việc)
     - `DELETE /api/tasks/{taskId}/web-links/{linkId}` (Xóa liên kết web khỏi task)
     - `GET /api/tasks/{taskId}/files` (Xem danh sách tệp đính kèm)
     - `POST /api/tasks/{taskId}/files` (Tải lên file minh chứng `multipart/form-data`)
     - `GET /api/tasks/{taskId}/files/{fileId}` (Tải xuống file minh chứng)
     - `DELETE /api/tasks/{taskId}/files/{fileId}` (Xóa tệp đính kèm)

---

### 👤 DEV 2: Lớp Học, Phân Nhóm & Toàn Bộ Trọng Số Slicing Pie (Courses, Teams & Weights)

- **Mục tiêu**: Quản lý không gian lớp học của giảng viên, theo dõi sinh viên ACTIVE, phân chia sinh viên vào các nhóm đồ án, và **phụ trách toàn bộ hệ thống Trọng số Slicing Pie (cấp Lớp & cấp Nhóm) cùng đánh giá đóng góp DEC-002**.
- **Đặc thù UI**: Bảng lớp học giảng dạy, Danh sách sinh viên đang học thực tế, bộ xử lý **Excel Team Uploader**, **Giao diện điều chỉnh Trọng số Slicing Pie (Slider/Input tổng 100%)** và **Bảng đối soát tỷ lệ % đóng góp thực tế của thành viên**.
- **Danh mục API phụ trách (11 API Nền tảng + 8 API MỚI CẦN LÀM)**:
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
  5. **Cấu hình Trọng số Lát cắt Đóng góp Lớp học (Slicing Pie Weights - DEC-002 - 4 API MỚI)**:
     - `GET /api/lecturer/courses/{courseId}/contribution-slice-weights` (Lấy trọng số lát cắt mặc định của lớp học phần)
     - `PUT /api/lecturer/courses/{courseId}/contribution-slice-weights` (Cập nhật tỷ trọng các tiêu chí đóng góp của lớp)
     - `PUT /api/lecturer/courses/{courseId}/contribution-config-mode` (Chuyển đổi chế độ trọng số: `COURSE` vs `PROJECT_GROUP`)
     - `GET /api/lecturer/courses/{courseId}/contribution-team-weights` (Xem nhóm nào đã thiết lập trọng số riêng)
  6. **Cấu hình Trọng số Nhóm Dự án (Project Group Weights - 2 API MỚI)**:
     - `GET /api/projects/{projectId}/group-weights` (Xem trọng số riêng của nhóm đồ án)
     - `PUT /api/projects/{projectId}/group-weights` (Team Leader cập nhật bộ trọng số riêng khi lớp cho phép)
  7. **Đánh giá & Điều phối Đóng góp Nhóm (Team Contribution Evaluation - DEC-002 - 2 API MỚI)**:
     - `GET /api/teams/{teamId}/contribution-evaluation` (Tính toán tự động tỷ lệ % đóng góp thực tế của từng thành viên)
     - `POST /api/teams/{teamId}/contribution-override` (Ghi đè thủ công tỷ lệ % đóng góp khi nhóm có biên bản thỏa thuận)

---

### 👤 DEV 3: Không Gian Dự Án, Tích Hợp GH/Jira & Chiếu Đồng Bộ Dữ Liệu (Project, Integrations & Sync)

- **Mục tiêu**: Xây dựng không gian làm việc của nhóm đồ án, Team Leader tạo dự án, kết nối GitHub App & Jira Software, xử lý luồng xác thực OAuth 2 tầng, và **phụ trách toàn bộ động cơ Chiếu & Đồng bộ Dữ liệu (Project Projections & Sync Engine)**.
- **Đặc thù UI**: Luồng kết nối nhiều bước (Multi-step Integration Wizard), xử lý OAuth Redirect / Popup, Callback Route Handlers, Thẻ tóm tắt tích hợp, **Nút kích hoạt đồng bộ backfill kèm thanh tiến trình**, và **Bảng Kanban / Nhật ký Commit chiếu liên kết**.
- **Danh mục API phụ trách (18 API Nền tảng + 5 API MỚI CẦN LÀM + Hoàn thiện Unit Tests)**:
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
  5. **OAuth Callback & Tóm Tắt Tích Hợp**:
     - Tuyến callback redirect: `/api/integrations/github/oauth/callback`, `/api/integrations/jira/oauth/callback`, `/api/projects/{projectId}/integrations/github/setup/callback`.
     - `GET /api/projects/{projectId}/integrations` (Thẻ trạng thái tích hợp của dự án).
  6. **Chiếu Dữ Liệu Dự Án & Đồng Bộ Ngầm (Project Projections & Sync - 5 API MỚI CẦN LÀM)**:
     - `POST /api/projects/{projectId}/sync` (Team Leader kích hoạt backfill dữ liệu ngầm)
     - `GET /api/projects/{projectId}/sync-status` (Xem tiến độ và trạng thái đồng bộ của Jira & GitHub)
     - `GET /api/projects/{projectId}/tasks` (Danh sách Jira tasks đã chiếu)
     - `GET /api/projects/{projectId}/tasks/{taskId}/commits` (Danh sách commits nối với Jira task)
     - `GET /api/projects/{projectId}/commits` (Danh sách GitHub commits đã chiếu)
  7. **Hoàn Thiện Bộ Unit Tests (Nhiệm vụ bắt buộc)**:
     - Viết đầy đủ 3 nhóm ca kiểm thử (`[N] Normal`, `[A] Abnormal`, `[B] Boundary`) cho các file service: `github-integrations-service.ts`, `jira-integrations-service.ts`, `user-integrations-service.ts`, và `project-projection-service.ts`.

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

- Dashboard webhook / task board Kanban sync tự động thời gian thực (hiện dùng sync thủ công qua `/sync`).
- SSE Realtime Event Stream.
- Graph snapshot / Neo4j delta sync realtime API.
- Master Gradebook / Continuous scoring API chấm điểm môn học FLM theo từng đầu điểm riêng.
- Quên mật khẩu / Xác minh email qua token.
- WebAuthn Step-up Authentication.

*(Lưu ý: Tính năng Đánh giá đóng góp nhóm Slicing Pie DEC-002 **ĐÃ CÓ** trên Backend và được giao cho **Dev 2** thực hiện qua `/api/teams/{teamId}/contribution-evaluation`).*
