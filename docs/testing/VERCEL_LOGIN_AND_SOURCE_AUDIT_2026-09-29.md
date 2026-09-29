# SAGA Frontend — Báo cáo Audit Hợp nhất: Login, API, Console, Performance và Vercel

**Ngày audit:** 29/09/2026  
**Repository:** `saga-fe`  
**Framework:** Next.js 16.3.5, React 19.2.8  
**Phạm vi:** Source frontend, luồng authentication/session/CSRF, cấu hình Vercel, lỗi console/network, hai lỗi API runtime, performance, security, code quality, lint, TypeScript, unit test và production build.  
**Nguồn bổ sung:** Báo cáo `BÁO CÁO TỔNG HỢP TOÀN BỘ LỖI - SAGA FRONTEND` dài 2.619 dòng, khoảng 180 KB.

## 1. Kết luận tổng quan

Source frontend không có lỗi compile, lint hoặc unit test tại thời điểm audit. Lỗi đăng nhập production chính được xác định là sai lệch origin giữa frontend và allow-list CORS của Backend:

- Frontend được truy cập tại `https://www.saga.autos`.
- Backend chỉ chấp nhận origin có credential từ `https://saga.autos`.
- Preflight đăng nhập từ `https://www.saga.autos` trả `403 Forbidden`.
- Preflight tương tự từ `https://saga.autos` trả `200 OK` với `Access-Control-Allow-Credentials: true`.

Source đã được sửa để chuyển toàn bộ request từ `www.saga.autos` về origin canonical `https://saga.autos`. Ngoài ra, audit phát hiện và sửa lỗi retry sai các response `403` và lỗi truyền tham số toast trong các luồng authentication.

Sau thay đổi:

- ESLint: **PASS**.
- TypeScript: **PASS**.
- Unit test: **942/942 PASS**, 100 test files.
- Production build: **PASS**, sinh thành công 35 trang.
- `git diff --check`: **PASS**.

## 2. Phạm vi audit

Các khu vực đã được kiểm tra:

1. `next.config.ts`, rewrite và domain routing.
2. Axios client, credential cookie, CSRF token và response interceptor.
3. Auth service, auth hooks, Zustand auth store và login form.
4. Login bằng username/password và chuyển hướng Google OAuth.
5. Session validation qua `/api/auth/me`.
6. Console statements trong `src/`.
7. Biến môi trường public liên quan API và Firebase.
8. Toàn bộ lint, TypeScript, unit test và production build.
9. HTTP/CORS/preflight trên domain production thật.

Audit không sử dụng tài khoản thật, do đó chưa bao gồm kiểm thử E2E sau đăng nhập cho từng vai trò ADMIN, LECTURER và STUDENT.

## 3. Phát hiện chi tiết

### AUDIT-01 — Sai lệch domain production và CORS Backend

**Mức độ:** Critical  
**Trạng thái:** Đã sửa trong source, cần redeploy Vercel.

#### Hiện tượng

Frontend production trả trang login bình thường tại:

```text
https://www.saga.autos/login
```

Tuy nhiên frontend gọi API trực tiếp tới:

```text
https://api.saga.autos/api/auth/*
```

Backend không cho phép origin `https://www.saga.autos`, khiến trình duyệt chặn request bởi CORS trước khi login được xử lý.

#### Bằng chứng HTTP

| Kiểm tra | Kết quả |
| --- | --- |
| `GET https://www.saga.autos/login` | `200 OK`, phục vụ bởi Vercel |
| `OPTIONS /api/auth/login` với origin `https://www.saga.autos` | `403 Forbidden` |
| `OPTIONS /api/auth/login` với origin `https://saga.autos` | `200 OK` |
| Allow-Origin cho apex | `https://saga.autos` |
| Allow-Credentials cho apex | `true` |
| `GET https://www.saga.autos/api/auth/csrf` qua rewrite | `200 OK`, trả `Set-Cookie: XSRF-TOKEN=...` |

#### Cách sửa

Đã bổ sung host-based redirect trong `next.config.ts`:

```text
www.saga.autos/:path* → https://saga.autos/:path*
```

Redirect hiện để `permanent: false` nhằm dùng HTTP 307 và tránh browser cache vĩnh viễn trước khi bản production mới được xác minh.

#### Điều kiện nghiệm thu sau deploy

1. `https://www.saga.autos/login` trả `307` về `https://saga.autos/login`.
2. Trình duyệt không còn báo lỗi CORS khi gọi `/api/auth/csrf`, `/api/auth/me` hoặc `/api/auth/login`.
3. Login password tạo được `SAGA_SESSION` và chuyển đúng route theo role.
4. Reload dashboard vẫn giữ phiên hợp lệ.

### AUDIT-02 — Retry nhầm mọi mutation bị HTTP 403

**Mức độ:** High  
**Trạng thái:** Đã sửa và có regression test.

#### Hiện tượng

Response interceptor cũ xem gần như mọi `403` của request POST/PUT/PATCH/DELETE là lỗi CSRF và tự gửi lại request sau khi refresh token.

Điều này có thể làm request bị gửi hai lần trong các trường hợp:

- `ACCOUNT_DISABLED`.
- `ACCESS_DENIED`.
- Người dùng không đủ quyền.
- Các lỗi nghiệp vụ 403 khác.

Hậu quả có thể quan sát trong Network/Console là hai request liên tiếp, hai response lỗi hoặc thông báo lỗi bị lặp.

#### Cách sửa

Đã tách hàm `shouldRetryCsrfRequest` và chỉ cho phép retry khi Backend trả mã lỗi có ý nghĩa CSRF rõ ràng, ví dụ:

- `INVALID_CSRF_TOKEN`.
- `CSRF_TOKEN_INVALID`.
- `MISSING_CSRF_TOKEN`.
- `CSRF_VALIDATION_FAILED`.

Mỗi request chỉ được retry tối đa một lần. Endpoint cấp CSRF token không tự retry chính nó.

### AUDIT-03 — Toast lỗi authentication truyền sai tham số

**Mức độ:** Medium  
**Trạng thái:** Đã sửa và có regression test.

#### Hiện tượng

Một số auth hook truyền object toast options vào vị trí tham số `error` của `showErrorToast`. Vì vậy:

