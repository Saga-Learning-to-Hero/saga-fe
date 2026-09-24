# SAGA — Đặc tả nghiệp vụ sản phẩm và phụ lục triển khai FE/BE

> Đây là tài liệu nghiệp vụ chuẩn để viết/đối chiếu báo cáo. Phạm vi nghiệp vụ được ghi đầy đủ, không phụ thuộc FE đã gọi API hay UI đã hoàn thiện. Trạng thái triển khai chỉ nằm ở phần phụ lục để theo dõi tiến độ.

## 0. Hợp đồng của tài liệu

```yaml
documentType: SAGA_PRODUCT_BUSINESS_SPECIFICATION
scopeMode: TARGET_BUSINESS_SCOPE_PLUS_AS_BUILT_APPENDIX
canonicalLocation: saga-fe/docs/SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md
baselineDate: 2026-09-16
updatePolicy: MANDATORY_IN_SAME_CHANGESET
```

Tài liệu có hai lớp độc lập:

1. **Đặc tả sản phẩm chuẩn** — các mục 2–6, 9–10 và 12 mô tả SAGA phải giải quyết gì, actor nào tham gia, dữ liệu nào là canonical, quy tắc nào phải đúng và tiêu chí nghiệm thu. Đây là phần dùng để kiểm tra tài liệu báo cáo bên ngoài.
2. **Phụ lục triển khai** — các mục 7–8 và 11 ghi nhận BE/FE/UI đã đi tới đâu. Một nghiệp vụ vẫn phải xuất hiện trong đặc tả dù trạng thái là `BE_ONLY`, `PARTIAL`, `MOCK`, `WIP/VERIFY` hoặc `ABSENT`.

Quy tắc bảo trì bắt buộc:

- Thêm, sửa hoặc xóa hành vi nghiệp vụ, actor, permission, state, enum, DTO/API public, nguồn canonical, công thức đánh giá, graph node/edge, metric báo cáo hoặc luồng UI thì phải cập nhật file này trong cùng changeset.
- Không được xóa requirement khỏi đặc tả chỉ vì chưa implement; chuyển trạng thái ở phụ lục và ghi gap tương ứng.
- Không tự đánh dấu `DONE` chỉ vì Backend có endpoint. Phải kiểm tra đủ Backend rule/authorization/test và Frontend type/service/hook/UI/test.
- Các tài liệu báo cáo bên ngoài phải được so với phần đặc tả chuẩn trước, sau đó mới dùng phụ lục triển khai để mô tả mức độ hoàn thành.
- Việc cập nhật mang tính semantic nên agent/dev phải thực hiện cùng code review; không dùng script tìm chuỗi API để tự suy diễn nghiệp vụ.

---

## 1. Thông tin baseline

| Hạng mục | Giá trị tại thời điểm kiểm tra |
| --- | --- |
| Frontend | `saga-fe`, nhánh `dev` |
| Backend | `saga-be`, nhánh `main` |
| FE framework | Next.js 16, React, TypeScript, TanStack Query |
| Dữ liệu nghiệp vụ chính | REST từ Backend; Jira/GitHub được đồng bộ thành projection trong SAGA |
| Dữ liệu Graph | Neo4j projection do Backend tạo, FE chỉ truy vấn và trực quan hóa |
| Realtime | SSE chỉ báo thay đổi; sau event FE phải refetch REST canonical |
| FE unit regression | Đạt 100% tests passed (898/898 tests), 0 lint errors/warnings, production build passed |
| Lưu ý | SAGA-97 bổ sung bộ Unit Tests chuẩn FPT (UTCID19-21) cho API getTaskWorkSessionTimeline trong ProjectTaskService |

### 1.1 Mục đích sử dụng

Tài liệu trả lời đồng thời năm câu hỏi:

1. SAGA giải quyết nghiệp vụ gì và cho vai trò nào?
2. Sản phẩm hoàn chỉnh phải có những năng lực, quy tắc và đầu ra nào?
3. Backend hiện đã cung cấp quy tắc và API nào?
4. Frontend đã có service/hook và giao diện sử dụng API đó chưa?
5. Phần nào còn mock, mới có Backend, đang phát triển hoặc cần xác minh contract?

### 1.2 Quy ước trạng thái

| Ký hiệu | Ý nghĩa |
| --- | --- |
| `DONE` | BE có API/quy tắc, FE có data layer và UI sử dụng được |
| `BE_ONLY` | BE đã có nhưng FE chưa tích hợp hoặc chưa có UI |
| `PARTIAL` | Có một phần luồng; còn thiếu nhánh nghiệp vụ, quyền, UI hoặc kiểm thử |
| `MOCK` | UI đang dùng dữ liệu giả, chưa phản ánh dữ liệu canonical |
| `WIP/VERIFY` | Source đang thay đổi hoặc cần chạy tích hợp để xác minh |
| `INTERNAL` | Hạ tầng/nội bộ; không nhất thiết cần màn hình người dùng |
| `ABSENT` | Chưa thấy API hoặc implementation tương ứng trong source đã kiểm tra |

Trong bảng: `✓` = có, `—` = chưa có/không áp dụng, `WIP` = đang phát triển.

### 1.3 Thứ tự ưu tiên nguồn sự thật

Khi tài liệu mâu thuẫn với hệ thống, dùng thứ tự sau:

1. Security và authorization trong Backend.
2. Controller + DTO + service + entity/migration Backend.
3. OpenAPI sinh từ đúng phiên bản Backend đang deploy.
4. FE service/type/hook.
5. UI hiển thị.
6. Tài liệu cũ, ảnh chụp và mô tả trao đổi.

Không suy đoán field bị thiếu từ field khác. Ví dụ, không dùng `createdAt`, `updatedAt` hoặc ngày Sprint thay cho `startDate`/`dueDate` của Jira Task.

---

## 2. Tổng quan nghiệp vụ

SAGA là hệ thống hỗ trợ quản lý và đánh giá liên tục cho dự án học tập theo nhóm. Hệ thống kết nối dữ liệu học vụ, Jira, GitHub, minh chứng làm việc và đánh giá chéo để:

- quản lý học kỳ, môn học, syllabus, lớp, course và roster;
- tổ chức nhóm, trưởng nhóm và dự án của sinh viên;
- đồng bộ Sprint/Task từ Jira và Commit từ GitHub;
- duy trì liên kết truy xuất nguồn gốc `Student → Task → Commit/Evidence`;
- trực quan hóa quan hệ bằng graph Neo4j;
- tính tỷ lệ đóng góp theo bốn nhóm tiêu chí và điều chỉnh bằng peer review;
- cho giảng viên xem tiến độ, cấu hình trọng số và đối soát kết quả đóng góp;
- cung cấp AI-assisted Commit Intelligence và phân loại học thuật tư vấn trên Task/Commit, với bằng chứng bất biến, kết quả có cấu trúc và Lecturer review, tách biệt khỏi tỷ lệ đóng góp và điểm học phần;
- lưu audit, trạng thái đồng bộ và sự kiện realtime.

### 2.1 Những gì SAGA không được diễn giải sai

- Số task, commit, phiên làm việc hoặc minh chứng **không tự động là điểm học phần**.
- Số commit không đồng nghĩa trực tiếp với chất lượng hoặc tỷ lệ đóng góp.
- Graph là lớp giải thích/truy xuất quan hệ, không phải nguồn tính điểm độc lập.
- AI finding, confidence, proposal phân loại hoặc `HUMAN_REVIEW_REQUIRED` là bằng chứng tư vấn; không tự động kết luận gian lận, thay đổi tỷ lệ đóng góp hoặc tạo điểm học phần. Phân loại AI chỉ trở thành mapping có thẩm quyền sau Lecturer review theo rule Backend.
- `Project Type` là metadata phân loại dự án, không phải tiêu chí `CODE/TEST/DOCUMENT/RESEARCH`.
- “Slicing Pie” là tên phương pháp phân bổ tương đối; không dịch máy thành “lát cắt” trên UI nghiệp vụ.

### 2.2 Danh mục năng lực sản phẩm chuẩn

Bảng này là checklist chức năng cấp cao dành cho tài liệu báo cáo. Cột “Đầu ra nghiệp vụ” mô tả kết quả mong đợi, không phải trạng thái implementation hiện tại.

