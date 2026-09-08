# SAGA Frontend — Hướng dẫn bàn giao toàn diện cho Codex/FE kế nhiệm

> Cập nhật theo source tại nhánh `feat/SAGA-52-lecturer-course-and-team-management` ngày 07/09/2026. Tài liệu này là điểm bắt đầu cho một AI/FE mới: đọc nó trước, sau đó đọc các rule và tài liệu API được liên kết bên dưới trước khi sửa code.

## 1. Mục đích sản phẩm và nguyên tắc làm việc

SAGA là frontend cho hệ thống theo dõi và đánh giá quá trình làm đồ án phần mềm. Hệ thống có ba vai trò:

- **Quản trị viên**: quản trị dữ liệu học thuật, lớp học phần, danh sách sinh viên và đề cương.
- **Giảng viên**: chọn lớp được phân công, theo dõi lớp/nhóm, phân nhóm bằng Excel và xem các màn hình phân tích.
- **Sinh viên**: chọn lớp đang học, xem nhóm/dự án, tiến độ, commit, đồ thị và đóng góp.

Mục tiêu của người kế nhiệm là thay đổi đúng phạm vi task, dùng API đã được backend công bố và luôn giữ trải nghiệm minh bạch: dữ liệu thật thì ghi nhận là dữ liệu thật; phần chưa có backend phải là trạng thái UI rõ ràng, **không giả thành API thật**.

## 2. Bắt đầu mỗi phiên làm việc

1. Kiểm tra nhánh, thay đổi local và danh tính:

   ```powershell
   git status --short --branch
   git var GIT_AUTHOR_IDENT
   git var GIT_COMMITTER_IDENT
   ```

2. Đọc đầy đủ `AGENTS.md`. Nếu phải sửa code Next.js, đọc tài liệu phù hợp trong `node_modules/next/dist/docs/` trước vì dự án dùng Next.js 16.3.1 và có breaking changes.
3. Đọc toàn bộ file liên quan trong `.agents/rules/` trước khi thiết kế/sửa tính năng. Những rule bắt buộc là:

   - `saga-frontend.md`: kiến trúc, thuật ngữ, ngôn ngữ UI, stack.
   - `routing-and-roles.md`: role guard, route và shell điều hướng.
   - `ui-ux-design-system.md`: token, component, responsive/accessibility.
   - `unit-testing-and-api-standards.md`: service, test và không mock API sai.
   - `performance-and-optimization.md`: chart/graph, cache và loading.
   - `graph-and-neo4j.md`: ngữ nghĩa, UX và hiệu năng Cytoscape.
   - `git-and-workflow.md`: branch, commit, PR và danh tính Git.

4. Với task API, lấy `docs/FRONTEND_API_STEP_BY_STEP.md` làm nguồn contract chính; kiểm tra `docs/openapi.json` nếu cần đối chiếu. `docs/02-api-integration-task-assignment.md` chỉ định phạm vi theo Dev/task.
5. Trước khi pull/merge/rebase `dev`, bảo toàn thay đổi local. Sau đó kiểm tra lại hai lệnh `git var` ở bước 1. Pull không được phép tự đổi local Git identity; không hard-code tên/email bất kỳ thành viên nào vào rule chung.

### Git workflow

- Tạo feature branch từ `dev`: `feat/SAGA-xx-mo-ta-ngan-gon`.
- Không dùng `git reset --hard`, `git checkout --`, hay xoá thay đổi của người khác.
- Commit tiếng Việt theo mẫu:

  ```text
  feat: [FE][SAGA-xx] Mô tả ngắn bằng tiếng Việt
  ```

- Trước commit/push phải chạy:

  ```powershell
  npm run lint
  npm run test
  npm run build
  ```

- Chỉ push khi user yêu cầu hoặc task yêu cầu; PR luôn vào `dev`.

## 3. Công nghệ và kiến trúc