- Mất `toast id` dùng để chống thông báo trùng.
- Nội dung lỗi chi tiết có thể bị thay bằng thông báo chung.
- Thời lượng 6000 ms của lỗi Google login không được áp dụng.

Các luồng bị ảnh hưởng:

- Login password.
- Register.
- Setup password.
- Logout.
- Google login error.

#### Cách sửa

- Truyền đúng `error` và `options` theo chữ ký hàm.
- Bổ sung hỗ trợ `duration` cho toast helper.
- Giữ thông báo tiếng Việt theo error code như `INVALID_CREDENTIALS` và `ACCOUNT_DISABLED`.

### AUDIT-04 — Vercel Preview chưa được Backend cho phép

**Mức độ:** High đối với QA Preview, không chặn production apex  
**Trạng thái:** Cần cấu hình Backend/OAuth.

Preflight từ một origin dạng `*.vercel.app` trả `403 Forbidden`. Vì auth sử dụng cookie và `withCredentials: true`, không thể dùng wildcard `Access-Control-Allow-Origin: *`.

Để hỗ trợ Preview Deployment cần:

1. Cho phép chính xác preview origin hoặc xây dựng allow-list preview an toàn ở Backend.
2. Giữ `Access-Control-Allow-Credentials: true`.
3. Đồng bộ frontend redirect URL sau OAuth.
4. Đăng ký Google OAuth redirect URI phù hợp.
5. Kiểm tra cookie `Secure` và `SameSite=None`.

### AUDIT-05 — Không thể chuyển Google OAuth sang rewrite hiện tại

**Mức độ:** Architecture warning  
**Trạng thái:** Đã ghi nhận, chưa thay đổi OAuth flow.

Kiểm tra redirect cho thấy:

- OAuth trực tiếp qua `api.saga.autos` sinh callback đúng dạng `https://api.saga.autos/login/oauth2/code/google`.
- OAuth qua Vercel rewrite khiến Backend suy ra callback hostname Railway nội bộ.

Do đó, chuyển Google login sang same-origin rewrite tại thời điểm này có nguy cơ tạo lỗi `redirect_uri_mismatch`. Muốn dùng OAuth qua proxy cần sửa forwarded-host handling hoặc cấu hình callback canonical ở Backend trước.

## 4. Kết quả kiểm tra console

Quét toàn bộ `src/` không phát hiện `console.log`, `console.warn`, `console.debug` hoặc `console.info` không cần thiết trong runtime production.

Các console statement còn lại:

- `src/app/error.tsx`: ghi lỗi được bắt bởi Global Error Boundary.
- `src/app/(dashboard)/error.tsx`: ghi lỗi được bắt bởi Dashboard Error Boundary.
- `src/testing/fpt-reporter.ts`: chỉ phục vụ báo cáo unit test.

Lỗi console/network dự kiến trước bản sửa domain là lỗi CORS khi frontend `www.saga.autos` gọi trực tiếp `api.saga.autos`. Đây là lỗi deployment contract, không xuất hiện trong lint, TypeScript hoặc unit test.

## 5. Thay đổi source

| File | Thay đổi |
| --- | --- |
| `next.config.ts` | Redirect `www.saga.autos` về canonical apex domain |
| `src/lib/csrf-retry.ts` | Phân loại lỗi được phép refresh/retry CSRF |
| `src/lib/axios.ts` | Không retry mọi response 403 |
| `src/lib/api-error.ts` | Hỗ trợ đúng toast `id`, `description`, `duration` |
| `src/features/auth/hooks/useAuth.ts` | Sửa cách truyền lỗi và options cho toast |
| `src/features/auth/components/login-form.tsx` | Sửa toast lỗi Google login |
| `tests/unit/lib/csrf-retry.spec.ts` | 5 regression test cho retry CSRF |
| `tests/unit/lib/api-error.spec.ts` | Regression test cho auth toast |
| `tests/unit/next-config.spec.ts` | 2 test cho redirect và rewrite deployment |
| `docs/SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md` | Đồng bộ behavior auth/CSRF/domain canonical |
| `docs/PROJECT_HANDOFF_GUIDE.md` | Cập nhật hướng dẫn Vercel, CORS, OAuth và CSRF retry |

## 6. Kết quả kiểm thử đầy đủ

### ESLint

```text
PASS
0 errors
0 warnings
```

### TypeScript

```text
npm exec -- tsc --noEmit
PASS
```

### Unit test

```text
Test Files  100 passed (100)
Tests       942 passed (942)
```

### Production build

```text
Next.js 16.3.5
Compiled successfully
TypeScript passed
Static pages generated: 35/35
Build result: PASS
```

### Regression test bổ sung

```text
CSRF retry tests:       5 PASS
Deployment config:      2 PASS
Auth toast regression:  1 PASS
```

## 7. Checklist redeploy và smoke test

Sau khi deploy commit chứa bản sửa, thực hiện theo thứ tự:

- [ ] Mở `https://www.saga.autos/login` và xác nhận redirect sang `https://saga.autos/login`.
- [ ] Console không có lỗi CORS.
- [ ] `GET /api/auth/csrf` trả 200 và tạo `XSRF-TOKEN`.
- [ ] Login sai mật khẩu chỉ tạo một request login và hiển thị đúng thông báo.
- [ ] Login tài khoản bị khóa không tự retry request.
- [ ] Login password thành công cho ADMIN.
- [ ] Login password thành công cho LECTURER.
- [ ] Login password thành công cho STUDENT.
- [ ] Google login callback trở về đúng frontend canonical domain.
- [ ] Reload dashboard vẫn xác nhận được `/api/auth/me`.
- [ ] Logout xóa session UI, query cache và quay về `/login`.
- [ ] Direct navigation đến route không đúng role được chuyển về role home.
- [ ] Kiểm tra `/auth/setup-password`, forgot password và reset password.
- [ ] Nếu dùng Vercel Preview, xác minh riêng CORS và OAuth callback của preview URL.

## 8. Rủi ro và giới hạn còn lại

1. Bản sửa domain chỉ có hiệu lực sau khi Vercel redeploy.
2. Chưa kiểm thử E2E bằng credential thật.
3. Preview URL Vercel vẫn cần thay đổi Backend/CORS/OAuth.
4. Google OAuth qua same-origin proxy chưa an toàn do callback hostname bị suy ra sai.
5. Ổ C của máy audit đã hết dung lượng trong quá trình kiểm tra; điều này từng chặn browser automation nhưng không ảnh hưởng kết quả lint, TypeScript, test và production build đã hoàn tất trên repository.

