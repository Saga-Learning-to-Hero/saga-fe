# TÀI LIỆU ĐẶC TẢ KỸ THUẬT: API ADMIN DASHBOARD SUMMARY
> **Dành cho Đội ngũ Backend (`saga-be`)**  
> **Phiên bản:** 2.1 (Hoàn thiện 100% Khung thời gian, Biểu đồ Sức khỏe Đồ án & Tiến độ Sprint)  
> **Mục tiêu:** Cung cấp API tổng hợp điều hành toàn hệ thống cho màn hình `/admin/dashboard`.

---

## 1. TỔNG QUAN NGHIỆP VỤ & PHẠM VI THỜI GIAN (TIME SCOPES)

Bảng điều khiển Quản trị viên (Admin Dashboard) phân tách rõ ràng **3 tầng phạm vi thời gian** để phục vụ các mục tiêu giám sát khác nhau:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: PHẠM VI HỌC KỲ (SEMESTER SCOPE: startDate -> endDate)                         │
│ • Tổng sinh viên, số lớp học phần, tổng nhóm đồ án thuộc học kỳ được chọn             │
│ • Tỷ lệ tăng trưởng % so với học kỳ liền trước (Previous Semester Comparison)           │
│ • Tỷ lệ Traceability tổng thể và tổng khối lượng Commits / Jira Tasks tích lũy         │
│ • Phân bổ sức khỏe dự án: Số nhóm Đúng tiến độ, Có rủi ro, Chậm trễ                  │
│ • Tiến độ nghiệm thu trung bình của các Sprint trong kỳ (Sprint 1 -> Sprint 4)        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TẦNG 2: PHÂN RÃ THEO CHUỖI TUẦN HỌC (WEEKLY TIMELINE: Tuần 1 -> Tuần N)               │
│ • Cắt lát từ semester.startDate theo bước nhảy 7 ngày (Thứ Hai 00:00 -> Chủ Nhật 23:59) │
│ • Biểu đồ Commits vs Tasks qua từng tuần để thấy nhịp độ làm việc của sinh viên        │
│ • Đánh dấu tuần hiện tại (isCurrentWeek: true)                                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TẦNG 3: NHỊP TIM HẠ TẦNG THỜI GIAN THỰC (REALTIME PULSE: 24h & 7 ngày gần nhất)        │
│ • Số lượng Webhook events Jira/GitHub nhận được trong 24 giờ qua                       │
│ • Trạng thái sẵn sàng (OPERATIONAL/DOWN), độ trễ (latencyMs), thời điểm ping cuối       │
│ • Cảnh báo nhóm chưa kết nối kèm số ngày trễ (daysSinceCreated)                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CHI TIẾT HỢP ĐỒNG API (API CONTRACT)

### 2.1 Thông tin Endpoint
- **HTTP Method**: `GET`
- **Đường dẫn**: `/api/admin/dashboard/summary`
- **Quyền truy cập**: `@PreAuthorize("hasRole('ADMIN')")` (Cookie session `SAGA_SESSION`).
- **Query Parameters**:
  - `semesterId` *(UUID, tùy chọn)*: 
    - Nếu truyền: BE trả về số liệu của đúng học kỳ đó.
    - Nếu KHÔNG truyền: BE tự động lấy **Học kỳ đang Active** (`isDefault = true`).
  - `forceRefresh` *(Boolean, tùy chọn, mặc định `false`)*: Bỏ qua Redis Cache để quét và tính toán lại ngay lập tức.

---

### 2.2 Cấu Trúc JSON Response Hoàn Chỉnh (`AdminDashboardSummaryResponse`)