| Mảng | Lựa chọn hiện tại | Quy ước |
|---|---|---|
| Framework | Next.js 16.3.1, App Router, React 19, TypeScript | `src/app` chỉ là route composition; logic nằm trong feature |
| UI | Tailwind CSS v4, shadcn/ui, Lucide | Tái dùng `src/components/ui`, không tự tạo component trùng lặp |
| Server state | TanStack Query v5 | Query/mutation trong hook; cache theo query key ổn định |
| Client/UI state | Zustand | Chỉ state UI/session cần persist, không dùng thay server cache |
| HTTP | Axios qua `src/lib/axios.ts` | Không gọi `fetch`/Axios trực tiếp trong component |
| Validation | Zod | Dùng cho form/đầu vào khi phù hợp |
| Charts | Recharts | Ưu tiên màu semantic, tooltip/legend dễ đọc |
| Graph | Cytoscape.js | Client-only, dynamic import, `cy.batch`, cleanup instance |
| Test | Vitest + coverage V8 | Service/logic phải có `*.spec.ts` |

### Cấu trúc thư mục

```text
src/
  app/                 # Route App Router và page mỏng
    (auth)/            # login, register, setup password
    (dashboard)/       # shell được bảo vệ và namespace role
    (marketing)/       # landing page
  components/
    common/            # component dùng chung cấp ứng dụng
    layout/            # header, sidebar, nav config
    ui/                # shadcn primitives
  features/
    auth/ admin/ lecturer/ student/ profile/ integrations/ graph/
    <feature>/api/     # service có type rõ ràng
    <feature>/hooks/   # useQuery/useMutation
    <feature>/types/   # model/DTO
    <feature>/components/
    <feature>/data/    # mock chỉ cho phần chưa có API, ghi rõ nguồn
  lib/                 # axios, api-error, utilities, query client
  providers/           # QueryProvider
  testing/             # fptTest helper/reporter
```

Không đưa business logic lớn vào `page.tsx`. Tên code/file bằng tiếng Anh; comment logic bằng tiếng Việt. Toàn bộ câu chữ hiển thị cho người dùng dùng tiếng Việt tự nhiên, tránh dịch sát nghĩa hoặc lạm dụng thuật ngữ kỹ thuật không cần thiết.

## 4. Xác thực, role và điều hướng

### Auth/session

- Backend dùng session cookie; `apiClient` có `withCredentials: true`.
- CSRF được lấy từ `/api/auth/csrf`, cache trong sessionStorage/cookie và tự thêm `X-XSRF-TOKEN` cho request thay đổi dữ liệu.
- Không tự thêm JWT, không gửi `role` trong request body. Backend quyết định quyền từ session.
- `useAuthStore` chỉ persist user, trạng thái đăng nhập, lựa chọn course và trạng thái thiết lập mật khẩu; khi reload phải xác nhận lại phiên qua `useSession`/`AuthService.getMe()`.
- Response 401 không phải auth endpoint phát event `saga:unauthorized`, xoá session UI và chuyển về `/login?next=...`.

### Home path bắt buộc

`src/features/auth/lib/role-routes.ts` là nơi duy nhất xác định trang đầu role:

| Role | Trang sau login |
|---|---|
| `ADMIN` | `/admin/dashboard` |
| `LECTURER` | `/lecturer/courses` |
| `STUDENT` | `/student/courses` |

Không redirect giảng viên thẳng vào dashboard lớp khi chưa chọn lớp. Route guard ở `src/app/(dashboard)/layout.tsx` dùng `isPathAllowedForRole`; sửa route mới phải bảo đảm prefix role đúng (`/admin`, `/lecturer`, `/student`) và thêm nav tương ứng nếu người dùng cần truy cập nó.

### Shell và navigation hiện tại