## 9. Trạng thái nghiệm thu

| Hạng mục | Trạng thái |
| --- | --- |
| Source compile | PASS |
| ESLint | PASS |
| TypeScript | PASS |
| Unit tests | PASS — 942/942 |
| Production build | PASS — 35/35 pages |
| Domain/CORS root cause | CONFIRMED |
| Source fix | COMPLETED |
| Vercel redeploy | PENDING |
| Production credential E2E | PENDING |
| Vercel Preview auth | BACKEND/OAUTH CONFIG REQUIRED |

---

## 10. Mục lục phần báo cáo tổng hợp mở rộng

1. Phương pháp đánh giá và mức độ tin cậy.
2. Thống kê codebase và bộ kiểm thử.
3. Bảy nhóm rủi ro performance cấp Critical.
4. Bốn nhóm rủi ro security.
5. Ba nhóm code quality và ba nhóm minor issues.
6. Phân tích hai lỗi API runtime `409 Conflict` và `403 Forbidden`.
7. Roadmap xử lý bốn tuần.
8. Performance budgets và công cụ đo.
9. Phân công trách nhiệm, success metrics và risk mitigation.
10. Appendix: file cần refactor, hooks cần audit và error-code whitelist.

## 11. Phương pháp đánh giá và mức độ tin cậy

Tài liệu này phân biệt ba loại kết luận:

| Nhãn | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `CONFIRMED` | Đã được source, test hoặc HTTP response thực tế xác nhận | CORS `www` trả 403; 942 test pass; build 35/35 |
| `SOURCE-CONFIRMED` | Luồng gọi và điều kiện trong source đã được xác nhận, nhưng chưa chạy E2E bằng credential thật | Header prefetch `/progress` không kiểm tra Team Leader |
| `MEASUREMENT-REQUIRED` | Nhận định từ báo cáo tổng hợp nhưng chưa có profiler, heap snapshot hoặc bundle report đi kèm | Freeze 3–5 giây; leak 50–100 MB/phút; bundle 2,1 MB |

### 11.1 Hiệu chỉnh số liệu kiểm thử

Báo cáo tổng hợp cũ ghi đồng thời:

```text
Test coverage: 98.93%
Tests: 934/934 passed
```

Hai số liệu này không đồng nghĩa:

- `934/934` tương ứng **test pass rate 100%** tại lần chạy cũ.
- Coverage 98,93% chỉ hợp lệ nếu có báo cáo V8 coverage theo line/statement/function/branch; số lượng test pass không tự chứng minh coverage.
- Sau các regression test của đợt audit hiện tại, kết quả canonical là **942/942 test pass**, 100 test files.
- Coverage 98,93% được giữ như số liệu do báo cáo cũ cung cấp, nhưng phải đo lại bằng `npm run test:coverage` trước khi dùng trong nghiệm thu.

### 11.2 Hiệu chỉnh các số liệu performance

Các số liệu sau là baseline do báo cáo tổng hợp nêu, chưa phải kết quả benchmark được tái hiện trong đợt audit này:

- Time to Interactive 4,2 giây.
- Sprint View lag 2–3 giây.
- Graph freeze 3–5 giây.
- Memory leak 50–100 MB/phút.
- Bundle tổng 2,1 MB.
- Scroll 20–30 FPS.

Phải đo lại bằng Chrome Performance/Memory, React Profiler, Lighthouse và bundle analyzer trên cùng dataset trước và sau thay đổi.

## 12. Tổng quan codebase từ báo cáo tổng hợp

### 12.1 Quy mô được báo cáo

| Chỉ số | Giá trị trong báo cáo | Trạng thái xác minh |
| --- | ---: | --- |
| TypeScript/React files | 400+ | Cần chạy thống kê lại theo commit hiện tại |
| Lines of code | 80.000+ LOC | Cần loại trừ test/generated/node_modules khi đo lại |
| Feature modules | 13 | Phù hợp cấu trúc feature-based hiện tại |
| `useEffect` | Khoảng 380+ | Cần thống kê AST/`rg` lại |
| `useMemo` | Khoảng 250+ | Cần thống kê AST/`rg` lại |
| `useCallback` | Khoảng 180+ | Cần thống kê AST/`rg` lại |
| Hook dependency cần audit | Khoảng 60 | `MEASUREMENT-REQUIRED`, không mặc định coi là lỗi |

### 12.2 Điểm mạnh

- Kiến trúc feature-based, tách theo Student/Lecturer/Admin rõ ràng.
- TypeScript và ESLint đang pass.
- API service, TanStack Query và Zustand được tổ chức tập trung.
- Auth có session cookie, CSRF, step-up và role routing.
- Jira, GitHub, Firebase/SSE và graph đã có integration layer riêng.
- Bộ unit test lớn, bao gồm Normal/Abnormal/Boundary cases.

### 12.3 Danh sách component lớn được báo cáo

> Số dòng dưới đây là snapshot từ báo cáo đính kèm, có thể lệch so với source hiện tại và không tự chứng minh component có lỗi runtime.

| Ưu tiên | Component/file | Số dòng được báo cáo | Nhận định |
| --- | --- | ---: | --- |
| P0 | `cytoscape-graph-canvas.tsx` | 1.200+ | Cần tách orchestration/layout/event bindings |
| P0 | `sprint-progress-view.tsx` | 673 | Cần tách query orchestration, filters và views |
| P1 | `student-weekly-commits-chart.tsx` | 450 | Cần đo lại Recharts render cost |
| P1 | `traceability-graph-view.tsx` | 420 | Cần tách graph state và inspector |
| P2 | `pipeline-workspace.tsx` | 380 | Cần xác minh file/path hiện tại trước khi tạo ticket |
| P2 | `issue-details-modal.tsx` | 350 | Modal chứa nhiều domain interaction |
| P2 | `sprint-backlog-view.tsx` | 320 | Danh sách lớn, có khả năng cần virtualization |
| P2 | `team-project-detail-page.tsx` | 290 | Cần tách data state và presentation |
| P2 | `course-overview-page.tsx` | 280 | Cần xác minh file/path hiện tại |
| P3 | `lecturer-graph-view.tsx` | 270 | Có thể tách filter/query mapping |