```json
{
  "selectedSemester": {
    "id": "7b8f9e12-3456-4789-a012-3b4c5d6e7f8a",
    "code": "FA26",
    "name": "Fall 2026",
    "startDate": "2026-09-01T00:00:00Z",
    "endDate": "2026-12-15T23:59:59Z",
    "totalWeeks": 15,
    "currentWeekIndex": 8,
    "isActive": true
  },
  "availableSemesters": [
    {
      "id": "7b8f9e12-3456-4789-a012-3b4c5d6e7f8a",
      "code": "FA26",
      "name": "Fall 2026",
      "status": "ACTIVE"
    },
    {
      "id": "4a1b2c3d-1111-2222-3333-5e6f7a8b9c0d",
      "code": "SU26",
      "name": "Summer 2026",
      "status": "COMPLETED"
    },
    {
      "id": "9f8e7d6c-5555-6666-7777-1a2b3c4d5e6f",
      "code": "SP27",
      "name": "Spring 2027",
      "status": "UPCOMING"
    }
  ],
  "kpis": {
    "totalStudents": 148,
    "studentsGrowthPercentage": 12.5,
    "comparedSemesterCode": "SU26",
    "totalCourses": 32,
    "totalTeams": 28,
    "connectedTeamsCount": 24,
    "connectedTeamsRate": 85.7,
    "traceabilityRate": 92.4,
    "totalCommitsSynced": 1420,
    "totalJiraTasksSynced": 380,
    "webhookEvents24h": 312,
    "webhookEvents7d": 1845
  },
  "weeklyTimeline": [
    {
      "weekIndex": 1,
      "weekLabel": "Tuần 01",
      "startDate": "2026-09-01T00:00:00Z",
      "endDate": "2026-09-07T23:59:59Z",
      "isCurrentWeek": false,
      "commits": 120,
      "tasksCompleted": 45,
      "traceabilityRate": 82.0
    },
    {
      "weekIndex": 2,
      "weekLabel": "Tuần 02",
      "startDate": "2026-09-08T00:00:00Z",
      "endDate": "2026-09-14T23:59:59Z",
      "isCurrentWeek": false,
      "commits": 210,
      "tasksCompleted": 78,
      "traceabilityRate": 88.5
    },
    {
      "weekIndex": 8,
      "weekLabel": "Tuần 08 (Hiện tại)",
      "startDate": "2026-10-20T00:00:00Z",
      "endDate": "2026-10-26T23:59:59Z",
      "isCurrentWeek": true,
      "commits": 290,
      "tasksCompleted": 85,
      "traceabilityRate": 94.0
    }
  ],
  "projectHealthDistribution": {
    "totalTeams": 32,
    "onTrackCount": 24,
    "onTrackRate": 75.0,
    "atRiskCount": 5,
    "atRiskRate": 15.6,
    "delayedCount": 3,
    "delayedRate": 9.4
  },
  "sprintMilestones": [
    {
      "sprintNo": 1,
      "name": "Sprint 1 (Khởi tạo & Đặc tả SRS)",
      "completionRate": 100.0,
      "status": "COMPLETED"
    },
    {
      "sprintNo": 2,
      "name": "Sprint 2 (Kiến trúc & MVP Coding)",
      "completionRate": 96.8,
      "status": "COMPLETED"
    },
    {
      "sprintNo": 3,
      "name": "Sprint 3 (Tích hợp & Core Logic)",
      "completionRate": 87.5,
      "status": "IN_PROGRESS"
    },
    {
      "sprintNo": 4,
      "name": "Sprint 4 (Testing & Nghiệm thu)",
      "completionRate": 46.8,
      "status": "IN_PROGRESS"
    }
  ],
  "integrationsHealth": [
    {
      "service": "GITHUB",
      "name": "GitHub App & Webhooks",
      "status": "OPERATIONAL",
      "latencyMs": 115,
      "eventsProcessed24h": 218,
      "successRate": 99.8,
      "lastPing": "2026-09-17T15:00:00Z"
    },
    {
      "service": "JIRA",
      "name": "Jira Cloud OAuth2 & Webhooks",
      "status": "OPERATIONAL",
      "latencyMs": 145,
      "eventsProcessed24h": 94,
      "successRate": 99.4,
      "lastPing": "2026-09-17T15:00:00Z"
    }
  ],
  "unconnectedTeamsAlert": [
    {
      "teamId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "teamNo": 7,
      "teamName": "EduConnect - Nền tảng gia sư",
      "courseCode": "SWP490_FA26_SE1705",
      "lecturerName": "TS. Trần Minh Thuận",
      "lecturerEmail": "thuan.tm@fpt.edu.vn",
      "missingService": "JIRA",
      "createdAt": "2026-09-03T08:00:00Z",
      "daysSinceCreated": 14
    },
    {
      "teamId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "teamNo": 12,
      "teamName": "SmartFarm - Hệ thống IoT",
      "courseCode": "SWP391_FA26_SE1708",
      "lecturerName": "ThS. Đỗ Khắc Nghĩa",
      "lecturerEmail": "nghia.dk@fpt.edu.vn",
      "missingService": "BOTH",
      "createdAt": "2026-09-01T09:30:00Z",
      "daysSinceCreated": 16
    }
  ],
  "cacheMetadata": {
    "cachedAt": "2026-09-17T15:10:00Z",
    "expiresAt": "2026-09-17T15:20:00Z",
    "ttlSecondsRemaining": 600
  }
}
```

---

## 3. THUẬT TOÁN TÍNH TOÁN & LOGIC CHI TIẾT PHÍA BACKEND

### 3.1 Thuật toán Chia Tuần Học Kỳ (Week Slicing Algorithm)
Trong `AdminDashboardService.java`:
1. Lấy `startDate` và `endDate` của `Semester`:
   - Nếu `startDate` hoặc `endDate` bị `null`, fallback theo mốc mặc định (10 tuần, mỗi tuần 7 ngày tính từ ngày tạo kỳ).
2. Duyệt vòng lặp từ `week = 1` đến khi vượt quá `endDate` (hoặc tối đa 15 tuần):
   ```java
   LocalDateTime weekStart = semesterStart.plusDays((weekIndex - 1) * 7);
   LocalDateTime weekEnd = weekStart.plusDays(7).minusSeconds(1);
   if (weekEnd.isAfter(semesterEnd)) {
       weekEnd = semesterEnd;
   }
   boolean isCurrent = now.isAfter(weekStart) && now.isBefore(weekEnd);
   ```