- **Admin** dùng sidebar dọc.
- **Giảng viên và sinh viên** dùng `TopNavHeader` hai tầng, không dùng sidebar dọc. Header có profile dropdown/logout, course switcher, desktop tabs và mobile sheet.
- Với lecturer, tab con chỉ xuất hiện khi URL chứa `/lecturer/courses/[courseId]/...`; khi chưa chọn lớp, chỉ hiện trang chọn lớp.
- Navigation nằm tại `src/components/layout/sidebar/nav-config.ts`. Dùng helper `course-routes.ts`, không nối chuỗi route rải rác. Link sidebar/header/card dùng `prefetch={true}`.
- Khi thêm page động, xử lý đủ loading, invalid ID, 403 và 404; không fallback sang `courses` chỉ vì state Zustand chưa hydrate. URL chứa `courseId` là nguồn ngữ cảnh bền qua reload.

## 5. Bản đồ route hiện hữu

### Auth/marketing/shared

```text
/                         Landing
/login                    Đăng nhập
/register                 Đăng ký
/auth/setup-password      Thiết lập mật khẩu
/dashboard                Chuyển theo role
/profile                  Hồ sơ
/profile/integrations     Liên kết tài khoản
/settings/integrations    Cài đặt tích hợp
```

### Admin

```text
/admin/dashboard
/admin/users
/admin/academic
/admin/academic/courses/[id]
/admin/subjects
/admin/subjects/[id]
/admin/audit-log
```

### Lecturer

```text
/lecturer/courses
/lecturer/courses/[courseId]
/lecturer/courses/[courseId]/dashboard
/lecturer/courses/[courseId]/teams
/lecturer/courses/[courseId]/teams/select
/lecturer/courses/[courseId]/teams/[teamId]
/lecturer/courses/[courseId]/grades
/lecturer/courses/[courseId]/graph
/lecturer/courses/[courseId]/settings/weights
```

### Student

```text
/student/courses
/student/dashboard
/student/project-info
/student/integrations
/student/integrations/github/callback
/student/integrations/jira/callback
/student/sprint-progress
/student/commits
/student/graph
/student/peer-assessment
/student/contribution
```

Route tồn tại không đồng nghĩa API backend đã có. Xem mục 7 trước khi nối dữ liệu.

## 6. Thiết kế UI/UX và hiệu năng

### Nguyên tắc giao diện

- Giao diện tiếng Việt rõ ràng: dùng “Lớp học phần”, “Lớp sinh viên niên khóa”, “Đề cương chi tiết”, “Tổng quan”, “Hoạt động nhóm”; tránh nhãn mơ hồ như “Class”/“Mode”/“Config” nếu có từ Việt tự nhiên hơn.
- Dùng token màu hiện có trong `globals.css`/design-system; không ghép `hsl(var(--token))` khi token đã là `oklch`. Kiểm tra cách token được khai báo trước khi dùng trong chart.
- Không hard-code màu HEX qua inline style hoặc Tailwind arbitrary class. Dùng semantic class/token như `bg-primary`, `text-muted-foreground`, `border-border`.
- Không dùng HTML `<select>`/`<option>` nguyên bản; dùng `CustomSelect` tại `src/components/common/custom-select.tsx` để thống nhất search, label và trạng thái disabled.
- Mỗi trang có loading skeleton cùng kích thước layout thật, empty state có hành động tiếp theo và error state có hướng xử lý. Tránh spinner toàn màn hình.
- Form có label, mô tả, validation gần input, trạng thái disable khi pending và toast rõ kết quả. Dialog phải đóng/mở bằng state minh bạch, hỗ trợ Escape/focus của shadcn; với nội dung dài, dùng khung `max-h-[92vh] flex flex-col`, header/footer cố định và body `overflow-y-auto`.
- Responsive: desktop ưu tiên dashboard/bảng; mobile dùng drawer/tabs cuộn hợp lý, không ép bảng rộng tràn màn hình.
- Biểu đồ cần tiêu đề, kỳ dữ liệu, tooltip, legend, màu phân biệt team và phương án thay thế bằng bảng/tóm tắt nếu khó đọc. Chart phục vụ tổng quan, không thay thế hoàn toàn số liệu/hành động.