## 13. Bảy nhóm rủi ro Performance cấp Critical

### PERF-01 — `SprintProgressView` quá nhiều trách nhiệm

**Báo cáo nêu:** component khoảng 673 dòng, nhiều query, state, filter và view; có thể lag 2–3 giây khi filter/search.  
**Mức tin cậy:** `MEASUREMENT-REQUIRED` cho số thời gian; source xác nhận component đang làm orchestration lớn.

Rủi ro:

- Filter task chạy lại khi nhiều dependency thay đổi.
- Board, backlog, timeline và modal dùng chung nhiều state.
- Nhiều nguồn dữ liệu Jira làm dependency/query phức tạp.
- Search có thể cập nhật đồng bộ trên danh sách lớn.

Hướng xử lý:

1. Tách container, filter panel, board, backlog và analytics.
2. Tách filter logic vào custom hook thuần và benchmark riêng.
3. Dùng `useDeferredValue`/transition cho search nếu profiler chứng minh cần thiết.
4. Không thêm memoization đại trà khi chưa đo; chỉ memoize computation hoặc component có cost thực tế.
5. Test với dataset 50, 200 và 500 task.

### PERF-02 — `CytoscapeGraphCanvas` có nguy cơ block main thread

**Báo cáo nêu:** file 1.200+ dòng, freeze 3–5 giây với hơn 200 node và leak 50–100 MB mỗi lần navigate.  
**Mức tin cậy:** `MEASUREMENT-REQUIRED` cho timing/memory; kích thước và độ phức tạp cần refactor.

Rủi ro:

- Layout calculation và position mapping chạy đồng bộ.
- Cytoscape instance có thể bị khởi tạo lại nếu topology reference thay đổi.
- Event listeners và graph instance phải được remove/destroy đúng lifecycle.
- Zoom/pan/style update có thể tạo CPU spike trên graph lớn.

Hướng xử lý:

- Heap snapshot trước/sau 20 lần mount/unmount.
- Kiểm tra `cy.destroy()`, listener cleanup và reference retention.
- Progressive rendering hoặc giới hạn subgraph mặc định.
- Chỉ chuyển layout sang Web Worker nếu layout hiện tại thật sự chiếm main-thread time và library/serialization hỗ trợ.

### PERF-03 — `UserRealtimeProvider` và SSE lifecycle

**Báo cáo nêu:** leak 10–20 MB/phút do EventSource/listener.  
**Mức tin cậy:** `MEASUREMENT-REQUIRED`; source hiện đã có một provider duy nhất trong dashboard layout nhưng vẫn cần stress test reconnect.

Checklist:

- Không mở hai EventSource cho cùng user.
- Cleanup listener và `close()` khi logout, account disabled hoặc unmount.
- Handler/callback phải có reference ổn định.
- Backoff reconnect không tạo timer chồng nhau.
- Test 30 phút với online/offline và đổi route liên tục.

### PERF-04 — `StudentWeeklyCommitsChart` và Recharts re-render

**Báo cáo nêu:** toggle chart có thể lag 200–500 ms.  
**Mức tin cậy:** `MEASUREMENT-REQUIRED`.

Hướng xử lý:

- Đo commit duration bằng React Profiler.
- Chuẩn hóa chart data một lần ở selector/helper.
- Tách Area/Bar chart thành component nhỏ nếu profiler cho thấy remount tốn kém.
- Đưa constant config ra ngoài component.
- Dynamic import chart đã được source sử dụng ở dashboard; cần đo hiệu quả thực tế thay vì mặc định thêm `memo`.

### PERF-05 — Dashboard layout cascade re-render

Rủi ro được báo cáo:

- Layout subscribe nhiều field từ auth store.
- Session query, role guard và realtime provider có thể ảnh hưởng toàn subtree.
- Context/provider value hoặc component children thay đổi gây render lan truyền.

Hướng xác minh:

- Bật React Profiler “Record why each component rendered”.
- Đo login, đổi course, nhận SSE notification và chuyển route.
- Dùng selector nhỏ cho Zustand thay vì subscribe toàn store nếu profiler xác nhận cascade.

### PERF-06 — Audit `useMemo`/`useCallback`

Báo cáo ước tính khoảng 60 hook cần audit. Không được coi dependency array dài là lỗi mặc định. Audit phải kiểm tra:

- Dependency thiếu gây stale closure.
- Object/array/function được tạo lại làm mất memoization.
- Memo computation rẻ nhưng chi phí quản lý memo cao hơn lợi ích.
- Callback chỉ dùng cho DOM event thông thường, không truyền vào memoized child.
- Query key có object không ổn định hoặc thiếu dimension.

### PERF-07 — Chưa có virtual scrolling cho danh sách lớn

Rủi ro áp dụng cho task list, commit history, graph table và các danh sách 200–500 item.

Virtualization chỉ nên triển khai khi:

- Dataset thực tế đủ lớn.
- DOM count và long task được profiler xác nhận.
- Chiều cao row hoặc dynamic measurement được thiết kế phù hợp.
- Accessibility, keyboard navigation và drag/drop không bị phá vỡ.

## 14. Bốn nhóm rủi ro Security

### SEC-01 — CSRF concurrency/race condition

Báo cáo cũ coi shared promise là race condition. Source hiện dùng single-flight promise, đây thường là cơ chế chống request trùng chứ không tự nó là lỗi. Rủi ro thực tế cần kiểm tra là:

- Request `forceRefresh` đến trong lúc request thường đang pending.
- Token cũ còn trong sessionStorage/cookie sau khi session đổi.
- Nhiều mutation nhận lỗi CSRF cùng lúc.
- Retry nhầm mọi response 403.

Trong đợt audit này, phần retry nhầm 403 đã được sửa: chỉ mã CSRF tường minh mới được retry tối đa một lần. Cần bổ sung test concurrency nếu Backend có contract xoay token cụ thể.

### SEC-02 — Server error message và XSS

Báo cáo cảnh báo hiển thị trực tiếp server message. Với React/Sonner render text bình thường, chuỗi `<img onerror=...>` không mặc định được thực thi như HTML; vì vậy chưa đủ bằng chứng kết luận có exploitable XSS.

Tuy nhiên vẫn có rủi ro:

- Lộ thông tin nội bộ/stack trace từ Backend.
- Nội dung không nhất quán hoặc gây social engineering.
- Component khác có thể dùng `dangerouslySetInnerHTML` trong tương lai.