| Mã phạm vi | Năng lực sản phẩm | Đầu ra nghiệp vụ bắt buộc |
| --- | --- | --- |
| SCOPE-01 | Xác thực và định danh | Session an toàn; role/status chính xác; profile; liên kết nhiều danh tính Jira/GitHub; reset/setup password; step-up cho thao tác nhạy cảm; realtime account ban/unban qua SSE `GET /api/users/me/events` (`ACCOUNT_DISABLED`) kết hợp HTTP 403 `ACCOUNT_DISABLED` fallback, đóng SSE, clear auth state & query cache, chuyển hướng `/account-disabled` |
| SCOPE-02 | Quản trị học vụ | Học kỳ active; Subject; Syllabus có version/lifecycle/structure; Academic Class; Course; Lecturer assignment; roster có preview/confirm |
| SCOPE-03 | Quản lý nhóm | Danh sách nhóm theo course; import; Team Leader; chuyển thành viên; quan hệ Student–Team–Course rõ ràng |
| SCOPE-04 | Khởi tạo dự án | Một project gắn đúng team/course; tên/mô tả; Project Type tùy chọn; policy Leader; trạng thái chưa/có project rõ ràng |
| SCOPE-05 | Tích hợp công cụ | Kết nối đa nguồn Jira (Multi-Jira Sources) và GitHub installation/repositories; personal identity mapping; reconnect/soft disconnect; quy trình chuyển giao công việc an toàn Failover Wizard; repository role canonical |
| SCOPE-06 | Đồng bộ và realtime | Initial/manual/incremental/webhook sync; sync status và last sync; SSE invalidation; REST refetch; khôi phục sau reconnect |
| SCOPE-07 | Quản lý Sprint và Task | Kanban, Backlog, Timeline; sprint lifecycle; task CRUD/transition; assignee; priority; story point; label; type; parent/subtask; start/due date |
| SCOPE-08 | Theo dõi GitHub | Commit repository/branch/author/time/message; filter/search; linked/unlinked state; chỉ mô tả PR/review/comment là end-to-end khi provider ingestion, API và UI tương ứng đã hoạt động |
| SCOPE-09 | Truy xuất Task–Commit | Liên kết canonical tự động và các cơ chế đối soát được hỗ trợ; lọc repository/branch; Flow; Audit Matrix; sticky inspector; cảnh báo Done thiếu evidence; không coi manual-link mutation là đã có nếu chưa tồn tại API/UI xác thực |
| SCOPE-10 | Minh chứng công việc | Work session server-side; file; web link; commit SHA/PR confirmation; audit; step-up; không mất trạng thái khi reload |
| SCOPE-11 | Tiến độ và dashboard | Project summary; member detail; task status; sprint progress; Task–Commit activity; freshness; insight thay vì chỉ đếm dữ liệu |
| SCOPE-12 | Graph truy xuất nguồn gốc | Graph project/student/sprint/attribution/peer-review; node/edge canonical; filter; tooltip; anomaly flag có giải thích và quyền theo role |
| SCOPE-13 | Peer Review | Rubric; candidates; submit; list/result; giới hạn theo sprint/team; chống tự đánh giá hoặc submit sai đối tượng theo rule BE |
| SCOPE-14 | Contribution | Bốn nhóm CODE/TEST/DOCUMENT/RESEARCH; mode COURSE/PROJECT_GROUP; evidence eligibility; peer coefficient; normalization; warning; kết quả cuối do Backend tính canonical và Lecturer xem ở chế độ chỉ đọc |
| SCOPE-15 | Quản trị và kiểm toán | User status; audit log; integration/sync observability; lỗi có mã; dữ liệu mock không xuất hiện trong bản production/report |
| SCOPE-16 | Chất lượng hệ thống | Authorization server-side; isolation theo account/course/project; timezone nhất quán; accessibility/responsive; test; không N+1/refetch storm |
| SCOPE-17 | Trung tâm thông báo & Web Push | Hộp thư thông báo canonical (REST); User-scoped SSE; Firebase Web Push FCM; bell badge/preview/sheet; broadcast Admin; targeted notification Giảng viên theo 4 scope; Idempotency-Key và điều phối đăng xuất tập trung |
| SCOPE-18 | AI-assisted Intelligence, Academic Review và BYOK | Phân tích Commit, Task và Risk theo project/course với durable run, exact-SHA evidence snapshot, provider-decision metadata, structured-result validation; hỗ trợ proposal phân loại theo Syllabus cùng Lecturer review; BYOK Course Credential phân định khóa PRIMARY (bắt buộc cho tự động hóa Commit/Task/Risk, không fallback khóa nền tảng khi lỗi/hết quota) và SECONDARY (tùy chọn cho Secondary Brain đối chứng độc lập, không tái sử dụng PRIMARY/platform); allowPlatformFallback chỉ áp dụng cho yêu cầu thủ công hỗ trợ; trạng thái khóa chuẩn UNVERIFIED, ACTIVE, DEGRADED, INVALID, REVOKED |

---

## 3. Vai trò và phạm vi quyền

| Vai trò | Phạm vi chính | Quyền tiêu biểu | Giới hạn quan trọng |
| --- | --- | --- | --- |
| `ADMIN` | Quản trị học vụ và tài khoản | Semester, Subject, Syllabus, Class, Course, Roster, User status, Audit log | Không mặc định được xem dữ liệu project/student graph nếu policy endpoint từ chối |
| `LECTURER` | Course được phân công | Xem course/roster/progress, quản lý team, cấu hình trọng số, xem graph, đánh giá đóng góp | Chỉ course/project được phân công; không thay sinh viên thao tác evidence cá nhân |
| `STUDENT` — Leader | Team/project hiện tại | Tạo project, cấu hình tích hợp, sync, quản lý Jira task/sprint theo policy, xem tiến độ team | Quyền mutation phải được BE xác thực; UI không phải hàng rào bảo mật |
| `STUDENT` — Member | Dữ liệu team và cá nhân | Xem task/commit/graph, làm evidence, work session, peer review | Không được cấu hình project/integration hoặc xem dashboard leader-only nếu policy cấm |

### 3.1 Quy tắc authorization phải giữ

- Tất cả endpoint dùng session/cookie phải kiểm tra current authenticated user ở Backend.
- Đọc Task/Sprint/Commit/Graph của project: sinh viên phải là active team member; giảng viên phải được phân course; không tự cấp quyền cho Admin nếu policy hiện hành không cho phép.
- Progress tổng hợp project: theo source hiện tại dành cho giảng viên được phân công hoặc active Team Leader; thành viên thường không được suy rộng quyền.
- Peer review candidates/submit: sinh viên thuộc team; danh sách kết quả có thể được xem bởi thành viên team, giảng viên được phân hoặc Admin theo policy.
- Contribution result: Lecturer/Admin được xem và đối soát; FE không cung cấp thao tác ghi đè tỷ lệ cuối.
- Tạo project và cấu hình integration/sync: phải kiểm tra vai trò Leader ở Backend.

---

## 4. Kiến trúc dữ liệu và canonical state

```text
Jira / GitHub
    ↓ webhook hoặc manual sync
Backend projection (cơ sở dữ liệu quan hệ của SAGA)
    ├─ REST DTO canonical cho FE
    ├─ Task ↔ Commit link canonical
    ├─ Evidence / Work session / Confirmation
    └─ Neo4j projection cho truy xuất graph

SSE project events
    ↓ chỉ là tín hiệu invalidation
FE invalidate/refetch REST
    ↓
UI render dữ liệu canonical mới nhất
```

### 4.1 Nguồn canonical theo loại dữ liệu

| Dữ liệu | Nguồn canonical cho FE | Không được làm |
| --- | --- | --- |
| Auth/session/role | `/api/auth/me` | Giữ context tài khoản cũ sau logout/login |
| Course/team/project hiện tại | Student/Lecturer REST endpoints | Dựa hoàn toàn vào localStorage của user trước |
| Jira Task/Sprint | Project Task/Sprint REST projection | Dùng payload SSE hoặc tự đoán từ UI |
| Git commit | Project commits REST | Hard-code/mock trong dashboard production |
| Task ↔ Commit | `/task-commit-links` hoặc `/tasks/{taskId}/commits` | Parse Jira key trong message như canonical |
| Branch membership | Snapshot `branchNames`/`REACHABLE_AT_SYNC` từ BE | Chỉ dựa vào `headRef` của merge commit |
| Work session đang mở | Work-session REST từ server | Tự stop khi đóng drawer hoặc lưu timer canonical ở localStorage |
| Contribution/evaluation | Evaluation API Backend | FE tự tạo điểm từ số commit |
| Graph | Graph API Backend | FE tự dựng graph giả từ danh sách task/commit khi đã có canonical graph API |

### 4.2 Realtime contract

Endpoint: `GET /api/projects/{projectId}/events`, `Content-Type: text/event-stream`, dùng `EventSource` với credentials.

| Event | Hành vi FE bắt buộc |
| --- | --- |
| `READY` | Refetch dữ liệu project hiện tại; khi reconnect nhận lại `READY` cũng refetch |
| `TASKS_CHANGED` | Invalidate/refetch task list và task detail liên quan |
| `SPRINTS_CHANGED` | Invalidate/refetch sprint list/detail |
| `COMMITS_CHANGED` | Invalidate/refetch commits |
| `TASK_LINKS_CHANGED` | Refetch canonical task–commit links/inspector |
| `TASK_EVIDENCE_CHANGED` | Refetch task evidence/work session/detail liên quan |
| `SYNC_STATUS_CHANGED` | Refetch sync status |

Payload SSE không phải dữ liệu để render trực tiếp. FE phải chống invalidation trùng lặp/coalesce request và không polling liên tục khi SSE hoạt động.

---

## 5. Luồng nghiệp vụ tổng thể

### 5.1 Khởi tạo học vụ

1. Admin tạo/chọn học kỳ active.
2. Admin tạo Subject và các phiên bản Syllabus.
3. Syllabus được cập nhật cấu trúc, publish hoặc archive.
4. Admin tạo Academic Class và Course, gán lecturer phù hợp.
5. Admin nhập roster bằng template → preview → confirm, hoặc thêm/xóa sinh viên thủ công.