### Chart/graph

- Recharts/Cytoscape là client-only: dynamic import với `ssr: false` khi component có DOM/canvas nặng.
- Cytoscape không lưu nodes/edges lớn vào React state; dùng ref, cập nhật `cy.batch()`, cleanup bằng `destroy()` khi unmount.
- Hover graph phải làm mờ phần không liên quan và làm nổi bật neighborhood. Traceability graph phải có bảng đối soát phía dưới.
- Dữ liệu lọc/tính toán lớn dùng `useMemo`; callback truyền xuống canvas dùng `useCallback`; search debounce 300–400 ms hoặc `useDeferredValue`.

### Cache

- QueryProvider mặc định: `staleTime` 5 phút, `gcTime` 15 phút, retry query 1 lần, mutation không retry.
- Dữ liệu thay đổi nhanh có thể set `staleTime` 30 giây ở hook.
- Trang detail tận dụng `initialData` từ list cache khi có thể; mutation invalidate chính xác key phụ thuộc, không refetch toàn app.

## 7. API integration: nguồn sự thật và phân loại trạng thái

### Tài liệu cần ưu tiên

1. `docs/FRONTEND_API_STEP_BY_STEP.md`: method, path, request/response, quyền, error code, ID flow và API gap.
2. `docs/openapi.json`: kiểm tra contract máy đọc được.
3. `docs/02-api-integration-task-assignment.md`: ai phụ trách API nào.

Nếu hai nguồn mâu thuẫn, dừng và báo người dùng/backend; không tự đặt endpoint/field khác.

### Quy trình nối một API

1. Xác định actor, role, precondition, input ID và response từ tài liệu.
2. Tạo type DTO đúng field backend trả về; giữ `null` đúng nghĩa, không đổi thành ID/string giả.
3. Tạo static service trong `src/features/<domain>/api`, gọi `apiClient`.
4. Validate input cục bộ tối thiểu bằng helper như `requireCourseId`; đừng tự tái hiện validation nghiệp vụ của backend.
5. Viết hook Query/Mutation với query key và invalidate rõ ràng.
6. Component chỉ dùng hook, hiển thị pending/success/error/empty.
7. Viết unit test N/A/B cho service.

### ID discipline

| ID | Dùng cho |
|---|---|
| `courseId` | API `/courses/{courseId}/...` |
| `teamId` | Nhận diện nhóm; không thay cho courseId/projectId |
| `projectId` | API `/projects/{projectId}/integrations/...` |
| `courseEnrollmentId` | Enrollment/diagnostic roster |
| `studentProfileId` | Hồ sơ sinh viên |
| `lecturerId` | Lecturer profile ID, không phải user ID |

Không lấy demo UUID từ docs để gọi runtime. Không suy ID từ code/name/URL không được API trả về.

### Phần đã có integration service trong source

- Auth: `src/features/auth/api/auth-service.ts`.
- Admin academic/subjects/roster: `src/features/admin/**/api`.
- Lecturer course: `src/features/lecturer/courses/api/lecturer-course-service.ts`.
- Lecturer team Excel: `src/features/lecturer/teams/api/lecturer-team-service.ts`.
- Student course/team: `src/features/student/courses/api/student-course-service.ts`.
- Student project và integration GitHub/Jira: `src/features/student/project/api` và `src/features/integrations/api`.

Phần chart/dashboard/đánh giá/graph UI có thể vẫn dùng mock. Không chuyển chúng thành API integration nếu backend chưa công bố endpoint.

### API backend chưa có — không bịa

Theo tài liệu phân công, không tạo request/mock-API giả cho:

- dashboard webhook/task board tự đồng bộ;
- SSE realtime event stream;
- graph snapshot/Neo4j delta;
- assessment/continuous scoring;
- quên mật khẩu, xác minh email, WebAuthn.

