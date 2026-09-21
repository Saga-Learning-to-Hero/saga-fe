# ĐẶC TẢ API ADMIN DASHBOARD SUMMARY

> **Phiên bản:** 3.0 — As-built contract
> **Đối tượng:** `saga-be`, `saga-fe`, QA và nhóm làm báo cáo
> **Endpoint canonical:** `GET /api/admin/dashboard/summary`
> **Cập nhật:** 20/09/2026

## 1. Mục tiêu và nguồn dữ liệu

Admin Dashboard cung cấp một snapshot điều hành theo học kỳ gồm:

- quy mô sinh viên, lớp học phần và nhóm đồ án;
- mức độ kết nối Jira/GitHub và Traceability Task–Commit;
- hoạt động Commit/Task Done theo từng lát tuần của học kỳ;
- danh sách nhóm chưa có Project hoặc chưa kết nối đủ tích hợp;
- nhịp nhận webhook Jira/GitHub trên toàn hệ thống;
- metadata cache để FE giải thích độ tươi của dữ liệu.

REST response của endpoint này là nguồn dữ liệu canonical cho dashboard. FE không tự tổng hợp từ nhiều endpoint, không dùng mock fallback và không suy ra health của Jira/GitHub từ số event.

## 2. Endpoint, quyền và query

```http
GET /api/admin/dashboard/summary?semesterId=<UUID>&forceRefresh=false
Cookie: SAGA_SESSION=...
```

| Thành phần | Contract |
| --- | --- |
| Quyền | Chỉ `ADMIN`; `/api/admin/**` được bảo vệ bằng `hasRole("ADMIN")` trong `SecurityConfig` |
| `semesterId` | Tùy chọn. Bỏ trống thì dùng platform active semester trong `active_semester_setting` |
| `forceRefresh` | Tùy chọn, mặc định `false`; yêu cầu refresh summary và integration pulse theo single-flight lock |
| Workload | `HEAVY_READ` |
| Lỗi không có active semester | `404 SEMESTER_NOT_FOUND` |
| Lỗi semester không tồn tại/đã xóa | `404 SEMESTER_NOT_FOUND` |
| Date range semester không hợp lệ | `400 SEMESTER_DATE_RANGE_INVALID` |

`forceRefresh=true` không được hiểu là xóa cache rồi cho mọi request cùng query DB. Một request là owner tính lại; follower chờ generation mới. Nếu timeout nhưng còn snapshot cũ, BE có thể trả snapshot đó với `cacheMetadata.refreshPending=true`.

## 3. Response canonical

```json
{
  "selectedSemester": {
    "id": "semester-uuid",
    "code": "FA26",
    "name": "Fall 2026",
    "startDate": "2026-09-01",
    "endDate": "2026-12-15",
    "totalWeeks": 16,
    "currentWeekIndex": 3,
    "active": true
  },
  "availableSemesters": [
    {
      "id": "semester-uuid",
      "code": "FA26",
      "name": "Fall 2026",
      "startDate": "2026-09-01",
      "endDate": "2026-12-15",
      "active": true,
      "periodStatus": "IN_PROGRESS"
    }
  ],
  "kpis": {
    "totalStudents": 120,
    "studentsGrowthPercentage": 12.5,
    "comparedSemesterCode": "SU26",
    "totalCourses": 8,
    "totalTeams": 24,
    "connectedTeamsCount": 20,
    "connectedTeamsRate": 83.3333333333,
    "totalCommitsSynced": 900,
    "totalJiraTasksSynced": 400,
    "traceabilityRate": 62.5
  },
  "weeklyTimeline": [
    {
      "weekIndex": 1,
      "weekLabel": "Tuần 01",
      "startDate": "2026-09-01",
      "endDate": "2026-09-07",
      "isCurrentWeek": false,
      "commits": 12,
      "tasksCompleted": 4,
      "traceabilityRate": 83.3333333333
    }
  ],
  "unconnectedTeamsAlert": [
    {
      "teamId": "team-uuid",
      "teamNo": 7,
      "teamName": "SAGA Team",
      "courseCode": "SWP391_FA26",
      "lecturerName": "Nguyen Van A",
      "lecturerEmail": "a@fpt.edu.vn",
      "missingService": "BOTH",
      "createdAt": "2026-09-05T00:00:00",
      "daysSinceCreated": 15
    }
  ],
  "integrationPulse": [
    {
      "service": "GITHUB",
      "uniqueEventsReceived24h": 123,
      "uniqueEventsReceived7d": 456,
      "lastUniqueEventAt": "2026-09-19T10:00:00"
    },
    {
      "service": "JIRA",
      "uniqueEventsReceived24h": 94,
      "uniqueEventsReceived7d": 382,
      "lastUniqueEventAt": null
    }
  ],
  "cacheMetadata": {
    "cachedAt": "2026-09-20T04:00:00Z",
    "expiresAt": "2026-09-20T04:10:00Z",
    "ttlSecondsRemaining": 580,
    "refreshPending": false
  }
}
```