3. Truy vấn `COUNT(c.id)` từ `commits` và `COUNT(t.id)` từ `tasks` có `created_at` / `committed_at` nằm trong khoảng `[weekStart, weekEnd]`.
4. Nếu học kỳ được chọn là **Học kỳ đã kết thúc trong quá khứ**: `isCurrentWeek` sẽ là `false` cho tất cả các tuần.
5. Nếu học kỳ là **Học kỳ tương lai (chưa bắt đầu)**: Các tuần trả về số liệu 0.

---

### 3.2 Thuật toán Phân Bổ Sức Khỏe Dự Án (`projectHealthDistribution`)
- **Đúng tiến độ (`ON_TRACK`)**: Nhóm có tỷ lệ Task hoàn thành $\ge 70\%$ trong Sprint hiện tại và có commit liên tục trong 7 ngày gần nhất.
- **Có rủi ro (`AT_RISK`)**: Nhóm có tỷ lệ Task hoàn thành $< 50\%$, hoặc không có commit mới trong 5–7 ngày qua, hoặc xuất hiện cảnh báo MSR Anomaly (Task Done nhưng 0 commit).
- **Chậm trễ (`DELAYED`)**: Nhóm chưa tạo dự án, chưa kết nối Jira/GitHub quá 7 ngày, hoặc không có bất kỳ commit nào được đẩy lên trong suốt Sprint.

---

### 3.3 Thuật toán Tính Tỷ Lệ Tăng Trưởng Sinh Viên (`studentsGrowthPercentage`)
1. Xác định học kỳ liền kề trước đó (`previousSemester`):
   ```sql
   SELECT * FROM semester 
   WHERE start_date < :currentSemesterStart AND deleted_at IS NULL 
   ORDER BY start_date DESC LIMIT 1;
   ```
2. Đếm số sinh viên đăng ký của kỳ hiện tại ($N_{current}$) và kỳ trước ($N_{previous}$):
   $$\text{growthPercentage} = \frac{N_{current} - N_{previous}}{N_{previous}} \times 100$$
3. Nếu $N_{previous} = 0$, gán `growthPercentage = 0.0`.

---

### 3.4 Thuật toán Nhận Diện Nhóm Chưa Kết Nối (`unconnectedTeamsAlert`)
Một nhóm (`Team`) được coi là chưa kết nối nếu:
- Không có `project_id` (Chưa tạo dự án trên SAGA).
- Hoặc đã tạo dự án nhưng thiếu liên kết GitHub (`missingService = "GITHUB"`).
- Hoặc thiếu cấu hình Jira (`missingService = "JIRA"`).
- Hoặc thiếu cả hai (`missingService = "BOTH"`).
- Bổ sung `daysSinceCreated = ChronoUnit.DAYS.between(team.getCreatedAt(), LocalDateTime.now())` để FE highlight nhóm nào bị trễ $> 7$ ngày (viền đỏ khẩn cấp).

---

### 3.5 Chiến Lược Caching Redis Tối Ưu
- **Tên Key**: `admin:dashboard:summary:{semesterId}`
- **TTL**: `600 giây` (10 phút).
- Khi có request kèm `forceRefresh=true`:
  1. `redisTemplate.delete(cacheKey);`
  2. Tính toán lại toàn bộ số liệu.
  3. Ghi đè lại cache mới với TTL 10 phút.

---

## 4. DANH SÁCH FILE CẦN TẠO MỚI TRÊN `saga-be`

```text
saga-be/src/main/java/com/saga/be/
├── controller/
│   └── AdminDashboardController.java          # @GetMapping("/api/admin/dashboard/summary")
├── dto/admin/dashboard/
│   ├── AdminDashboardSummaryResponse.java     # Response DTO tổng thể
│   ├── DashboardSemesterDto.java              # Thông tin kỳ học & tuần hiện tại
│   ├── AvailableSemesterDto.java              # Danh sách kỳ học đổ dropdown
│   ├── DashboardKpisDto.java                  # Các thẻ KPI tổng quan
│   ├── DashboardWeeklyTimelineDto.java        # Chuỗi dữ liệu hoạt động theo tuần
│   ├── ProjectHealthDistributionDto.java      # Phân bổ sức khỏe nhóm (Đúng tiến độ/Rủi ro/Chậm)
│   ├── SprintMilestoneProgressDto.java        # Tiến độ nghiệm thu Sprint 1 -> 4
│   ├── DashboardIntegrationHealthDto.java     # Sức khỏe Jira/GitHub Webhooks
│   ├── DashboardUnconnectedTeamDto.java       # Danh sách nhóm cảnh báo trễ
│   └── DashboardCacheMetaDto.java             # Metadata cache Redis
└── service/admin/
    └── AdminDashboardService.java             # Nghiệp vụ tổng hợp, chia tuần & cache
```

---

## 5. PHẦN AUDIT LOGS (KHÔNG CẦN VIẾT MỚI)
- Frontend sẽ gọi trực tiếp endpoint có sẵn:
  `GET /api/admin/audit-logs?page=0&size=5` từ `com.saga.be.controller.AdminAuditLogController.java`.
- Backend **hoàn toàn không cần** viết thêm API hay gộp audit log vào response của dashboard.