Nếu UI cần thể hiện, dùng empty/coming-soon state minh bạch hoặc mock presentation được gắn rõ là dữ liệu mẫu, không làm form gửi mock lên backend.

## 8. Luồng lecturer course và team (SAGA-52 / Dev 2)

Đây là phạm vi cần triển khai tiếp trên branch hiện tại. Chỉ làm các endpoint sau.

### 8.1. Chọn không gian lớp giảng viên

```text
Login Lecturer
  -> GET /api/lecturer/courses
  -> user chọn response[].id làm courseId
  -> GET /api/lecturer/courses/{courseId}
  -> /lecturer/courses/{courseId}/dashboard
```

- `GET /api/lecturer/courses`: `200 []` là hợp lệ khi chưa có lớp.
- `GET /api/lecturer/courses/{courseId}`: 403 là không được phân công; 404 là lớp không tồn tại. Điều hướng về danh sách lớp với thông báo, không retry bằng ID khác.
- `GET /api/lecturer/courses/{courseId}/roster`: chỉ trả sinh viên enrollment `ACTIVE`, không có invitation pending. Roster rỗng nghĩa là chưa đủ sinh viên active để phân nhóm.

### 8.2. Excel Team Uploader bắt buộc ba bước

```text
GET template
  -> Lecturer chỉnh workbook đúng chuẩn
  -> POST preview (multipart field: file)
  -> kiểm tra hasBlockingErrors
  -> POST confirm { previewToken }
  -> GET teams để refresh
```

1. `GET /api/lecturer/courses/{courseId}/teams/template` trả XLSX `Team_Assignment.xlsx`. Sheet chính xác là `Team_Assignment`.
2. Cột workbook: `No`, `Class`, `FullName`, `StudentCode`, `Email`, `TeamNo`, `TeamName`, `TeamRole`.
3. Chỉ cho sửa `TeamNo`, `TeamName`, `TeamRole`; role Excel chỉ là `Leader`/`Member`. Không dùng `MENTOR`.
4. Mọi ACTIVE student phải có đúng một dòng; `TeamNo` là số nguyên dương; các dòng cùng TeamNo phải cùng TeamName; mỗi TeamNo có đúng một Leader; một student chỉ thuộc một team.
5. `POST /api/lecturer/courses/{courseId}/teams/import/preview` gửi `FormData` với key duy nhất `file`. Không tự đặt multipart boundary. Preview không ghi DB.
6. Chỉ bật confirm khi `preview.hasBlockingErrors === false` và có `previewToken`. Hiển thị summary và từng row/action: `READY_CREATE`, `READY_ASSIGN`, `READY_REASSIGN`, `ALREADY_ASSIGNED`, `INVALID`, `CONFLICT`.
7. `POST .../confirm` gửi đúng `{ "previewToken": "..." }`. Token gắn với actor + course, dùng một lần và TTL 15 phút. Đổi file/course hoặc đóng wizard phải xoá token/preview state.
8. Confirm thành công invalidate/refetch `lecturerTeams(courseId)` và roster nếu màn hình dùng nó. Không tạo project: backend trả `projectId: null` là bình thường.
9. `GET /api/lecturer/courses/{courseId}/teams`: hiển thị Leader trước rồi Member theo `studentCode`. Lecturer không có CTA “Tạo dự án”.

### 8.3. Sinh viên xem course và team

```text
GET /api/student/courses
  -> chọn courseId runtime
  -> GET /api/student/courses/{courseId}/team
```

- Contract đúng là `/team`, **không phải `/my-team`**.
- Course list `200 []` là empty hợp lệ. `teamId === null` là chờ lecturer phân nhóm; `teamId != null && projectId === null` là nhóm chưa có dự án.
- `404 TEAM_NOT_FOUND` khi gọi team là trạng thái chờ, không phải lỗi hệ thống. `403 STUDENT_COURSE_FORBIDDEN` thì list course lại, không thử ID khác.
- Student team response không có email member; chỉ render các field contract trả về.