Khuyến nghị:

- Whitelist thông báo theo error code cho auth/security-sensitive flows.
- Backend không trả stack trace hoặc exception detail.
- Không render error bằng raw HTML.
- Dùng fallback an toàn cho code không nhận diện.

### SEC-03 — Auth event silent failure và redirect race

Source có các best-effort `.catch(() => {})` khi logout/clear cache. Điều này không trực tiếp làm bypass authorization vì Backend vẫn kiểm tra session, nhưng có thể che mất lỗi vận hành.

Khuyến nghị:

- Deduplicate `saga:unauthorized` và `saga:account-disabled`.
- Ghi telemetry an toàn, không log token/cookie.
- Dùng một logout orchestrator duy nhất.
- Bảo đảm redirect chỉ xảy ra một lần và giữ `next` an toàn.

### SEC-04 — Dữ liệu persist trong localStorage

Zustand hiện persist user/session presentation state và selected course. Rủi ro chính là dữ liệu stale hoặc bị đọc nếu origin đã có XSS; localStorage không phải nơi lưu session secret.

Yêu cầu:

- Không lưu access token, refresh token, API token hoặc credential integration.
- `/api/auth/me` vẫn là nguồn canonical sau reload.
- Logout/account-disabled phải clear state và user-scoped query cache.
- Rà soát Firebase installation ID và theme key riêng, không đánh đồng với auth secret.

## 15. Code Quality và Minor Issues

### 15.1 Ba nhóm Code Quality

#### CQ-01 — Component size anti-pattern

Khoảng 10–15 component được báo cáo lớn hơn 300 dòng. Mục tiêu không phải ép mọi file dưới một con số tùy ý mà là tách theo boundary có ý nghĩa:

- Query/data orchestration.
- Domain transformation.
- Presentation.
- Dialog/form state.
- Heavy visualization.

#### CQ-02 — Error handling không thống nhất

Các pattern đang cùng tồn tại:

- `throw new Error("Throw ValidationException: ...")`.
- Error được gắn thêm `code`, `status`, `data`.
- Một số call site tự đọc `response.data` dù interceptor đã chuẩn hóa error.
- Toast helper được gọi với nhiều dạng tham số.

Khuyến nghị tạo `ApiError`/typed error thống nhất, giữ `code`, `status`, `data`, `cause` và mapping UI tập trung.

#### CQ-03 — Thiếu performance guardrail

- Chưa có performance regression benchmark bắt buộc.
- Chưa có bundle budget trong CI.
- Chưa có dataset lớn chuẩn cho graph/task/commit.
- Memoization/lazy loading chưa có tiêu chí áp dụng thống nhất.

### 15.2 Ba nhóm Minor

#### MINOR-01 — Magic numbers và hardcoded values

Các timeout, stale time, debounce, page size và threshold nên có named constants khi được dùng lặp lại hoặc có ý nghĩa nghiệp vụ.

#### MINOR-02 — Console trong production

Audit source hiện tại chỉ thấy:

- `console.error` trong Global/Dashboard Error Boundary.
- `console.log` trong test reporter.

Không có bằng chứng về console log rác diện rộng trong runtime. Nếu bổ sung logging utility, cần phân biệt telemetry production với debug development.

#### MINOR-03 — Unused imports/dead code

ESLint đang pass nên không có bằng chứng về unused import theo rule hiện tại. Vẫn có thể dùng `knip`/`depcheck` để tìm unused export/dependency, nhưng phải review thủ công trước khi xóa.

## 16. Phân tích chi tiết hai lỗi API trong Console

Hai request trong ảnh đã đến Backend và nhận HTTP response nghiệp vụ. Đây không phải lỗi CORS hoặc browser không kết nối được.

### 16.1 API Sprint trả `409 Conflict`

```text
GET /api/projects/{projectId}/sprints
409 Conflict
```

Call chain:

```text
StudentDashboardAnalytics
→ useProjectSprints(projectId)
→ ProjectSprintService.getSprints(projectId, jiraIntegrationId?)
→ GET /api/projects/{projectId}/sprints
```

#### Ý nghĩa HTTP

`409` cho biết request hợp lệ về cú pháp và đã đến Backend, nhưng trạng thái hiện tại của project/integration không cho phép Backend trả một kết quả duy nhất.

#### Nguyên nhân có xác suất cao nhất

Project hỗ trợ Multi-Jira Sources nhưng request trong ảnh không có query param `jiraIntegrationId`.

Trong `useProjectSprints`:

1. `useJiraSources` và integration summary tải bất đồng bộ.
2. Ở render đầu tiên, `activeSources` có thể vẫn rỗng.
3. `resolvedIntegrationId` vì thế là `undefined`.
4. Query Sprint vẫn được bật chỉ vì đã có `projectId`.
5. Backend nhận `/sprints` không có source; nếu project có nhiều source active hoặc không có default rõ ràng, Backend trả `409`.

Đây là một race/enable-condition ở FE, khác với CSRF race trong báo cáo performance.

#### Các khả năng khác cần loại trừ bằng response body

- Không còn Jira source active.
- Jira source đã `REVOKED`/`FAILED`.
- Board/project Jira chưa cấu hình hoàn chỉnh.
- Backend phát hiện dữ liệu integration xung đột.

#### Cách xác nhận chính xác

Mở DevTools → Network → request `/sprints` → tab Response, ghi lại:

```json
{
  "code": "BACKEND_ERROR_CODE",
  "message": "Backend explanation"
}
```

Không nên chỉ dựa vào status 409. `error.data` trong Axios error chuẩn hóa cũng có thể chứa payload này.

#### Hướng sửa đề xuất

- Không enable query Sprint cho tới khi Jira source query đã settle.
- Nếu có đúng một active source, truyền source đó.
- Nếu có nhiều active source, dùng source người dùng chọn; không âm thầm lấy source đầu tiên cho mọi màn hình.
- Nếu không có active source, hiển thị empty/setup state thay vì gọi `/sprints`.
- Không retry 409 tự động; thay đổi điều kiện/source trước khi gọi lại.
- Bổ sung regression test: loading sources, zero source, one source, multiple sources và explicit source.

### 16.2 API Progress trả `403 Forbidden`