## 4. Semantics theo từng phần

### 4.1 Học kỳ

- `startDate` và `endDate` là date-only `YYYY-MM-DD`, không phải timestamp.
- `selectedSemester.active` cho biết semester đang chọn có phải platform active semester hay không.
- `availableSemesters[].periodStatus` là trạng thái theo ngày: `UPCOMING | IN_PROGRESS | COMPLETED`.
- `currentWeekIndex` là tuần 1-based chứa thời điểm hiện tại; trả `null` với kỳ quá khứ/tương lai.
- `totalWeeks = ceil(số ngày inclusive / 7)`, không giới hạn 15 tuần và không snap về thứ Hai.

### 4.2 KPI

| Field | Định nghĩa |
| --- | --- |
| `totalStudents` | Sinh viên enrollment `ACTIVE` thuộc course non-deleted trong semester |
| `studentsGrowthPercentage` | Tăng trưởng so với semester trước; nullable nếu không có mẫu so sánh hoặc mẫu số bằng 0 |
| `comparedSemesterCode` | Mã semester trước; nullable nếu không có semester trước |
| `totalCourses` | Course non-deleted trong semester |
| `totalTeams` | Team thuộc các course đó, kể cả team chưa có Project |
| `connectedTeamsCount` | Team có Project, Jira `ACTIVE` và ít nhất một Git repository `ACTIVE` |
| `connectedTeamsRate` | `connectedTeamsCount / totalTeams * 100`; nullable khi không có team |
| `totalCommitsSynced` | Tổng commit raw trong scope, gồm merge commit |
| `totalJiraTasksSynced` | Task non-deleted trong project thuộc scope |
| `traceabilityRate` | Tỷ lệ non-merge commit có ít nhất một Task–Commit link; nullable khi mẫu số bằng 0 |

### 4.3 Weekly timeline

- Mỗi phần tử là một lát liên tục tối đa 7 ngày, neo từ `semester.startDate`.
- `commits` loại merge commit đã biết (`parentCount > 1`) và bucket theo `coalesce(committedAt, createdAt)`.
- `tasksCompleted` là task **hiện đang** `DONE`, bucket theo `coalesce(completedAt, resolvedAt, createdAt)`. Đây không phải lịch sử chuyển trạng thái bất biến.
- `traceabilityRate` dùng cùng semantic non-merge commit như KPI và có thể `null`.
- `isCurrentWeek` là field duy nhất đánh dấu tuần hiện tại; `weekLabel` không nối hậu tố tùy biến.

### 4.4 Cảnh báo nhóm chưa kết nối

`unconnectedTeamsAlert` luôn là mảng, không trả `null`. Một team chỉ xuất hiện một lần.