### 8.4. Error handling cho team import

| Code | Hành động UI |
|---|---|
| `TEAM_FILE_INVALID` | Hướng dẫn tải lại template chính thức |
| `TEAM_FILE_TOO_LARGE` | Báo giới hạn backend hiện là 2 MB |
| `TEAM_PREVIEW_INVALID`/`TEAM_PREVIEW_EXPIRED` | Xoá preview, upload lại |
| `TEAM_PREVIEW_MISMATCH` | Không retry token; preview lại đúng lớp/tài khoản |
| `TEAM_CONFIRM_BLOCKED` | Quay về preview và sửa workbook |
| `TEAM_LEADER_INVALID` | Nêu rõ mỗi nhóm cần đúng một Leader |
| `LECTURER_COURSE_FORBIDDEN` | Chặn thao tác và quay lại danh sách course |

## 9. Kiểm thử và tiêu chí nghiệm thu

- Mọi service/hàm nghiệp vụ có test `*.spec.ts` nằm cạnh service.
- Dùng `fptTest`; mỗi `it` theo mẫu `UTCIDxx - [N|A|B] ...`.
- Phân bổ mục tiêu: Normal 20–30%, Abnormal 40–50%, Boundary 25–35%; service coverage tối thiểu 90%.
- Bắt buộc test: happy path, empty list, input rỗng/biên, 400/401/403/404/409/500/network, và giữ nguyên shape request.
- Không sửa test để bỏ qua lỗi thật. Khi source/docs test report nói một con số cũ, chạy test hiện tại rồi ghi lại kết quả thật.

## 10. Cách audit và đưa hướng dẫn cho người dùng

Khi user chỉ yêu cầu audit/hướng dẫn, không sửa code hay commit. Làm theo trình tự:

1. Xác định scope chính xác: role, route, task Jira, file, API hoặc UI được hỏi.
2. Đọc source route/component/hook/service liên quan và rule áp dụng; dùng `rg` để tìm link/redirect/mock/endpoint.
3. Đối chiếu API với `FRONTEND_API_STEP_BY_STEP.md`, không suy đoán từ tên UI.
4. Báo kết luận trước: đã đáp ứng/chưa đáp ứng/phần nào không thể xác nhận.
5. Mỗi phát hiện cần có: vị trí file, triệu chứng, nguyên nhân, tác động, thay đổi đề xuất, điều kiện chấp nhận và test cần chạy.
6. Với UI: đánh giá hierarchy, state loading/empty/error, responsive, accessibility, thuật ngữ tiếng Việt, contrast/chart readability và route không hỏng khi reload.
7. Với navigation: kiểm tra tất cả link sử dụng ID thật và role guard; đặc biệt dynamic lecturer route phải giữ course context sau reload.
8. Không gọi một tính năng “đã xong” khi API/service/test chưa có hoặc UI còn nối mock không được ghi rõ.

Mẫu trả lời ngắn nên dùng:

```text
Kết luận: [Đạt / Chưa đạt / Đạt một phần].

1. [Ưu tiên] Vấn đề — file/route — tác động.
   Cách sửa: ...
   Tiêu chí nghiệm thu: ...
2. ...

Không thay đổi: ... (ngoài phạm vi hoặc backend chưa hỗ trợ).
```

Khi user yêu cầu triển khai, trước khi sửa cần nêu ngắn gọn phạm vi đang tác động; dùng `apply_patch`, không ghi đè thay đổi unrelated. Sau thay đổi, chạy kiểm tra tương xứng và báo chính xác những gì đã chạy/chưa chạy.

## 11. Chạy local, build và triển khai môi trường

### Chạy local

1. Cài đúng dependency đã lock trong `package-lock.json`:

   ```powershell
   npm ci
   ```