### 5.2 Tổ chức course và team

1. Lecturer xem course/roster/progress được phân công.
2. Lecturer tải template team, import preview rồi confirm.
3. Lecturer có thể đổi Team Leader hoặc chuyển member giữa team.
4. Student chọn course; FE phải reset context/query theo tài khoản và course hiện tại.

### 5.3 Khởi tạo project và integration

1. Team Leader tạo project cho course/team.
2. `Project Type` là tùy chọn ở contract BE; description cũng có thể null nếu BE cho phép.
3. Leader kết nối Jira board và GitHub installation/repositories.
4. Repo được gán role canonical `FRONTEND`, `BACKEND` hoặc `OTHER`.
5. Sync ban đầu tạo projection Task/Sprint/Commit/link và graph có thể được dựng lại từ dữ liệu đó.
6. Hệ thống hỗ trợ đa nguồn Jira (`Multi-Jira Sources`): một dự án có thể kết nối nhiều Jira Workspace/Site song song (`status: ACTIVE, REVOKED, FAILED`).
   - Student và Lecturer phải chọn rõ nguồn Jira đang xem; Kanban, Backlog, Graph/Pipeline, biểu đồ Sprint và đánh giá chéo chỉ dùng Task/Sprint của nguồn đó.
   - Đổi nguồn phải xóa Sprint/Task selection cũ để không giữ dữ liệu của Jira Site trước; tạo Task/Sprint phải gửi đúng `jiraIntegrationId` đang chọn.
   - Lecturer chỉ có quyền đọc dữ liệu dự án được phân công. Trong khi endpoint integration summary chưa cho Lecturer đọc, FE dựng danh sách nguồn từ provenance `task.source`; BE cần mở endpoint source-summary read-only theo quyền `requireReader` để vẫn liệt kê được nguồn chưa có task.
7. Khi ngắt kết nối một Jira source (`DELETE`), Backend chỉ thu hồi ủy quyền (`soft-revoke`), toàn bộ card/task và commit đối soát lịch sử của source đó vẫn được lưu giữ an toàn trong SAGA.
8. Khi chuyển giao công việc giữa các nguồn Jira, Leader kích hoạt `Failover Wizard`:
   - Chọn nguồn đích (Target Jira Source đang ở trạng thái `ACTIVE`).
   - Lọc các task dở dang (`TODO`, `IN_PROGRESS`, `IN_REVIEW`) hoặc task tùy chọn qua bước Preview.
   - Xác nhận chuyển giao: Backend xử lý bất đồng bộ trả mã `202 Accepted` kèm `runId`; FE polling định kỳ 2.5s.
   - Nguyên tắc chống trùng lặp (Anti-Duplication): Các task cũ được chuyển trạng thái `superseded = true`, task mới được tạo mang cờ `migratedFrom`.
   - Cơ chế Reconcile: Đối với các item gặp trạng thái bất định `REMOTE_OUTCOME_UNKNOWN` do timeout mạng, FE cung cấp luồng "Xác minh & Liên kết (Verify & Bind)" thay vì tạo lặp; tuyệt đối không sao chép mù bằng chứng giữa hai nguồn.

### 5.4 Thực thi Sprint

1. Người dùng xem Kanban, Backlog hoặc Timeline theo sprint.
2. Task phân biệt `STORY`, `TASK`, `BUG`, `EPIC`, `SUBTASK`, `REQUEST` từ `issueTypeName`/mapping canonical.
3. Subtask chỉ được lồng đúng dưới parent khi BE trả quan hệ parent; không đoán parent theo Jira key.
4. Tạo nhanh chỉ yêu cầu summary nếu Jira/BE cho phép default; form đầy đủ dùng cho chỉnh các thuộc tính nâng cao.
5. Create/Patch/Transition/Move sprint xong phải invalidate và refetch dữ liệu canonical.
6. `startDate`/`dueDate` dùng định dạng `YYYY-MM-DD`, có thể null; clear dùng cờ clear tương ứng nếu contract yêu cầu.

### 5.5 Minh chứng và phiên làm việc

1. User bấm Start → Backend tạo hoặc trả lại session `OPEN` hiện có (idempotent).
2. Đóng drawer, chuyển tab hoặc reload **không** gọi stop.
3. Khi mở lại task, FE lấy work sessions từ server, tìm session `OPEN` của current user và tính timer từ `startedAt`/server time.
4. Chỉ bấm Dừng/Hoàn thành làm việc mới gọi endpoint stop với `sessionId`.
5. Tài liệu có thể là web link hoặc file; upload/download/delete đều do Backend kiểm tra quyền.
6. Contribution confirmation có thể chứa commit SHA và pull-request URL làm bằng chứng.

> Contract source hiện tại có `GET /api/tasks/{taskId}/work-sessions` trả danh sách gồm session `OPEN`; chưa thấy endpoint riêng `/work-sessions/active`. Nếu môi trường deploy đã bổ sung endpoint riêng thì cần đồng bộ source/OpenAPI trước khi đổi FE.

### 5.6 Step-up authentication khi xác nhận đóng góp

```text
POST contribution-confirmations
    └─ 403 STEP_UP_REQUIRED
         └─ FE thông báo cần xác thực nâng cao và mở password dialog
              └─ POST /api/auth/reauth/password
                   ├─ sai password: hiện lỗi trong dialog
                   └─ stepUp=true: retry đúng request ban đầu đúng 1 lần
```

- Không redirect login.
- Không lưu password.
- Không retry vô hạn.
- Nếu retry vẫn `STEP_UP_REQUIRED`, dừng và báo lỗi.
- BE còn có `/reauth/webauthn`, nhưng FE hiện chỉ tích hợp password.

### 5.7 Đối soát và đánh giá

1. Task–Commit link canonical lấy batch theo project/repository/branch để tránh N+1.
2. Pipeline Flow dùng để hiểu Member → Task → Commit.
3. Audit Matrix dùng để rà task thiếu commit/thừa bất thường; hai view dùng chung filter và inspector.
4. Lecturer cấu hình bốn nhóm trọng số `CODE/TEST/DOCUMENT/RESEARCH` ở mức course hoặc project group.
5. Peer review theo sprint điều chỉnh tỷ lệ tương đối; tỷ lệ cuối do Backend tính và chuẩn hóa.

---

## 6. Danh mục domain và enum canonical