```text
GET /api/projects/{projectId}/progress
403 Forbidden
```

Call chain từ ảnh:

```text
TopNavTabs.handleMouseEnter
→ usePrefetchProjectProjection(projectId)
→ ProjectProjectionService.getProjectProgress(projectId)
→ GET /api/projects/{projectId}/progress
```

#### Contract phân quyền

Endpoint `/progress` chỉ dành cho:

- Lecturer được phân công vào course chứa project.
- Student có vai trò `ACTIVE Team Leader` của đúng team/project.

Student Member thường phải nhận `403`. Dashboard cá nhân dành cho cả Leader và Member là:

```text
GET /api/student/courses/{courseId}/dashboard
```

#### Nguyên nhân frontend

Trang dashboard chính đã guard query bằng `isLeader && activeTab === "team"`. Tuy nhiên header navigation có prefetch khi hover:

1. Header lấy `projectId` từ course/team cache.
2. Khi hover tab, `prefetchProjectProjection(projectId)` được gọi.
3. Hàm prefetch luôn gọi `/progress` mà không kiểm tra `myRole/teamRole`.
4. Với Member thường, Backend từ chối đúng contract và trả 403.

Vì thế đây là **prefetch sai quyền ở frontend**, không phải Backend hỏng.

#### Hướng sửa đề xuất

- Chỉ prefetch `/progress` khi cache xác nhận user là `LEADER`.
- Lecturer chỉ prefetch khi đang trong course được phân công.
- Member dùng Student Dashboard BFF, không gọi project team progress.
- Không retry 403; retry không làm thay đổi quyền.
- Có thể bỏ prefetch progress khỏi generic `prefetchProjectProjection` và truyền capability rõ ràng như `includeTeamProgress`.
- Bổ sung test hover navigation cho Member và Leader.

### 16.3 So sánh hai lỗi

| Lỗi | Loại | Có phải auth/CORS? | Root cause có khả năng cao | Hành động |
| --- | --- | --- | --- | --- |
| `/sprints` 409 | Conflict trạng thái/config | Không | Thiếu Jira source khi query chạy quá sớm hoặc source ambiguity | Chờ source resolution và truyền `jiraIntegrationId` |
| `/progress` 403 | Authorization | Session có thể hợp lệ nhưng thiếu quyền | Header prefetch Leader-only API cho Member | Guard theo capability/role, không retry |

## 17. Roadmap xử lý bốn tuần

Roadmap dưới đây được hiệu chỉnh để bắt đầu bằng đo đạc và lỗi runtime đã xác nhận, thay vì refactor lớn ngay lập tức.

### Tuần 1 — P0: Runtime, auth, API và baseline

1. Redeploy canonical-domain redirect và smoke test login.
2. Sửa query `/sprints` chờ Jira source resolution.
3. Sửa navigation prefetch không gọi `/progress` cho Member.
4. Thu response code/message thật của 409/403 và bổ sung UI state phù hợp.
5. Chạy Lighthouse, React Profiler, bundle analyzer và heap snapshot để tạo baseline thật.
6. Stress test SSE reconnect/logout/account-disabled.
7. Chốt error-code mapping cho auth/security flows.

**Kết quả mong đợi:** không còn CORS login, không còn 409 do source-loading race, không còn 403 do unauthorized prefetch.

### Tuần 2 — P1: Performance có bằng chứng

1. Audit hook/component xuất hiện trong profiler hot path.
2. Tối ưu Sprint filters/search dựa trên commit duration.
3. Virtualize danh sách có DOM count thực sự lớn.
4. Đo và sửa Cytoscape mount/layout/listener lifecycle.
5. Đo Recharts render, ổn định chart data/config khi cần.
6. Thêm performance fixtures 50/200/500 records.

### Tuần 3 — P2: Refactor và error architecture

1. Tách `SprintProgressView` và graph canvas theo domain boundary.
2. Chuẩn hóa `ApiError` và error-code mapping.
3. Tách query orchestration khỏi presentation.
4. Review query keys, enabled conditions và retry policies.
5. Bổ sung unit/integration test cho các boundary mới.

### Tuần 4 — P3: Guardrails, cleanup và documentation

1. Thêm bundle budget và Lighthouse CI nếu phù hợp hạ tầng.
2. Dùng `knip`/`depcheck` có review để tìm dead code.
3. Chuẩn hóa constants cho timeout/page size/stale time.
4. Viết Performance Guidelines và Query Authorization Guidelines.
5. Chạy lại E2E theo ba role và cập nhật tài liệu audit.

## 18. Performance budgets đề xuất

| Metric | Baseline từ báo cáo cũ | Target | Công cụ | Trạng thái baseline |
| --- | ---: | ---: | --- | --- |
| Initial Load | 3,5 giây | < 1,5 giây | Lighthouse | Cần đo lại |
| Time to Interactive | 4,2 giây | < 2,0 giây | Lighthouse | Cần đo lại |
| First Contentful Paint | 1,8 giây | < 1,0 giây | Lighthouse | Cần đo lại |
| Largest Contentful Paint | 3,2 giây | < 2,0 giây | Lighthouse | Cần đo lại |
| Main bundle | 850 KB | < 500 KB | Bundle analyzer | Cần đo lại |
| Total bundle | 2,1 MB | < 1,2 MB | Bundle analyzer | Cần đo lại |
| Memory idle | 180 MB | < 100 MB | Chrome Memory | Cần đo lại |
| Memory growth | 50–100 MB/phút | < 5 MB/phút | Heap snapshots | Cần đo lại |
| Sprint View interaction | 2–3 giây | < 300 ms | React Profiler | Cần đo lại |
| Graph render | 3–5 giây | < 1 giây | Performance marks | Cần đo lại |
| Scroll FPS | 20–30 | > 55 | Chrome FPS meter | Cần đo lại |

## 19. Công cụ và cách đo đề xuất

### 19.1 Công cụ ưu tiên, không cài tất cả cùng lúc

- React DevTools Profiler: render/commit duration và render reason.
- Chrome Performance: long task, scripting/layout/paint.
- Chrome Memory: heap snapshot và detached nodes.
- Lighthouse/Lighthouse CI: Web Vitals và regression.
- `@next/bundle-analyzer`: route/chunk bundle composition.
- `knip`: unused exports/files.
- `depcheck`: tham khảo unused dependency, cần review false positive.
- `size-limit`: enforce bundle budget sau khi có baseline.