| `missingService` | Ý nghĩa |
| --- | --- |
| `PROJECT` | Team chưa có Project |
| `JIRA` | Có Project và GitHub active nhưng Jira chưa active |
| `GITHUB` | Có Project và Jira active nhưng chưa có Git repository active |
| `BOTH` | Có Project nhưng cả Jira và GitHub đều chưa active |

`courseCode`, `lecturerName`, `lecturerEmail` có thể `null`. FE có thể highlight `daysSinceCreated > 7`, nhưng BE không lọc bỏ các team mới tạo.

### 4.5 Integration pulse

`integrationPulse` là metric platform-wide và không đổi theo `semesterId`. Danh sách luôn có hai service theo thứ tự `GITHUB`, `JIRA`.

- Một event là một unique first-seen delivery `(provider, deliveryId)`.
- Redelivery/duplicate không tăng count.
- `lastUniqueEventAt` nullable nếu provider chưa có delivery.
- `0` event không có nghĩa provider đang down.
- Không được suy ra hoặc hiển thị `OPERATIONAL`, latency hay success rate từ response này.

### 4.6 Cache

- Summary cache: `saga:admin:dashboard:summary:v3:{semesterId}`, TTL 600 giây.
- Pulse cache: `saga:admin:dashboard:integration-pulse:v1`, TTL 60 giây.
- `ttlSecondsRemaining` có thể `null` nếu TTL không xác định.
- `refreshPending=true` yêu cầu FE thông báo đang dùng snapshot gần nhất, không hiển thị refresh thành công hoàn toàn.

## 5. Những field không thuộc contract hiện tại

BE hiện **không trả** và FE **không được mock** các field sau:

- `projectHealthDistribution`;
- `sprintMilestones`;
- `integrationsHealth`;
- provider `status`, `latencyMs`, `successRate`, `lastPing`.

Nếu cần các insight trên trong release sau, phải có task BE riêng với định nghĩa, source of truth, timezone và test rõ ràng. Không dùng số event webhook để thay thế health check.

## 6. Audit log

Recent activity trên dashboard tiếp tục dùng endpoint riêng:

```http
GET /api/admin/audit-logs?page=0&size=5
```

Không gộp audit log vào summary response.

## 7. Đối soát triển khai ngày 20/09/2026

| Hạng mục | BE | FE | Ghi chú |
| --- | :---: | :---: | --- |
| Endpoint và phân quyền ADMIN | ✓ | ✓ | Session cookie qua `apiClient` |
| Chọn active/explicit semester | ✓ | ✓ | Selector dùng `availableSemesters` |
| KPI nullable semantics | ✓ | ✓ | Không đổi `null` thành `0%` |
| Weekly Task–Commit chart | ✓ | ✓ | Grouped bars + Traceability line |
| Unconnected teams | ✓ | ✓ | Hỗ trợ `PROJECT`, highlight >7 ngày |
| Integration pulse | ✓ | ✓ | Không gắn nhãn health giả |
| Cache metadata/refresh pending | ✓ | ✓ | Có freshness và warning |
| Force refresh single-flight | ✓ | ✓ | FE dùng response trả về làm cache canonical |
| Recent audit activity | ✓ | ✓ | API riêng |
| Project health/sprint milestone/provider health | — | — | Ngoài contract hiện tại; không mock |

## 8. File triển khai chính

### Backend

- `AdminDashboardController`
- `AdminDashboardService`
- `AdminDashboardQueryService`
- `AdminDashboardPulseService`
- `dto/admin/dashboard/*`
- `SecurityConfig`
- `AdminDashboardControllerWebTest` và các test service/cache/temporal/alert liên quan

### Frontend

- `src/features/admin/dashboard/api/admin-dashboard-service.ts`
- `src/features/admin/dashboard/hooks/use-admin-dashboard.ts`
- `src/features/admin/dashboard/types/dashboard.ts`
- `src/features/admin/dashboard/components/*`
- `tests/unit/features/admin/dashboard/*`