| Nhóm | Giá trị canonical |
| --- | --- |
| Account role | `STUDENT`, `LECTURER`, `ADMIN` |
| Account status | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING` |
| Semester period | `UPCOMING`, `IN_PROGRESS`, `COMPLETED`; tách biệt với cờ platform `active` |
| Enrollment | `ACTIVE`, `WITHDRAWN`, `COMPLETED` |
| Team role | `LEADER`, `MEMBER`, `MENTOR` |
| Task status | `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED` |
| Task type | `STORY`, `TASK`, `BUG`, `EPIC`, `SUBTASK`, `REQUEST` |
| Priority | `LOWEST`, `LOW`, `MEDIUM`, `HIGH`, `HIGHEST` |
| Work session | `OPEN`, `STOPPED` |
| Contribution mode | `COURSE`, `PROJECT_GROUP` |
| Contribution criterion | `CODE`, `TEST`, `DOCUMENT`, `RESEARCH` |
| Repository role | `FRONTEND`, `BACKEND`, `OTHER` |
| Sync status | `RUNNING`, `SUCCEEDED`, `FAILED` |
| Sync type | `FULL`, `INCREMENTAL`, `RECONCILE`, `INITIAL`, `WEBHOOK_REFRESH` |
| Link source | Tự động, thủ công hoặc reconciliation theo enum/DTO BE hiện hành |
| Trace source | `COMMIT_MESSAGE`, `BRANCH_NAME`, `PR_TITLE`, `PR_BODY`, `MANUAL`, `RECONCILIATION` |
| Admin integration gap | `PROJECT`, `JIRA`, `GITHUB`, `BOTH` |

### 6.1 Thực thể chính

- Academic: Semester, Subject, Syllabus Version/Structure, Academic Class, Course, Enrollment.
- Identity: User Account, Student Profile, Lecturer Profile, Jira/GitHub identity mapping.
- Project: Project Type, Project, Team, Team Member.
- Integration: Jira/GitHub connection, repository, sprint, task, commit, pull request, review, comment, sync/webhook log.
- Traceability: Task–Commit, Task–PR, issue links và lịch sử mapping.
- Evidence: Work Session, Web Link, File, Contribution Confirmation.
- Assessment: Peer Review, Rubric, Contribution Weight/Result.
- Graph: Graph processing run và Neo4j projection.
- Governance: Audit log, notification/outbox, warning/security records.

### 6.2 Project Type

Project Type dùng để phân loại hướng dự án, không điều khiển trực tiếp tỷ trọng Code/Test/Document/Research. Catalog hiện có thể chứa các code như `DESIGN_ARCHITECTURE`, `RESEARCH`, `TESTER`, `DOCUMENT`.

Điểm cần chỉnh contract/UI:

- BE create project chấp nhận `projectTypeId = null`; FE không nên bắt buộc chọn hoặc tự chọn item đầu tiên.
- FE type và form phải chấp nhận project type/description nullable theo DTO BE.
- Chưa thấy Project update/delete public API trong source; không hiển thị edit/delete như chức năng hoàn chỉnh nếu chưa có contract.

### 6.3 Quy tắc phân loại đóng góp

- Nhãn reserved phải match chính xác: `saga:code`, `saga:test`, `saga:document`, `saga:research`.
- Không fuzzy match theo title, issue type hoặc nội dung mô tả.
- Nếu task có hơn một reserved label thì ambiguous và không tự gán criterion.
- Task cần `DONE` và thuộc sprint hợp lệ để đi vào kết quả theo rule hiện hành.
- `DOCUMENT` và `RESEARCH` cần file hoặc web link phù hợp; commit chỉ là một dạng evidence, không tự sinh điểm.
- Không redistribution tỷ trọng của nhóm tiêu chí không có dữ liệu nếu công thức Backend không quy định.
- Kết quả peer review được áp dụng sau base contribution và chuẩn hóa tổng theo contract Backend.

---

## 7. Ma trận chức năng và mức độ tích hợp

### 7.1 Authentication, profile và identity

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| AUTH-001 | CSRF, current session, login, logout | ✓ | ✓ | ✓ | `DONE`; logout phải clear toàn bộ user-scoped cache/context |
| AUTH-002 | Register, setup password | ✓ | ✓ | ✓ | `DONE` |
| AUTH-003 | Forgot/reset password | ✓ | ✓ | ✓ | `DONE` |
| AUTH-004 | Step-up bằng password | ✓ | ✓ | ✓ | `DONE`; retry protected request tối đa một lần |
| AUTH-005 | Step-up bằng WebAuthn | ✓ | — | — | `BE_ONLY` |
| PROF-001 | Xem/cập nhật profile | ✓ | ✓ | ✓ | `DONE` |
| ID-001 | Xem Jira/GitHub identity cá nhân | ✓ | ✓ | ✓ | `DONE` |
| ID-002 | Link/callback/set primary/disconnect identity | ✓ | ✓ | ✓ | `DONE` |

### 7.2 Admin academic và vận hành

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| ADM-001 | Semester CRUD-lite và active semester | ✓ | ✓ | ✓ | `DONE` |
| ADM-002 | Subject CRUD-lite | ✓ | ✓ | ✓ | `DONE` (BE phân trang `page, size, total, items`; FE cố định `size=50` bảo toàn trải nghiệm danh mục) |
| ADM-003 | Syllabus version, structure, publish, archive | ✓ | ✓ | ✓ | `DONE` |
| ADM-004 | Academic Class create/list/detail/update | ✓ | ✓ | ✓ | `DONE` (BE phân trang `page, size, total, items`; FE cố định `size=50`) |
| ADM-005 | Course create/list/detail/update | ✓ | ✓ | ✓ | `DONE` (BE phân trang `page, size, total, items`; FE cố định `size=50`) |
| ADM-006 | Lecturer directory | ✓ | ✓ | ✓ | `DONE` (BE hỗ trợ phân trang `/api/admin/lecturers/paged` kèm endpoint dropdown) |
| ADM-007 | Roster template/list/import preview-confirm/add/remove/cancel invite | ✓ | ✓ | ✓ | `DONE` |
| ADM-008 | User list/detail/status | ✓ | ✓ | ✓ | `DONE` (GET `/api/admin/users`, GET `/api/admin/users/{userId}`, PATCH `/api/admin/users/{userId}/status`; SSE `ACCOUNT_DISABLED` & HTTP 403 fallback) |
| ADM-009 | Audit log list/filter | ✓ | ✓ | ✓ | `DONE` (GET `/api/admin/audit-logs`) |
| ADM-010 | Admin dashboard KPI/chart/recent activity | ✓ | ✓ | ✓ | `DONE`; summary canonical theo semester gồm KPI, weekly timeline, unconnected teams, integration pulse và cache freshness; đổi học kỳ giữ snapshot gần nhất, hủy request lỗi thời, prefetch theo intent và cache FE 5 phút; Recharts được lazy-load; recent audit dùng API riêng; không mock provider health/project health/sprint milestone chưa có contract |
| ADM-011 | Dev email test, landing, privacy, terms | ✓ | — | — | `INTERNAL`/server pages |

### 7.3 Lecturer course, team và contribution

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| LEC-001 | Course list/detail/roster/progress | ✓ | ✓ | ✓ | `DONE` |
| LEC-002 | Team list/template/import preview-confirm | ✓ | ✓ | ✓ | `DONE`; list/detail dùng trạng thái nghiệp vụ, không hiển thị UUID nội bộ của project/team |
| LEC-003 | Đổi Team Leader | ✓ | ✓ | ✓ | `DONE` |
| LEC-004 | Chuyển member giữa team | ✓ | ✓ | ✓ | `DONE` |
| LEC-005 | Cấu hình contribution weights theo course | ✓ | ✓ | ✓ | `DONE` |
| LEC-006 | Chọn mode `COURSE`/`PROJECT_GROUP` | ✓ | ✓ | ✓ | `DONE` |
| LEC-007 | Xem/sửa project group weights | ✓ | ✓ | ✓ | `DONE` |
| LEC-008 | Xem contribution evaluation | ✓ | ✓ | ✓ | `DONE` |
| LEC-009 | Contribution evaluation read-only | ✓ | ✓ | ✓ | `DONE`; Lecturer xem tỷ lệ canonical, minh chứng và warning; FE không cho ghi đè tỷ lệ cuối |
| LEC-010 | Lecturer canonical graph | ✓ | ✓ | ✓ | `DONE/VERIFY`; đủ năm mode canonical và unit/component test, còn E2E authorization/latency với dữ liệu lớn |
| LEC-011 | Lecturer course dashboard CURRENT_SPRINT | ✓ | ✓ | ✓ | `IN_PROGRESS`; Tổng quan lớp dùng một `GET /api/lecturer/courses/{courseId}/dashboard`, render `summary`/`risk`/`taskStatusTotals` đúng contract; toàn bộ chart mặc định dùng Sprint hiện tại mới nhất do API trả về, mỗi chart chỉ có bộ lọc Nhóm độc lập, nhỏ gọn và không làm đổi KPI toàn lớp hoặc chart khác; UI có heatmap, tooltip chi tiết, liên kết trạng thái hover với danh sách nhóm và hàng ưu tiên một cột theo risk/reason; thiếu ngày activity không bị đổi thành 0; FE không tự chấm lại risk, không N+1, không hiện reminder; còn E2E với dữ liệu lớp thật |

### 7.4 Student course, project và integration

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| STU-001 | Course list và chọn course context | ✓ | ✓ | ✓ | `DONE`; phải reset khi đổi tài khoản |
| STU-002 | Xem team của course | ✓ | ✓ | ✓ | `DONE` |
| PRJ-001 | Xem/tạo project của team | ✓ | ✓ | ✓ | `PARTIAL`; FE đang ép project type/description hơn contract BE |
| PRJ-002 | Project type catalog | ✓ | ✓ | ✓ | `PARTIAL`; phải coi là optional metadata |
| PRJ-003 | Update/delete project | — | — | Không nên coi là xong | `ABSENT` theo controller hiện tại |
| INT-001 | Xem trạng thái Jira/GitHub project integration | ✓ | ✓ | ✓ | `DONE` |
| INT-002 | GitHub connect/reconnect/repository selection/disconnect | ✓ | ✓ | ✓ | `DONE` |
| INT-003 | Jira connect/sites/projects/boards/config/disconnect | ✓ | ✓ | ✓ | `DONE`; hỗ trợ đa nguồn Jira (Multi-Jira Sources), đồng bộ từng nguồn (202), kết nối lại và ngắt kết nối mềm (soft disconnect bảo toàn dữ liệu) |
| INT-004 | GitHub repository role | ✓ | ✓ | ✓ | `PARTIAL`; FE đang cho thêm `FULLSTACK/DOCS` nhưng BE chỉ có `FRONTEND/BACKEND/OTHER` |
| INT-005 | Jira Failover Wizard & Reconciliation | ✓ | ✓ | ✓ | `DONE`; quy trình chuyển giao công việc 4 bước (Target Selection -> Preview/Filter -> Confirm -> Progress Polling 202/runId), xử lý trạng thái bất định `REMOTE_OUTCOME_UNKNOWN` qua Verify & Bind modal |

### 7.5 Jira Task, Sprint và Git Commit

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| TASK-001 | Task list/options/detail | ✓ | ✓ | ✓ | `DONE`; hỗ trợ đa nguồn Jira (`jiraIntegrationId`), hiển thị badge Lịch sử (`superseded`) và liên kết nguồn/đích chuyển giao (`migratedFrom`, `migratedTo`) |
| TASK-002 | Task create/patch/delete | ✓ | ✓ | ✓ | `DONE`; quick create chỉ gửi field tối thiểu, form tạo chi tiết cho phép chọn nguồn Jira khi dự án có từ 2 nguồn active trở lên |
| TASK-003 | Task transition và transition options | ✓ | ✓ | ✓ | `DONE` |
| TASK-004 | Move task vào/ra sprint | ✓ | ✓ | ✓ | `DONE` |
| TASK-005 | Task type và Subtask parent | ✓ | ✓ | ✓ | `DONE` (BE & FE đồng bộ `parentTask`, `subtasks`, `parentTaskId`, `clearParent`, endpoint `GET /tasks/parent-options` phân trang và UI chọn Task cha/Subtasks) |
| TASK-006 | Start Date/Due Date create-edit-clear-hydrate | ✓ | ✓ | ✓ | `VERIFY`; cần xác minh deploy trả đủ hai key kể cả null |
| TASK-007 | Kanban/Backlog/Timeline | ✓ | ✓ | ✓ | `DONE`; card chỉ cần due date, backlog cảnh báo giống Jira; Task được scope theo Jira source đang chọn ở cả Student và Lecturer Pipeline |
| SPR-001 | Sprint list/detail/create/update/delete | ✓ | ✓ | ✓ | `PARTIAL`; FE đã scope theo source bằng `jiraIntegrationId` + Sprint options và reset selection khi đổi Site. Lecturer tạm dựng source selector từ `task.source` vì integration summary dùng quyền thành viên. BE cần cho Lecturer đọc source summary theo `requireReader`, lọc `GET /projects/{id}/sprints` đúng source và bổ sung `jiraIntegrationId/source` vào Sprint response để bỏ workaround FE |
| COM-001 | Project commit list/filter | ✓ | ✓ | ✓ | `DONE` (BE & FE đồng bộ phân trang `page, size, total, items`, nhận diện Merge Commit `isMerge`, `parentCount` và badge "Merge") |
| COM-002 | Commits của một task | ✓ | ✓ | ✓ | `DONE`; lazy load cho inspector |
| COM-003 | Canonical batch task–commit links theo repo/branch | ✓ | ✓ | ✓ | `DONE/VERIFY`; filter phải dựa response BE, không parse message |
| COM-004 | Repository branch list | ✓ | ✓ | ✓ | `DONE` |
| COM-005 | Sprint activity aggregation Task + Commit | ✓ | — | — | `BE_ONLY`; FE chart tuần hiện tự group commit, chưa dùng endpoint này |

### 7.6 Sync và realtime

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| SYNC-001 | Manual sync | ✓ | ✓ | ✓ | `DONE` |
| SYNC-002 | Sync status/last synced time | ✓ | ✓ | ✓ | `DONE` |
| SYNC-003 | GitHub/Jira webhook ingest | ✓ | N/A | N/A | `INTERNAL`; không cần UI request trực tiếp |
| RT-001 | Project SSE connection | ✓ | ✓ | ✓ | `DONE/VERIFY` |
| RT-002 | Event-specific REST invalidation | ✓ | ✓ | ✓ | `VERIFY`; cần integration test reconnect và coalescing |
| RT-003 | Realtime indicator/fallback | ✓ | ✓ | ✓ | `DONE`; không gọi trạng thái READY là dữ liệu đã đồng bộ |

### 7.7 Evidence và work session

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| EVD-001 | Work session list/resume | ✓ | ✓ | ✓ | `DONE` theo list có session OPEN; endpoint `/active` riêng chưa thấy trong source |
| EVD-002 | Start idempotent | ✓ | ✓ | ✓ | `DONE` |
| EVD-003 | Stop bằng taskId/sessionId | ✓ | ✓ | ✓ | `DONE`; chỉ stop do user chủ động |
| EVD-004 | Web link list/add/delete | ✓ | ✓ | ✓ | `DONE` |
| EVD-005 | File list/upload/download/delete | ✓ | ✓ | ✓ | `DONE` |
| EVD-006 | Contribution confirmation SHA/PR | ✓ | ✓ | ✓ | `DONE`; selection ở UI chỉ là draft đến khi bấm xác nhận |
| EVD-007 | Step-up + retry confirmation | ✓ | ✓ | ✓ | `DONE/VERIFY` với test 403 → reauth → retry một lần |
| EVD-008 | Task Evidence unified aggregation | ✓ | ✓ | ✓ | `DONE` (`GET /api/projects/{projectId}/tasks/{taskId}/evidence` gom nhóm hoặc phân trang) |
| EVD-009 | Task Work Session & Commit Timeline | ✓ | ✓ | ✓ | `DONE` (`GET /api/projects/{projectId}/tasks/{taskId}/work-session-timeline`, tích hợp popup timeline đối soát phiên làm việc và commit cho Sinh viên trong IssueDetailsModal, Giảng viên trong MemberProgressSheet và PipelineTaskInspector) |

### 7.8 Progress, Graph, Peer Review và Contribution

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| PROG-001 | Project progress summary | ✓ | ✓ | ✓ | `DONE`; quyền leader/lecturer theo policy |
| PROG-002 | Member progress detail | ✓ | ✓ | ✓ | `DONE`; drawer chỉ là inspector, không thay dữ liệu dashboard tổng |
| GRAPH-001 | Project graph overview | ✓ | ✓ | ✓ | `DONE/VERIFY`; còn E2E dữ liệu lớn và authorization |
| GRAPH-002 | Student contribution graph | ✓ | ✓ | ✓ | `DONE/VERIFY`; lazy query theo mode/student/sprint |
| GRAPH-003 | Sprint activity graph | ✓ | ✓ | ✓ | `DONE/VERIFY`; Lecturer Graph mặc định mở Sprint activity của Sprint `active` (fallback Sprint đầu tiên), đổi nhóm tự reset về Sprint hiện tại; yêu cầu sprint trước khi gọi API |
| GRAPH-004 | Attribution graph | ✓ | ✓ | ✓ | `DONE/VERIFY`; hỗ trợ anomaly filter và subgraph params |
| GRAPH-005 | Sprint peer-review graph | ✓ | ✓ | ✓ | `DONE/VERIFY`; yêu cầu sprint trước khi gọi API |
| PEER-001 | Default/team rubric | ✓ | ✓ | ✓ | `DONE`; Student fallback default rubric và Lecturer dùng team rubric |
| PEER-002 | Sprint review candidates | ✓ | ✓ | ✓ | `DONE`; Student UI khóa theo review window/trạng thái |
| PEER-003 | Submit/list peer reviews | ✓ | ✓ | ✓ | `DONE/VERIFY`; Student submit một lần; Lecturer workspace hai cột (Tổng quan nhóm / sinh viên), giữ query `teamId`/`sprintId`/`revieweeId`; không đổi API, quyền hay công thức; còn E2E quyền và deadline |
| CONT-001 | Student contribution dashboard | ✓ | ✓ | ✓ | `DONE`; dùng evaluation data, tên/tooltip phải rõ |
| CONT-002 | Warning evidence/peer review | ✓ | ✓ | ✓ | `DONE`; diễn đạt là cảnh báo dữ liệu, không kết luận gian lận |
| PROG-003 | Team & Member Activity Heatmap | ✓ | ✓ | ✓ | `DONE`; `GET /api/courses/{courseId}/teams/{teamId}/heatmap`, hỗ trợ toàn nhóm hoặc từng sinh viên, hiển thị lưới nhịp độ hoạt động GitHub-style |
| PROG-004 | Sprint Burndown Chart | ✓ | ✓ | ✓ | `DONE`; `GET /api/courses/{courseId}/teams/{teamId}/sprints/{sprintId}/burndown`, mặc định chọn Sprint `active` (fallback Sprint đầu tiên), đối soát đường lý tưởng với thực tế và số lượng task hoàn thành |

### 7.9 Thông báo, Web Push và Realtime Signal (Notification Center)

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| NOTIF-001 | REST notification inbox list & unread count | ✓ | ✓ | ✓ | `DONE`; REST inbox là canonical data source of truth |
| NOTIF-002 | Mark read single & mark all read | ✓ | ✓ | ✓ | `DONE`; optimistic update và refetch canonical state |
| NOTIF-003 | Header notification bell, badge, preview popover & sheet | ✓ | ✓ | ✓ | `DONE`; áp dụng cho STUDENT, LECTURER, ADMIN; kiểm tra internal actionUrl |
| NOTIF-004 | User-scoped SSE (`/api/users/me/events`) | ✓ | ✓ | ✓ | `DONE`; UserRealtimeProvider duy nhất trong layout; READY và NOTIFICATION_CREATED chỉ invalidate query; ACCOUNT_DISABLED đóng SSE và logout |
| NOTIF-005 | Firebase Web Push registration & FCM token | ✓ | ✓ | ✓ | `DONE`; không popup xin quyền tự động; lưu installationId; foreground onMessage invalidate queries |
| NOTIF-006 | Unified logout orchestration | ✓ | ✓ | ✓ | `DONE`; DELETE push installation -> deleteToken -> logout -> clear state; revoke fail vẫn logout |
| NOTIF-007 | Admin system notification composer | ✓ | ✓ | ✓ | `DONE`; POST `/api/admin/notifications/system` kèm Idempotency-Key, live preview, dialog xác nhận |
| NOTIF-008 | Lecturer targeted notification composer | ✓ | ✓ | ✓ | `DONE`; 4 scope: all-courses, course, team, student; chọn qua CustomSelect; Idempotency-Key và chống 409 |

### 7.10 Trí tuệ nhân tạo (AI-assisted Intelligence & Analytics)

| ID | Nghiệp vụ | BE | FE data | UI | Trạng thái/Ghi chú |
| --- | --- | --- | --- | --- | --- |
| AI-001 | Durable analysis run, evidence snapshot, provider decision và idempotent submission | ✓ | ✓ | ✓ | `DONE`; lưu run/evidence/provider decision; exact duplicate reuse cùng run; FE gọi qua `CourseAiService` và `ProjectAiService` |
| AI-002 | Exact-SHA GitHub evidence và structured-result validation | ✓ | ✓ | ✓ | `DONE`; lấy changed-file manifest và patch hunks theo exact SHA; hiển thị trong `CommitAiIntelligenceModal` và đối soát Task–Commit |
| AI-003 | OpenAI provider adapter và lịch sử Commit Intelligence | ✓ | ✓ | ✓ | `DONE`; chấm điểm tin nhắn commit (0-100), chất lượng code diff, độ khớp Jira task; tích hợp trực tiếp vào `CommitDetailModal` |
| AI-004 | Task/Commit academic-classification proposal theo Course-pinned Syllabus | ✓ | ✓ | ✓ | `DONE`; snapshot đúng Syllabus version, PHASE và EXPECTED_DELIVERABLE; hiển thị trong `TaskAiIntelligenceSection` và `CommitAiIntelligenceModal` |
| AI-005 | Lecturer review và tổng hợp academic classification toàn khóa học | ✓ | ✓ | ✓ | `DONE`; `GET /api/lecturer/courses/{courseId}/ai/academic-classifications` tổng hợp đề xuất toàn lớp, lọc theo artifactType/status, phân trang, cho phép Lecturer thực hiện `CONFIRM`, `REJECT`, `CORRECT` trực tiếp trên Course AI Hub và chi tiết Task/Commit |
| AI-006 | Cấu hình BYOK & Quản lý API Key theo khóa học | ✓ | ✓ | ✓ | `DONE`; `/api/lecturer/courses/{courseId}/ai-settings` và `/ai-credentials/{role}`, lưu an toàn AES-GCM, hiển thị 4 số cuối và trạng thái khóa tại `/lecturer/courses/[courseId]/ai` |
| AI-007 | Báo cáo tiến độ khóa học & Xuất file Word (.docx) | ✓ | ✓ | ✓ | `DONE`; `/api/lecturer/courses/{courseId}/ai/progress-analyses`, sinh overview, highlights, concerns, blockers, recommendations và xuất stream .docx |
| AI-008 | Báo cáo tiến độ nhóm dự án & sinh viên | ✓ | ✓ | ✓ | `DONE`; `/api/projects/{projectId}/ai/team/progress-analyses` và `/students/{studentId}/progress-analyses`, tích hợp trung tâm AI sinh viên tại `/student/ai` |
| AI-009 | Nhận diện & Cảnh báo rủi ro (Risk Detection) | ✓ | ✓ | ✓ | `DONE`; `/api/projects/{projectId}/ai/team/risk-analyses`, `/students/{studentId}/risk-analyses`, `/tasks/{taskId}/risk-analyses`, hiển thị cấp độ rủi ro, nguyên nhân và đề xuất hành động |
| AI-010 | Đánh giá thông minh Task (Task Intelligence) | ✓ | ✓ | ✓ | `DONE`; `/api/projects/{projectId}/ai/tasks/{taskId}/intelligence-analyses`, hiển thị độ mạnh minh chứng, cảnh báo làm lệch đề bài `deviationDetected` trong `IssueDetailsModal` |

---

## 8. Registry API Backend và mức sử dụng FE

### 8.1 Auth/Profile/Personal integration

| Endpoint group | FE hiện tại |
| --- | --- |
| `GET /api/auth/csrf`, `GET /api/auth/me` | Đã dùng |
| `POST /api/auth/login`, `/register`, `/logout` | Đã dùng |
| `POST /api/auth/password/forgot`, `/reset`, `/setup` | Đã dùng |
| `POST /api/auth/reauth/password` | Đã dùng |
| `POST /api/auth/reauth/webauthn` | Chưa dùng |
| `GET/PATCH /api/users/me/profile` | Đã dùng |
| `GET /api/integrations/me` | Đã dùng |
| Personal GitHub/Jira link, callback, primary, delete | Đã dùng |

### 8.2 Admin

| Endpoint group | FE hiện tại |
| --- | --- |
| `/api/admin/semesters` và `/active` | Đã dùng |
| `/api/admin/subjects` và nested `/syllabi` | Đã dùng |
| `/api/admin/classes` | Đã dùng |
| `/api/admin/courses` | Đã dùng |
| `/api/admin/lecturers` | Đã dùng |
| `/api/admin/courses/{courseId}/roster/**` | Đã dùng |
| `/api/admin/users/**` | Đã dùng |
| `/api/admin/audit-logs` | Đã dùng (tích hợp API thật, phân trang, lọc timestamp, snapshot actor/class/team/project) |
| `/api/admin/dev/email-test` | Không cần UI production |

### 8.3 Lecturer và assessment

| Endpoint group | FE hiện tại |
| --- | --- |
| `/api/lecturer/courses`, `/{id}`, `/roster`, `/progress` | Đã dùng |
| `/api/lecturer/courses/{courseId}/dashboard` | Đã dùng cho trang Tổng quan lớp; FE chỉ render payload BE |
| `/api/lecturer/courses/{id}/teams/**` | Đã dùng |
| Contribution slice weights/config mode/team weights | Đã dùng |
| `/api/projects/{projectId}/group-weights` | Đã dùng |
| `/api/teams/{teamId}/contribution-evaluation` | Đã dùng |
| `/api/teams/{teamId}/contribution-override` | Backend còn contract; FE chủ động không tích hợp vì đã bỏ nghiệp vụ ghi đè thủ công |
| `/api/peer-review-rubrics/default` | Đã dùng làm fallback rubric cho Student |
| `/api/teams/{teamId}/peer-review-rubric` | Đã dùng cho Student và Lecturer |
| `/api/teams/{teamId}/sprints/{sprintId}/peer-reviews/candidates` | Đã dùng cho Student |
| `/api/teams/{teamId}/sprints/{sprintId}/peer-reviews` GET/POST | Đã dùng; Student submit, Lecturer xem danh sách |

### 8.4 Student project và provider integration

| Endpoint group | FE hiện tại |
| --- | --- |
| `/api/student/courses` | Đã dùng |
| `/api/student/courses/{courseId}/team` | Đã dùng |
| `/api/student/courses/{courseId}/dashboard` | Đã dùng (Student Personal Cockpit cho Member & Leader) |
| `/api/student/courses/{courseId}/project` GET/POST | Đã dùng |
| `/api/student/project-types` | Đã dùng nhưng cần sửa optional contract |
| `/api/projects/{projectId}/integrations` | Đã dùng |
| Project GitHub connect/reconnect/callback/repos/update/delete | Đã dùng |
| Project Jira connect/sites/projects/boards/update/delete | Đã dùng |
| `/api/projects/{projectId}/integrations/jira-sources/**` | Đã dùng (GET sources hỗ trợ Lecturer qua requireReader và Student, connect, reconnect, delete soft-revoke, sync 202, failover preview, failover execute 202, failover runs polling, retry, reconcile) |
| `/api/webhooks/github`, `/api/webhooks/jira` | Provider gọi; FE không gọi |

### 8.5 Project projection

| Endpoint group | FE hiện tại |
| --- | --- |
| Project tasks list/options/detail/create/patch/delete | Đã dùng |
| Task sprint move/transition/options | Đã dùng |
| Task commits | Đã dùng |
| Sprint list/detail/create/patch/delete | Đã dùng (GET sprints hỗ trợ jiraIntegrationId filtering canonical và provenance source) |
| Project commits | Đã dùng |
| Canonical `/task-commit-links` | Đã dùng |
| `/repos/{repoId}/branches` | Đã dùng |
| `/sync`, `/sync-status` | Đã dùng |
| `/progress`, `/progress/members/{studentId}` | Đã dùng |
| `/analytics/sprint-activity` | Chưa dùng |
| `/events` SSE | Đã dùng |

### 8.6 Task evidence

| Endpoint group | FE hiện tại |
| --- | --- |
| Work sessions list/start/stop | Đã dùng |
| Contribution confirmations | Đã dùng |
| Web links list/add/delete | Đã dùng |
| Files list/upload/download/delete | Đã dùng |

### 8.7 Graph

| Endpoint | FE hiện tại |
| --- | --- |
| `GET /api/projects/{projectId}/graph/overview` | Đã dùng cho Student và Lecturer |
| `GET /api/projects/{projectId}/students/{studentId}/graph/contribution` | Đã dùng theo student selection/context |
| `GET /api/projects/{projectId}/sprints/{sprintId}/graph/activity` | Đã dùng và chỉ enable khi có sprint |
| `GET /api/projects/{projectId}/graph/attribution` | Đã dùng, gồm filter anomaly/subgraph |
| `GET /api/projects/{projectId}/sprints/{sprintId}/graph/peer-review` | Đã dùng và chỉ enable khi có sprint |

### 8.8 Notification và Push Installation

| Endpoint group | FE hiện tại |
| --- | --- |
| `GET /api/users/me/notifications` | Đã dùng (phân trang, lọc unreadOnly) |
| `GET /api/users/me/notifications/unread-count` | Đã dùng |
| `PATCH /api/users/me/notifications/{id}/read` | Đã dùng |
| `PATCH /api/users/me/notifications/read-all` | Đã dùng |
| `PUT /api/users/me/push-installations` | Đã dùng (đăng ký Firebase Installation FID và FCM Web Push token) |
| `DELETE /api/users/me/push-installations/{id}` | Đã dùng (thu hồi thiết bị push khi đăng xuất) |
| `GET /api/users/me/events` | Đã dùng (User-scoped SSE: READY, NOTIFICATION_CREATED, ACCOUNT_DISABLED) |
| `POST /api/admin/notifications/system` | Đã dùng (kèm Idempotency-Key và preview) |
| `POST /api/lecturer/notifications/all-courses` | Đã dùng (kèm Idempotency-Key) |
| `POST /api/lecturer/courses/{courseId}/notifications` | Đã dùng (kèm Idempotency-Key) |
| `POST /api/lecturer/teams/{teamId}/notifications` | Đã dùng (kèm Idempotency-Key) |
| `POST /api/lecturer/courses/{courseId}/students/{studentId}/notifications` | Đã dùng (kèm Idempotency-Key) |

### 8.9 Team Activity Analytics (Heatmap & Sprint Burndown)

| Endpoint | FE hiện tại |
| --- | --- |
| `GET /api/courses/{courseId}/teams/{teamId}/heatmap` | Đã dùng (Lưới nhịp độ hoạt động toàn nhóm hoặc cá nhân, tính điểm activity, filter theo ngày và thành viên) |
| `GET /api/courses/{courseId}/teams/{teamId}/sprints/{sprintId}/burndown` | Đã dùng (Biểu đồ Sprint Burndown đối soát idealRemaining, actualRemaining và doneCount) |

### 8.10 Trí tuệ nhân tạo (AI & LLM Services)

| Endpoint | FE hiện tại |
| --- | --- |
| `GET/PATCH /api/lecturer/courses/{courseId}/ai-settings` | Đã dùng (Bật/tắt tự động hóa AI, platform fallback) |
| `GET/PUT/DELETE /api/lecturer/courses/{courseId}/ai-credentials/{role}` | Đã dùng (BYOK lưu an toàn API key OpenAI Primary & Secondary) |
| `POST /api/lecturer/courses/{courseId}/ai/progress-analyses` & `/latest` | Đã dùng (Báo cáo tiến độ lớp học) |
| `GET /api/lecturer/courses/{courseId}/ai/analyses/{id}/export.docx` | Đã dùng (Xuất file Word .docx khóa học) |
| `POST /api/projects/{projectId}/ai/team/progress-analyses` & `/latest` | Đã dùng (Báo cáo tiến độ nhóm dự án) |
| `POST /api/projects/{projectId}/ai/students/{studentId}/progress-analyses` & `/latest` | Đã dùng (Tiến độ cá nhân sinh viên) |
| `GET /api/projects/{projectId}/ai/analyses/{id}/export.docx` | Đã dùng (Xuất file Word .docx dự án) |
| `POST /api/projects/{projectId}/ai/team/risk-analyses` & `/latest` | Đã dùng (Quét và đánh giá rủi ro nhóm) |
| `POST /api/projects/{projectId}/ai/students/{studentId}/risk-analyses` & `/latest` | Đã dùng (Đánh giá rủi ro cá nhân sinh viên) |
| `POST /api/projects/{projectId}/ai/tasks/{taskId}/risk-analyses` & `/latest` | Đã dùng (Đánh giá rủi ro task) |
| `POST /api/projects/{projectId}/ai/tasks/{taskId}/intelligence-analyses` & `/latest` | Đã dùng (Kiểm tra độ mạnh minh chứng & lệch đề bài) |
| `POST /api/projects/{projectId}/ai/commits/{gitCommitId}/analyses` & `/history` | Đã dùng (Commit Intelligence chấm điểm 0-100) |
| `POST /api/projects/{projectId}/ai/tasks/{taskId}/academic-analyses` | Đã dùng (Đề xuất phân loại task vào đề cương) |
| `POST /api/projects/{projectId}/ai/commits/{gitCommitId}/academic-analyses` | Đã dùng (Đề xuất phân loại commit vào đề cương) |
| `GET /api/projects/{projectId}/ai/tasks/{taskId}/academic-classifications` | Đã dùng (Lịch sử phân loại task) |
| `GET /api/projects/{projectId}/ai/commits/{gitCommitId}/academic-classifications` | Đã dùng (Lịch sử phân loại commit) |
| `POST /api/projects/{projectId}/ai/academic-classifications/{id}/review` | Đã dùng (Lecturer duyệt CONFIRM/REJECT/CORRECT) |
| `GET /api/lecturer/courses/{courseId}/ai/academic-classifications` | Đã dùng (Tổng hợp phân loại đề cương toàn khóa học cho Giảng viên, lọc theo artifactType, status, phân trang) |

---

## 9. Graph canonical

### 9.1 Node types

`STUDENT`, `TEAM`, `PROJECT`, `SPRINT`, `TASK`, `COMMIT`, `CRITERION`, `IDENTITY`.

### 9.2 Edge types

`MEMBER_OF`, `OWNS`, `HAS_SPRINT`, `CONTAINS`, `ASSIGNED_TO`, `EVIDENCED_BY`, `CLASSIFIED_AS`, `AUTHORED_BY`, `MAPS_TO`, `REVIEWED`.

Quan hệ attribution đúng là `Task → Commit → Identity → Student` khi identity mapping tồn tại. FE phải:

- dùng stable node/edge id từ BE;
- không cắt tên đến mức tooltip chỉ còn “HCM”;
- tooltip hiển thị full display name, external key/SHA, type, status và metadata liên quan;
- filter theo loại node/edge, sprint, student và endpoint phù hợp;
- có loading/error/empty state và không giữ graph của project/user cũ;
- invalidate graph khi event liên quan Task/Commit/Link/Evidence xảy ra, nhưng refetch REST/Graph API thay vì ghép payload SSE.

Hiện mỗi request graph có thể kích hoạt/rebuild projection theo implementation BE. Đây là rủi ro hiệu năng; cần đo bằng integration test trước khi gọi nhiều endpoint cùng lúc. Nên lazy-load theo tab/view, cache theo query key và chỉ refetch view đang active.

---

## 10. Quy tắc UX nghiệp vụ bắt buộc

- Create Task dùng modal gọn; Task detail/edit dùng drawer.
- Work timer nằm ở header task để thao tác nhanh và tiếp tục chạy khi drawer đóng.
- Evidence chia tab/section `Commits`, `Tài liệu`, `Đóng góp`; không render module dài cùng lúc.
- Chọn commit trong tab Commits không tạo request ngay: đó là draft selection. Chỉ nút `Xác nhận đóng góp` mới submit confirmation.
- Không hiển thị cùng một selection editor ở cả tab Commits và Đóng góp; tab Commits để xem linked commits, tab Đóng góp để chọn/submit evidence.
- Pipeline dùng `Flow | Audit matrix` như hai view thay thế nhau, không xếp Matrix dưới Flow.
- Desktop dùng sticky Task Inspector; mobile/tablet mở sheet/drawer.
- Filter Pipeline dùng cùng grid cho Member/Sprint/Repository/Branch; Branch disabled đến khi chọn Repository.
- Board/Backlog phải dùng initials/avatar theo assignee canonical và không render icon type trùng.
- Due date hiển thị với nhãn/tooltip dễ hiểu và trạng thái overdue/due soon; icon lịch không đứng một mình nếu gây khó hiểu.
- Dashboard phải ưu tiên insight: tiến độ task, sprint active, commit chưa link, evidence; status bằng 0 có thể ẩn, blocked > 0 phải cảnh báo.
- Tất cả chart phải có title, unit, full label, legend và tooltip có tên người/series/value rõ ràng.
- Không giữ mock fallback im lặng ở màn production; nếu API thiếu, hiển thị empty/error state có nguồn gốc rõ.

---

## 11. Khoảng trống và backlog ưu tiên

### P0 — Sai dữ liệu/quyền hoặc chặn luồng chính

- [x] Thay Admin Users mock bằng `/api/admin/users` và kiểm thử đổi status.
- [x] Thay Admin Audit Log mock bằng `/api/admin/audit-logs` (tích hợp API thật, hỗ trợ snapshot team/project/class/actor).
- [ ] Xác minh logout/login tài khoản khác xóa query cache, selected course/project/team và reconnect SSE đúng context mới.
- [ ] Xác minh Graph SAGA-75 không rò dữ liệu project/student cũ và đúng authorization.
- [ ] Xác minh production DTO Task luôn có `startDate`, `dueDate`, `parent` với null rõ ràng.

### P1 — Nghiệp vụ đã có BE nhưng chưa có UI

- [ ] Dùng `/analytics/sprint-activity` cho chart Task–Commit theo Sprint nếu đây là biểu đồ nghiệp vụ yêu cầu; chart commit theo tuần chỉ là activity phụ.
- [ ] Sửa Project Type thành optional, nullable và bỏ auto-select.
- [ ] Chuẩn hóa Repository Role giữa FE/BE; bỏ hoặc map rõ `FULLSTACK`/`DOCS`.
- [ ] Tích hợp FE cho Commit Intelligence submit/status/history, bounded evidence coverage và academic-classification review; hiển thị rõ partial/unavailable patch coverage, AI proposal so với Lecturer-confirmed/HUMAN correction, và không trình bày finding như điểm hoặc kết luận gian lận.

### P2 — Hiệu năng, khả dụng và báo cáo

- [x] Admin Dashboard giữ snapshot khi đổi học kỳ, prefetch theo intent, hủy request lỗi thời và lazy-load thư viện chart.
- [ ] Đo latency/rebuild cost của Graph API; bổ sung cache/version/graph-specific event nếu cần.
- [ ] Với project lớn, ưu tiên summary/chart/heatmap/swimlane và chỉ lazy-load subgraph khi drill-down; không render toàn bộ Task/Commit thành node mặc định.
- [x] Admin Dashboard dùng aggregate `/api/admin/dashboard/summary`, không còn mock; force refresh dùng single-flight/cache metadata và FE hiển thị rõ snapshot `refreshPending`.
- [ ] Bổ sung WebAuthn step-up UI nếu phạm vi sản phẩm yêu cầu.
- [ ] Theo dõi `lastSyncedAt`, trạng thái SSE và lỗi sync riêng; không gộp thành một badge mơ hồ.
- [ ] Chuẩn hóa timezone report (UTC lưu trữ, timezone nghiệp vụ để group ngày/tuần).

### Contract cần BE xác nhận

- [ ] Work-session resume chính thức dùng list hiện tại hay endpoint `/active`; chỉ duy trì một convention.
- [ ] Graph response version/cursor/limit và cơ chế refresh projection; focused pagination phải giữ context node và connecting edges.
- [ ] Có cần `GET /api/projects/{projectId}/graph/summary` canonical để trả aggregate theo project/sprint/student, tránh FE tải toàn bộ nodes/edges chỉ để đếm.
- [ ] Sprint activity DTO có đủ Task completed và Commit theo cùng sprint/timezone.
- [ ] Task date/parent keys luôn xuất hiện trong response kể cả khi null.
- [ ] Project update/delete có nằm trong scope release hay không.

---

## 12. Checklist nghiệm thu theo vai trò

### Admin

- [ ] Quản lý semester/active semester.
- [ ] Quản lý subject và lifecycle syllabus.
- [ ] Quản lý class/course/lecturer/roster.
- [ ] Xem và cập nhật user bằng API thật.
- [ ] Xem audit log bằng API thật.
- [x] Dashboard không dùng số liệu mock trong bản nộp; nullable KPI không bị đổi thành 0 và integration pulse không bị diễn giải thành provider health.

### Lecturer

- [ ] Chỉ xem course được phân công.
- [ ] Import team, đổi leader, chuyển member.
- [ ] Xem progress tổng và member detail mà không làm đổi dashboard tổng.
- [ ] Cấu hình mode/weights và project group weights.
- [ ] Xem evaluation, warning và minh chứng đúng quyền; xác minh UI không có thao tác ghi đè tỷ lệ cuối.
- [ ] Xem graph canonical với filter/project/team/student/sprint đúng.
- [ ] Xem peer review sau khi FE tích hợp.

### Student

- [ ] Chọn course/team/project đúng tài khoản hiện tại.
- [ ] Leader tạo project và cấu hình Jira/GitHub.
- [ ] Task/Sprint/Commit sync, board, backlog, timeline chính xác.
- [ ] Subtask lồng đúng parent; due date/start date chính xác.
- [ ] Work session resume sau close/tab/reload và chỉ stop thủ công.
- [ ] Evidence link/file/commit confirmation hoạt động.
- [ ] Step-up 403 → reauth → retry một lần.
- [ ] Pipeline Flow/Audit Matrix dùng link canonical và repo/branch filter đúng.
- [ ] Graph canonical và contribution dashboard giải thích được số liệu.
- [ ] Peer review có UI trước khi coi chức năng assessment hoàn chỉnh.

### Cross-cutting

- [ ] Không có React duplicate key.
- [ ] Không có N+1 task-commit request trong matrix.
- [ ] SSE reconnect không tạo bão refetch.
- [ ] Không dùng localStorage làm canonical user/course/project/work session.
- [ ] Loading/error/empty state phân biệt rõ.
- [ ] Responsive desktop/tablet/mobile.
- [ ] Unit test, integration test, TypeScript, ESLint và diff check đạt.
- [ ] OpenAPI, tài liệu này và source cùng phiên bản release.

---

## 13. Hướng dẫn cho AI/dev khi cập nhật tài liệu

Khi có commit hoặc API mới, thực hiện theo thứ tự:

1. Đọc diff Backend: controller, DTO, service, authorization, entity/migration và test.
2. Đọc diff Frontend: type, API service, hook/query key, component/page và test.
3. Tìm Requirement ID bị ảnh hưởng trong mục 7.
4. Cập nhật riêng ba cột `BE`, `FE data`, `UI`; không tự nâng thành `DONE` chỉ vì có endpoint.
5. Cập nhật API registry và gap/backlog.
6. Ghi rõ breaking change, nullable field, enum, role và canonical source.
7. Chạy checklist kiểm thử tương ứng.

Prompt audit đề xuất:

```text
Hãy đối chiếu source hiện tại của saga-fe và saga-be với
docs/SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md.

Không chỉ tìm API string. Với từng requirement bị ảnh hưởng, kiểm tra đủ:
Backend controller/DTO/service/authorization/test;
Frontend type/service/hook/query invalidation/UI/test.

Trả kết quả theo Requirement ID với trạng thái:
DONE, BE_ONLY, PARTIAL, MOCK, WIP/VERIFY, INTERNAL hoặc ABSENT.
Liệt kê bằng chứng file:line, contract mismatch, security risk,
mock data, endpoint BE chưa được FE gọi và UI chưa expose.
Không sửa code cho tới khi hoàn tất bảng gap và ưu tiên P0/P1/P2.
```

### 13.1 Prompt kiểm tra tài liệu báo cáo bên ngoài

```text
Hãy dùng docs/SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md làm đặc tả nghiệp vụ
chuẩn và đối chiếu với tài liệu báo cáo tôi cung cấp.

Mục tiêu đầu tiên là kiểm tra độ đầy đủ và đúng nghĩa nghiệp vụ,
không đánh giá tài liệu chỉ dựa trên việc FE hiện đã call API hay chưa.

Thực hiện:
1. Lập ma trận SCOPE-01 đến SCOPE-18 với trạng thái trong báo cáo:
   Đầy đủ / Một phần / Thiếu / Mâu thuẫn / Tuyên bố vượt quá hệ thống.
2. Kiểm tra actor, permission, end-to-end flow, canonical data,
   Task-Sprint-Commit-Evidence, realtime, Graph, Peer Review và Contribution.
3. Phân biệt rõ:
   - năng lực sản phẩm dự kiến;
   - phần đã triển khai;
   - phần đang WIP;
   - limitation/future work.
4. Đánh dấu mọi câu trong báo cáo biến số commit/task/session thành điểm học phần,
   coi Graph là nguồn điểm, hoặc mô tả Project Type là tiêu chí đóng góp.
5. Với mỗi gap, đề xuất đoạn nội dung thay thế có thể chèn trực tiếp vào báo cáo.
6. Không bịa thuật toán, metric, API, anomaly hoặc kết quả thực nghiệm
   nếu đặc tả/source không xác nhận.

Đầu ra gồm:
- Executive summary;
- Coverage matrix theo SCOPE ID;
- Danh sách nội dung sai hoặc thiếu;
- Nội dung viết lại đề xuất;
- Danh sách claim cần đội FE/BE xác minh.
```

---

## 14. Tài liệu và source tham chiếu

### Frontend

- `src/features/auth`
- `src/features/admin`
- `src/features/lecturer`
- `src/features/student`
- `src/features/graph`
- `src/features/progress`
- `src/features/integrations`
- `src/features/profile`
- `docs/API_INTEGRATION_REGISTRY.md`
- `docs/testing/`

### Backend

- `src/main/java/com/saga/be/controller`
- `src/main/java/com/saga/be/service`
- `src/main/java/com/saga/be/domain`
- `src/main/java/com/saga/be/repository`
- `src/main/java/com/saga/be/ai`
- `src/main/java/com/saga/be/service/ai`
- `docs/AI_AGENT_FOUNDATION.md`
- `docs/ai-3-academic-classification.md`
- `src/test`

### Nguyên tắc bảo trì

- Cập nhật ngày baseline, branch và commit khi chốt release.
- Không xóa gap chỉ vì UI đã được thiết kế; chỉ đóng khi có data path và test.
- Không sao chép response nhạy cảm hoặc secret/token vào tài liệu.
- Nếu BE deploy khác source local, đánh dấu `DEPLOYMENT_DRIFT` cho đến khi source/OpenAPI được đồng bộ.