### 19.2 Dataset chuẩn

Mỗi benchmark nên chạy tối thiểu với:

- 50, 200 và 500 task.
- 50, 200 và 500 commit.
- Graph 50, 200 và 500 node với edge density xác định.
- 1 và nhiều Jira source.
- Student Leader, Student Member và Lecturer.

### 19.3 Quy tắc đo

1. Cùng commit, browser, device và network profile.
2. Chạy production build, không dùng Fast Refresh làm benchmark cuối.
3. Mỗi scenario chạy ít nhất năm lần, báo median và p95.
4. Heap snapshot sau số vòng mount/unmount cố định.
5. Không tuyên bố fix memory leak chỉ dựa Task Manager.

## 20. Phân công trách nhiệm đề xuất

| Vai trò | Trách nhiệm |
| --- | --- |
| Tech Lead/Senior | Chốt architecture, canonical auth/API contract, review P0 và quyết định Web Worker/virtualization |
| Performance owner | Profiler baseline, Sprint/Graph/Chart optimization, performance budget |
| Security owner | CORS/cookie/OAuth, CSRF retry, error-code mapping, auth event lifecycle |
| API integration owner | Multi-Jira source resolution, query permissions, 409/403 regression tests |
| QA/Test owner | E2E ba role, dataset lớn, memory/reconnect tests, Lighthouse CI |
| Documentation owner | Cập nhật business spec, handoff guide, audit evidence và status matrix |

## 21. Success metrics và risk mitigation

### 21.1 Success metrics bắt buộc

- 942/942 hoặc cao hơn vẫn pass sau refactor.
- Lint, TypeScript và production build tiếp tục pass.
- Không còn CORS login trên canonical production domain.
- Không gọi `/progress` cho Student Member.
- Không gọi `/sprints` trước khi xác định được source state.
- Không có EventSource/Cytoscape instance tăng tuyến tính qua vòng mount/unmount.
- Performance target được chứng minh bằng artifact profiler, không chỉ cảm nhận.

### 21.2 Risk mitigation

| Risk | Tác động | Xác suất | Biện pháp |
| --- | --- | --- | --- |
| Refactor gây regression | Cao | Trung bình | Incremental PR, characterization test, feature flag khi cần |
| Virtualization phá drag/drop/a11y | Cao | Trung bình | Prototype nhỏ, keyboard test, fallback threshold |
| Web Worker tăng độ phức tạp | Trung bình | Trung bình | Chỉ triển khai sau profiler và proof of concept |
| OAuth callback hỏng | Cao | Trung bình | Không proxy OAuth trước khi Backend hỗ trợ forwarded host |
| Timeline trượt | Trung bình | Cao | Ưu tiên confirmed bugs trước speculative optimization |
| Preview auth không ổn định | Cao | Cao | CORS allow-list và callback riêng cho preview/staging |

## 22. Appendix A — 15 file ưu tiên review/refactor

Danh sách từ báo cáo tổng hợp; cần xác minh path/tên file còn tồn tại trước khi tạo ticket.

1. `src/features/student/sprint-progress/components/sprint-progress-view.tsx`
2. `src/features/graph/components/cytoscape-graph-canvas.tsx`
3. `src/features/notification/providers/user-realtime-provider.tsx`
4. `src/features/student/dashboard/components/student-weekly-commits-chart.tsx`
5. `src/app/(dashboard)/layout.tsx`
6. `src/features/graph/components/traceability-graph-view.tsx`
7. `src/features/graph/components/pipeline-workspace.tsx`
8. `src/features/student/sprint-progress/components/issue-details-modal.tsx`
9. `src/features/student/sprint-progress/components/sprint-backlog-view.tsx`
10. `src/features/lecturer/courses/components/team-project-detail-page.tsx`
11. `src/features/lecturer/courses/components/course-overview-page.tsx`
12. `src/features/graph/components/lecturer-graph-view.tsx`
13. `src/features/student/contribution/components/contribution-view.tsx`
14. `src/features/lecturer/peer-review/components/peer-review-workspace.tsx`
15. `src/features/student/commits/components/commits-view.tsx`

## 23. Appendix B — 20 hook/computation cần audit

Line number trong báo cáo cũ có thể đã drift; định vị lại bằng symbol trước khi sửa.

1. `SprintProgressView.filteredIssues`.
2. `SprintProgressView.boardIssues`.
3. `SprintProgressView.sprints` mapping.
4. `SprintProgressView.epics` mapping.
5. `CytoscapeGraphCanvas.normalizedNodes`.
6. `CytoscapeGraphCanvas.normalizedEdges`.
7. `CytoscapeGraphCanvas.applyLayout`.
8. `StudentWeeklyCommitsChart.chartData`.
9. `StudentWeeklyCommitsChart.totalCommits`.
10. `StudentWeeklyCommitsChart.peakDay`.
11. `ContributionView.contributionData`.
12. `PipelineWorkspace.pipelineNodes` nếu file còn tồn tại.
13. `IssueDetailsModal.availableAssignees`.
14. `SprintBacklogView.sprintIssues`.
15. `CommitsView.filteredCommits`.
16. `TeamProjectDetailPage.teamProgress`.
17. `PeerReviewWorkspace.reviewMatrix` nếu file còn tồn tại.
18. `TraceabilityGraphView.graphElements`.
19. `CourseOverviewPage.courseStats` nếu file còn tồn tại.
20. `LecturerGraphView.lecturerGraphData`.

Mỗi mục chỉ được đánh dấu lỗi sau khi xác nhận ít nhất một trong các dấu hiệu: stale result, repeated expensive computation, unstable child prop, excessive commit duration hoặc incorrect query behavior.

## 24. Appendix C — Error-code whitelist đề xuất

Danh sách dưới đây là mẫu UI mapping; phải đối chiếu OpenAPI/Backend source trước khi coi là contract chính thức.

### Authentication và authorization

