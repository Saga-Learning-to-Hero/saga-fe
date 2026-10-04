# Hướng dẫn Frontend — Dashboard 1 course cho giảng viên

Playbook kéo API khi FE vẽ **màn dashboard lớp** của giảng viên: KPI lớp, card từng team, risk, sprint hiện tại, activity, peer review, sync. FE **không** tính lại KPI / risk; chỉ render số backend trả về.

Đây **không** phải % đóng góp hay điểm. Công thức grade vẫn nằm ở `GET /api/teams/{teamId}/contribution-evaluation`. Endpoint này **không đọc `contribution_override`**.

Contract nguồn: playbook BE `FRONTEND_LECTURER_COURSE_DASHBOARD_API.md`.

Base path: `/api` (**không** `/api/v1`). Cookie session `SAGA_SESSION`. Mọi request dùng `credentials: "include"` qua `apiClient`. **Không Bearer / JWT.** GET không CSRF.

## Endpoint

```http
GET /api/lecturer/courses/{courseId}/dashboard
GET /api/lecturer/courses/{courseId}/dashboard?teamId={teamId}&jiraIntegrationId={jiraIntegrationId}
GET /api/lecturer/courses/{courseId}/dashboard?teamId={teamId}&sprintId={sprintId}
```

FE omit query `scope`. Chỉ `CURRENT_SPRINT` được phép nếu BE vẫn nhận field này; giá trị khác → `400 INVALID_DASHBOARD_SCOPE`.

Ba dạng request hợp lệ:

- Không chọn gì: không gửi query. BE tự chọn sprint đang chạy có nhiều task nhất cho từng team. FE không tự áp quy tắc này.
- Chọn Site: chỉ `teamId` + `jiraIntegrationId`. BE trả `sprintOptions` đã lọc theo Site đó và `currentSprint` mặc định của Site.
- Chọn Sprint: chỉ `teamId` + `sprintId`. Không gửi kèm `jiraIntegrationId`.

Thiếu `teamId`, hoặc gửi cả Site lẫn Sprint, là request sai — FE không gọi API. Dashboard vẫn là một response cho cả lớp. Site/Sprint chỉ đổi sprint đại diện của team được chọn; các team khác giữ lựa chọn mặc định của BE. Không gọi thêm API theo từng nhóm.

Mở dashboard 1 lớp → **một** GET. Không loop theo team. Không dùng `GET /progress` thay dashboard. Selection chỉ nằm trong state của trang, không ghi lên URL.

## Quyền

- `LECTURER` đúng course → `200`
- `LECTURER` không phụ trách / `ADMIN` → `403 LECTURER_COURSE_FORBIDDEN`
- `courseId` sai → `404 COURSE_NOT_FOUND`
- Chưa login → `401`

Course chưa có team / project / sprint `active` vẫn `200`.

## Field lớp

- Header: `courseCode`, `subjectCode`, `subjectName`, `classCode`, `semesterCode`
- Timestamp: `generatedAt` (UTC), không phải last Jira/GitHub sync
- KPI: `summary.*`
- Task lớp: `taskStatusTotals.*` — `%` `null` khi mẫu số = 0, hiện “—”
- Legend: `riskPolicy` — không hard-code 3/5 ngày hay 20/35 pp

## Field team

`risk.level`: `HEALTHY` | `WARNING` | `CRITICAL` | `UNKNOWN`. FE không tự tính.

`risk.reasons[]`: `code`, `severity`, `actualValue`, `thresholdValue`, `unit`, `affectedStudentProfileIds`.

`code`: `NO_PROJECT`, `NO_ACTIVE_SPRINT`, `INACTIVE`, `DATA_UNAVAILABLE`, `SCHEDULE_LAG`, `BLOCKED_TASKS`, `OVERDUE_TASKS`, `MISSING_TASK_COMMIT_LINK`, `JIRA_SYNC_FAILED`, `GITHUB_SYNC_FAILED`, `CONTRIBUTION_CONFIG_MISSING`, `PEER_REVIEW_INCOMPLETE`.

`projectId == null` → card “chưa có dự án”, không gọi `/progress` hay sprint-activity.

`currentSprint == null` → “Chưa có sprint đang chạy”. `progress` / `traceability` / `peerReview` cũng `null`.

`currentSprint.source`: `jiraIntegrationId`, `siteName`, `projectKey`, `connectionStatus`. Đây là Site của sprint đang xem.

`jiraSources[]`: cùng bốn field, dùng cho dropdown Site. Mảng thiếu được chuẩn hóa thành `[]`.

`sprintOptions[]`: `id`, `name`, `state`. Không có `jiraIntegrationId`; BE lọc danh sách này khi request có `jiraIntegrationId`. Mảng thiếu được chuẩn hóa thành `[]`.

`sprintSelection`: `SELECTED` khi giảng viên đã chọn Site hoặc Sprint của team đó, `DEFAULT` khi đang dùng sprint mặc định của BE, `null` khi team không có project. FE không tự suy trạng thái này.

KPI, heatmap, biểu đồ và team card dùng chung response. Không lọc team riêng trên từng chart.

`reminder` luôn `null` — ẩn lần nhắc, không gọi notification history.

Pending peer dùng `studentProfileId`. Sync: `ACTIVE` / `DEGRADED` / `REVOKED` — không map `CONNECTED`. `sync.*Status == null` = chưa kết nối.

## Việc FE không làm

- Không tự tính `risk.level` / `INACTIVE` / `SCHEDULE_LAG`
- Không hard-code ngưỡng — dùng `riskPolicy`
- Không đọc / ghi `contribution_override` trên màn này
- Không coi dashboard là % đóng góp
- Không gọi Jira/GitHub từ browser
- Không giả định mọi team chung một `sprintId`
- Không gửi `scope=ALL_TIME` / `PREVIOUS_SPRINT`
- Không tự chọn sprint mặc định — BE sở hữu quy tắc “sprint đang chạy có nhiều task nhất”
- Không gọi dashboard theo từng nhóm (không N+1)
- Không gửi đồng thời `jiraIntegrationId` và `sprintId`