2. Cấu hình `.env` với `NEXT_PUBLIC_API_URL` trỏ tới backend phù hợp. Không commit secret hoặc `.env` thật.
3. Khởi động:

   ```powershell
   npm run dev
   ```

4. Kiểm tra tối thiểu login, một route theo mỗi role, reload route động lecturer, request session/CSRF và console trình duyệt.

### Build/release

```powershell
npm run lint
npm run test
npm run build
npm run start
```

- `npm run start` chạy artefact production sau khi build, không thay cho `npm run dev`.
- Build không được dựa vào mock ID, API secret hay browser-only object được gọi lúc SSR.
- Không có cấu hình deploy frontend (Vercel, container, CI workflow hay hosting URL) được version hóa trong repo tại thời điểm viết tài liệu. Không tự chọn nhà cung cấp hay publish production. Khi đội dự án cung cấp target deploy, cần xác nhận: Node version, biến `NEXT_PUBLIC_API_URL`, domain backend/CORS/cookie `SameSite`/`Secure`, URL callback OAuth GitHub/Jira và lệnh build/start của platform.
- Sau deploy phải smoke test login/session cookie, CSRF mutation, OAuth callback, direct navigation/reload route động, và route guard theo từng role.

## 12. Known issues / điểm cần xác minh trước khi sửa

1. `next.config.ts` hiện dựng rewrite bằng `${process.env.NEXT_PUBLIC_API_URL}` trực tiếp. Nếu biến môi trường không có, Next sẽ báo destination `undefined/api/...` và không khởi động được. Trước khi thay đổi config, kiểm tra `.env` và contract dev; phương án an toàn là chuẩn hoá base URL/fallback trước khi tạo rewrite, nhưng chỉ sửa khi user yêu cầu hoặc có lỗi đang cần khắc phục.
2. Một số rule và README mô tả backlog/mock cũ, còn source đã có một số API service mới. Luôn ưu tiên source hiện tại + API contract, không lấy mô tả UI cũ làm bằng chứng API tồn tại.
3. Các trang lecturer dashboard, final grades, graph, weight config và team-project activity có phần mock/UI lịch sử. Phân biệt rõ UI presentation với API integration thực trước khi đánh giá “hoàn thành”.
4. Không tự push branch SAGA-52 khi chưa có commit/user yêu cầu. Branch hiện được tạo từ `origin/dev`; kiểm tra remote trước khi pull nếu mạng GitHub lỗi.

## 13. Checklist trước khi bàn giao task

- [ ] Scope, role, route và API contract đã được xác nhận.
- [ ] Không tạo endpoint/field/ID giả.
- [ ] Component dùng hook; hook dùng service; service dùng `apiClient`.
- [ ] Loading, empty, error, permission và reload state đã được xử lý.
- [ ] Navigation không dẫn tới page not found và không vượt role namespace.
- [ ] UI tiếng Việt tự nhiên, responsive, accessible, dùng token hiện hữu.
- [ ] API services có N/A/B test và test pass.
- [ ] `npm run lint`, `npm run test`, `npm run build` pass.
- [ ] Đã pull/merge dev (nếu mạng cho phép), kiểm tra lại Git identity.
- [ ] Commit tiếng Việt đúng format, push/PR chỉ khi được yêu cầu.

## 14. Tài liệu tham chiếu nhanh

- [API tuần tự đầy đủ](FRONTEND_API_STEP_BY_STEP.md)
- [Phân công tích hợp API](02-api-integration-task-assignment.md)
- [Luồng auth](01-auth-main-flow-and-defense-guide.md)
- [Luồng admin học thuật](03-admin-academic-and-syllabus-main-flow-and-defense-guide.md)
- [OpenAPI](openapi.json)
- [Kết quả unit test](testing/UNIT_TEST_RESULTS.md)
- [Quy tắc dự án](../.agents/rules/)