| Code | Thông báo an toàn đề xuất |
| --- | --- |
| `INVALID_CREDENTIALS` | Tên đăng nhập hoặc mật khẩu không chính xác. |
| `ACCOUNT_DISABLED` | Tài khoản đã bị vô hiệu hóa. |
| `ACCOUNT_LOCKED` | Tài khoản đang tạm khóa. |
| `PASSWORD_EXPIRED` | Mật khẩu đã hết hạn. |
| `SESSION_EXPIRED` | Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại. |
| `TOKEN_INVALID` | Thông tin xác thực không hợp lệ. |
| `PERMISSION_DENIED` | Bạn không có quyền thực hiện thao tác này. |
| `ACCESS_DENIED` | Bạn không có quyền truy cập dữ liệu này. |
| `ROLE_REQUIRED` | Vai trò hiện tại không được phép thực hiện thao tác. |
| `FEATURE_DISABLED` | Tính năng này chưa được kích hoạt. |

### Validation, network và CSRF

| Code | Thông báo an toàn đề xuất |
| --- | --- |
| `VALIDATION_ERROR` | Dữ liệu không hợp lệ. |
| `REQUIRED_FIELD` | Vui lòng nhập đầy đủ trường bắt buộc. |
| `INVALID_FORMAT` | Dữ liệu không đúng định dạng. |
| `VALUE_TOO_LONG` | Giá trị vượt quá độ dài cho phép. |
| `VALUE_TOO_SHORT` | Giá trị chưa đạt độ dài tối thiểu. |
| `NETWORK_ERROR` | Không thể kết nối đến máy chủ. |
| `TIMEOUT` | Yêu cầu đã hết thời gian chờ. |
| `RATE_LIMIT_EXCEEDED` | Bạn đang thao tác quá nhanh. Vui lòng thử lại sau. |
| `INVALID_CSRF_TOKEN` | Phiên bảo mật không hợp lệ. Vui lòng tải lại trang. |
| `CSRF_TOKEN_INVALID` | Phiên bảo mật không hợp lệ. Vui lòng tải lại trang. |
| `MISSING_CSRF_TOKEN` | Thiếu thông tin bảo mật. Vui lòng tải lại trang. |
| `CSRF_VALIDATION_FAILED` | Không thể xác minh phiên bảo mật. |
| `STEP_UP_REQUIRED` | Yêu cầu xác thực bổ sung. |
| `MFA_REQUIRED` | Yêu cầu xác thực hai bước. |

### Resource và integration

| Code | Thông báo an toàn đề xuất |
| --- | --- |
| `RESOURCE_NOT_FOUND` | Không tìm thấy dữ liệu yêu cầu. |
| `RESOURCE_DELETED` | Dữ liệu đã bị xóa. |
| `RESOURCE_CONFLICT` | Dữ liệu đang xung đột. Vui lòng tải lại. |
| `INTEGRATION_NOT_FOUND` | Không tìm thấy kết nối tích hợp. |
| `INTEGRATION_REVOKED` | Kết nối tích hợp đã bị thu hồi. |
| `JIRA_CONNECTION_FAILED` | Không thể kết nối Jira. |
| `JIRA_AUTH_FAILED` | Xác thực Jira thất bại. |
| `JIRA_WORKSPACE_NOT_FOUND` | Không tìm thấy Jira workspace. |
| `JIRA_PROJECT_NOT_FOUND` | Không tìm thấy Jira project. |
| `JIRA_SPRINT_NOT_FOUND` | Không tìm thấy Sprint. |
| `JIRA_TASK_NOT_FOUND` | Không tìm thấy Jira task. |
| `JIRA_RATE_LIMIT` | Jira đang giới hạn request. Vui lòng thử lại sau. |
| `GITHUB_AUTH_FAILED` | Xác thực GitHub thất bại. |
| `GITHUB_INSTALLATION_NOT_FOUND` | Không tìm thấy GitHub App installation. |
| `GITHUB_REPO_NOT_FOUND` | Không tìm thấy repository. |
| `GITHUB_COMMIT_NOT_FOUND` | Không tìm thấy commit. |
| `GITHUB_RATE_LIMIT` | GitHub đang giới hạn request. Vui lòng thử lại sau. |

### Server và business logic

| Code | Thông báo an toàn đề xuất |
| --- | --- |
| `SERVER_ERROR` | Máy chủ gặp lỗi. Vui lòng thử lại sau. |
| `SERVICE_UNAVAILABLE` | Dịch vụ tạm thời không khả dụng. |
| `MAINTENANCE_MODE` | Hệ thống đang bảo trì. |
| `TEAM_FULL` | Nhóm đã đủ thành viên. |
| `TEAM_NOT_FOUND` | Không tìm thấy nhóm. |
| `COURSE_CLOSED` | Khóa học đã đóng. |
| `SPRINT_ALREADY_STARTED` | Sprint đã bắt đầu. |
| `SPRINT_ALREADY_COMPLETED` | Sprint đã hoàn thành. |
| `TASK_ASSIGNED` | Task đã được phân công. |
| `PEER_REVIEW_CLOSED` | Đợt đánh giá đồng đẳng đã đóng. |
| `PEER_REVIEW_NOT_STARTED` | Đợt đánh giá chưa bắt đầu. |
| `INVALID_REVIEW_TARGET` | Không thể đánh giá người dùng này. |
| `ALREADY_REVIEWED` | Bạn đã hoàn tất đánh giá này. |

## 25. Checklist nghiệm thu hợp nhất

### Auth/Vercel

- [ ] Redeploy và xác nhận `www` chuyển sang apex.
- [ ] Login password và Google hoạt động trên canonical domain.
- [ ] Session reload, logout, account-disabled và setup-password hoạt động.
- [ ] Preview CORS/OAuth được cấu hình riêng nếu dùng.

### API runtime

- [ ] `/sprints` không gọi trước khi Jira source state sẵn sàng.
- [ ] Multiple Jira sources luôn truyền source được chọn.
- [ ] Member hover navigation không gọi `/progress`.
- [ ] 409/403 hiển thị đúng UI state và không retry vô ích.

### Performance/Security

- [ ] Có artifact Lighthouse/Profiler/heap/bundle baseline.
- [ ] SSE và Cytoscape không tăng instance sau navigation loop.
- [ ] Error message security-sensitive dùng code mapping an toàn.
- [ ] Không persist token/credential vào localStorage.
- [ ] Performance budget được đưa vào CI sau khi baseline được duyệt.

### Quality gate

- [ ] ESLint 0 error, 0 warning.
- [ ] TypeScript pass.
- [ ] Toàn bộ unit test pass.
- [ ] Production build pass.
- [ ] E2E ba role pass trên staging/production-like environment.
