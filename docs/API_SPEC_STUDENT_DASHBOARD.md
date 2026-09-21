# Đặc Tả Kỹ Thuật API: Dashboard Cá Nhân Cho Sinh Viên (Student Personal Cockpit)

> **Mã tài liệu**: `SAGA-SPEC-FE-BE-DASHBOARD-01`  
> **Người lập**: Frontend Team  
> **Người nhận**: Backend Team  
> **Trạng thái**: Đề xuất tích hợp (Chính thức)  
> **Mục tiêu**: Cung cấp 1 API tổng hợp duy nhất (mô hình BFF) cho trang `/student/dashboard`, giúp tất cả sinh viên (cả Trưởng nhóm lẫn Thành viên thường) đều có không gian làm việc cá nhân rõ ràng, xem được việc cần làm hôm nay, tiến độ của mình và các cảnh báo công việc.

---

## 1. Lý Do Cần API Này (Bối Cảnh & Vấn Đề)

### 🔴 Vấn đề hiện tại
- Endpoint xem tiến độ hiện tại `GET /api/projects/{projectId}/progress` chỉ cho phép *Giảng viên* và *Trưởng nhóm (Leader)* xem.
- *Thành viên thường (Member)* khi vào trang Dashboard thì bị chặn lỗi **403 Forbidden**.
- Hậu quả: Thành viên thường vào trang cá nhân chỉ thấy một ô cảnh báo màu vàng, không biết hôm nay mình cần làm task gì, mình đã commit bao nhiêu lần, có bị cảnh báo làm thiếu hay không.

### 🟢 Giải pháp đề xuất
Backend xây dựng *1 endpoint duy nhất* dành riêng cho Sinh viên theo môn học đang mở:
```http
GET /api/student/courses/{courseId}/dashboard
```
- Sinh viên đang học môn nào thì chỉ cần truyền `courseId` của môn đó.
- Backend tự động đọc thông tin từ **Session đăng nhập (Cookie Redis `SAGA_SESSION`)** để biết sinh viên này là ai, thuộc nhóm nào, dự án nào.
- An toàn tuyệt đối: Sinh viên không thể sửa ID trên đường dẫn để xem trộm thông tin của người khác.

---

## 2. Nguyên Tắc Thiết Kế: Dùng 100% Dữ Liệu Đang Có Sẵn

API này *không cần tạo thêm bất kỳ bảng mới nào* trong cơ sở dữ liệu. Tất cả thông tin đều lấy từ các bảng và projection sẵn có của hệ thống SAGA:

| Dữ liệu cần lấy | Nguồn dữ liệu Backend đã có | Cách lấy |
| :--- | :--- | :--- |
| **Môn học & Nhóm** | Bảng `courses`, `teams`, `team_members` | Lấy tên môn, mã lớp, tên nhóm, vai trò của sinh viên (`LEADER` hoặc `MEMBER`). |
| **Trạng thái tích hợp** | Bảng `projects`, `integrations` | Xem nhóm đã kết nối Jira và GitHub chưa (`ACTIVE` / `REVOKED`), lần đồng bộ gần nhất. |
| **Sprint hiện tại** | Dữ liệu đồng bộ Jira (`sprints`) | Tên Sprint đang chạy, ngày bắt đầu, ngày kết thúc, số ngày còn lại. |
| **Việc của tôi (Tasks)** | Dữ liệu đồng bộ Jira (`project_tasks`) | Lọc task có người làm (`assignee`) là sinh viên này. |
| **Commit của tôi** | Dữ liệu đồng bộ GitHub (`git_commits`) | Lọc commit có người tạo (`author`) là sinh viên này, đếm số commit có gắn mã task `[SAGA-xx]`. |
| **Cổ phần đóng góp** | Dữ liệu tính toán Slicing Pie | Lấy số cổ phần (`Slices`) và tỷ lệ % đóng góp của sinh viên trong nhóm. |
| **Cảnh báo công việc** | Logic đối soát dữ liệu & Đồ thị Neo4j | Tự động phát hiện task `DONE` nhưng thiếu commit, nhắc nộp đánh giá chéo đồng đẳng. |

---

## 3. Chi Tiết Endpoint & Dữ Liệu Trả Về (Response JSON)

### 📌 Thông tin gọi API
- **URL**: `GET /api/student/courses/{courseId}/dashboard`
- **Phương thức**: `GET`
- **Xác thực**: Cookie phiên làm việc Redis (`SAGA_SESSION`, gửi kèm `withCredentials: true`)
- **Quyền truy cập**: Mọi sinh viên đang học trong lớp học phần `{courseId}` (cả Leader lẫn Member).

---

### 📦 Cấu trúc dữ liệu mẫu (HTTP 200 OK)

```json
{
  "student": {
    "studentId": "std_uuid_01",
    "userId": "usr_uuid_01",
    "studentCode": "HE170504",
    "fullName": "Lê Hồng Phúc",
    "avatarUrl": "https://lh3.googleusercontent.com/a/...",
    "teamRole": "MEMBER"
  },
  "course": {
    "courseId": "crs_uuid_fa26_swp391",
    "courseCode": "SWP391_FA26_SE1705",
    "subjectCode": "SWP391",
    "subjectName": "Software Development Project",
    "semesterCode": "FA26"
  },
  "team": {
    "teamId": "team_uuid_01",
    "teamNo": 1,
    "teamName": "Nhóm 1 - Nền tảng SAGA",
    "projectId": "proj_uuid_01",
    "projectName": "SAGA Agile Governance Platform",
    "membersCount": 5
  },
  "integrations": {
    "jira": {
      "connected": true,
      "projectKey": "SAGA",
      "status": "ACTIVE",
      "lastSyncedAt": "2026-09-19T10:30:00+07:00"
    },
    "github": {
      "connected": true,
      "repositoryCount": 2,
      "status": "ACTIVE",
      "lastSyncedAt": "2026-09-19T11:15:00+07:00"
    }
  },
  "currentSprint": {
    "id": "sprint_uuid_03",
    "externalSprintId": "10024",
    "name": "Sprint 3: Core Business & Matrix",
    "state": "ACTIVE",
    "startDate": "2026-09-10T08:00:00+07:00",
    "endDate": "2026-09-24T23:59:59+07:00",
    "daysRemaining": 5,
    "totalTasks": 24,
    "completedTasks": 15,
    "completionPercent": 62.5
  },
  "myMetrics": {
    "tasks": {
      "totalAssigned": 7,
      "todo": 1,
      "inProgress": 2,
      "inReview": 1,
      "done": 3,
      "blocked": 0,
      "completionPercent": 42.8,
      "totalStoryPoints": 18,
      "completedStoryPoints": 8
    },
    "commits": {
      "totalCommits": 34,
      "linkedCommits": 31,
      "unlinkedCommits": 3,
      "traceabilityPercent": 91.2,
      "lastCommittedAt": "2026-09-19T09:42:15+07:00"
    },
    "contribution": {
      "mySlices": 1250,
      "teamTotalSlices": 5000,
      "contributionPercent": 25.0,
      "peerReviewAverageScore": 4.5
    },
    "weeklyCommits": [
      { "weekLabel": "Tuần 1", "commits": 8 },
      { "weekLabel": "Tuần 2", "commits": 14 },
      { "weekLabel": "Tuần 3", "commits": 12 }
    ]
  },
  "myActiveTasks": [
    {
      "id": "task_uuid_101",
      "externalKey": "SAGA-45",
      "title": "Thiết kế component DateRangePicker theo GMT+7",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "storyPoints": 3,
      "dueDate": "2026-09-21T23:59:59+07:00",
      "linkedCommitCount": 2,
      "hasAnomaly": false
    },
    {
      "id": "task_uuid_102",
      "externalKey": "SAGA-48",
      "title": "Viết Unit Test cho Service AuditLog",
      "status": "TODO",
      "priority": "MEDIUM",
      "storyPoints": 2,
      "dueDate": "2026-09-22T23:59:59+07:00",
      "linkedCommitCount": 0,
      "hasAnomaly": false
    },
    {
      "id": "task_uuid_103",
      "externalKey": "SAGA-39",
      "title": "Tích hợp Modal Chi tiết Commit từ GitHub API",
      "status": "DONE",
      "priority": "HIGH",
      "storyPoints": 5,
      "dueDate": "2026-09-18T18:00:00+07:00",
      "linkedCommitCount": 0,
      "hasAnomaly": true
    }
  ],
  "recentCommits": [
    {
      "sha": "d46f6002",
      "shortSha": "d46f600",
      "message": "feat: [FE][SAGA-45] Tich hop custom popover cho DatePicker",
      "repositoryName": "saga-fe",
      "committedAt": "2026-09-19T09:42:15+07:00",
      "linkedTaskKey": "SAGA-45"
    },
    {
      "sha": "91ab721e",
      "shortSha": "91ab721",
      "message": "fix: [FE][SAGA-45] Chuan hoa gio theo mui gio GMT+7 Asia/Ho_Chi_Minh",
      "repositoryName": "saga-fe",
      "committedAt": "2026-09-18T17:20:00+07:00",
      "linkedTaskKey": "SAGA-45"
    }
  ],
  "actionableAlerts": [
    {
      "id": "alert_msr_01",
      "type": "MSR_ANOMALY",
      "severity": "WARNING",
      "title": "Nhiệm vụ DONE nhưng chưa có commit minh chứng",
      "message": "Nhiệm vụ SAGA-39 đã đánh dấu Hoàn thành (DONE) nhưng chưa có commit nào liên kết trên GitHub. Vui lòng kiểm tra lại commit message.",
      "actionUrl": "/student/commits",
      "actionLabel": "Đối soát commit"
    },
    {
      "id": "alert_peer_review_01",
      "type": "PEER_REVIEW_PENDING",
      "severity": "INFO",
      "title": "Đánh giá chéo Sprint 2 đang mở",
      "message": "Đợt đánh giá chéo Sprint 2 sẽ kết thúc trong 2 ngày nữa. Bạn còn 4 thành viên chưa hoàn thành chấm điểm.",
      "actionUrl": "/student/assessment",
      "actionLabel": "Chấm điểm chéo"
    },
    {
      "id": "alert_ghosting_01",
      "type": "GHOSTING_WARNING",
      "severity": "CRITICAL",
      "title": "Cảnh báo thiếu hoạt động đóng góp",
      "message": "Hệ thống ghi nhận bạn chưa có commit nào trong 5 ngày qua. Hãy cập nhật tiến độ để tránh bị hệ số đóng góp thấp.",
      "actionUrl": "/student/sprint-progress",
      "actionLabel": "Xem bảng việc"
    }
  ]
}
```

---

## 4. Giao Diện Người Dùng Sẽ Hiển Thị Như Thế Nào?

```text
+---------------------------------------------------------------------------------------+
|  CHÀO MỪNG: Lê Hồng Phúc (HE170504) — Thành viên Nhóm 1 (SAGA Platform)              |
|  Sprint 3: Core Business & Matrix [Đang diễn ra — Còn 5 ngày]                         |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [THẺ 1: VIỆC CỦA TÔI]      [THẺ 2: COMMIT MINH CHỨNG]   [THẺ 3: CỔ PHẦN SLICING PIE] |
|  3 / 7 Hoàn thành (42.8%)   34 Commits (91.2% hợp lệ)    25.0% Cổ phần (1,250 Slices) |
|  8 / 18 Story Points        Lần cuối: 09:42 hôm nay      Đánh giá chéo: 4.5 / 5.0     |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [CÁC CẢNH BÁO CẦN XỬ LÝ NGAY (Actionable Alerts)]                                    |
|  ⚠️ [Thiếu commit] Task SAGA-39 Done nhưng 0 commit -> [Bấm để đối soát commit]       |
|  ℹ️ [Nhắc nhở] Đánh giá đồng đẳng Sprint 2 còn 2 ngày -> [Bấm để chấm điểm ngay]       |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|                                                           |                           |
|  [DANH SÁCH VIỆC CỦA TÔI (My Active Tasks)]               |  [BIỂU ĐỒ HOẠT ĐỘNG TUẦN] |
|  - SAGA-45: Thiết kế component DatePicker (Đang làm)      |  Số commit 3 tuần qua     |
|  - SAGA-48: Viết Unit Test cho Service (Cần làm)          |                           |
|  - SAGA-39: Modal Chi tiết Commit (Xong - Cần kiểm tra)   |  [Commit gần đây nhất]    |
|                                                           |  - d46f600: SAGA-45...    |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [TIẾN ĐỘ CHUNG CỦA CẢ NHÓM (Team Progress)]                                          |
|  Nhóm 1 đã xong 15 / 24 nhiệm vụ Sprint 3 (62.5%) — Jira: [Đã kết nối]                |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

---

## 5. Quy Tắc Nghiệp Vụ Cho Backend (Rất Dễ Cài Đặt)

### 1. Phân quyền và nhận diện sinh viên
- Đọc `userId` từ Redis Session.
- Kiểm tra xem sinh viên có trong lớp `courseId` hay không:
  - Nếu không có tên trong lớp: Trả về lỗi `403 Forbidden` (`COURSE_ACCESS_DENIED`).
  - Nếu đã vào lớp nhưng chưa được Giảng viên chia nhóm: Trả về `200 OK` với `"team": null` (Frontend sẽ hiện thông báo "Bạn đang chờ Giảng viên phân nhóm").
  - Nếu đã có nhóm nhưng nhóm chưa tạo dự án: Trả về `200 OK` với `"projectId": null` (Frontend hiện nút nhắc tạo dự án).

### 2. Tự động tính toán các chỉ số cá nhân (`myMetrics`)
- **Nhiệm vụ (Tasks)**:
  - Lấy tất cả task trong bảng `project_tasks` của dự án mà người được gán (`assigneeStudentId`) chính là sinh viên này.
  - Gom nhóm đếm số lượng theo trạng thái (`TODO`, `IN_PROGRESS`, `DONE`...).
  - Tính `% hoàn thành = (số task done / tổng số task) * 100`. Nếu chưa được giao task nào thì trả về `0`.
- **Commit**:
  - Đếm số commit của sinh viên trong bảng `git_commits`.
  - Tính `% minh chứng = (số commit có gắn mã task / tổng commit) * 100`. Nếu chưa có commit nào thì trả về `0`.
- **Cổ phần Slicing Pie**:
  - Đọc từ bảng tính điểm/cổ phần đã có của nhóm. Nếu chưa tính thì trả về `null`.

### 3. Tự động tạo 3 cảnh báo thông minh (`actionableAlerts`)
Backend chỉ cần chạy 3 câu kiểm tra rất nhẹ:
1. **Cảnh báo MSR Anomaly (Khai khống)**:
   - Có task nào của sinh viên này mang trạng thái `DONE` mà `linkedCommitCount == 0` không?
   - Nếu có: Thêm cảnh báo loại `MSR_ANOMALY` để sinh viên bổ sung mã task vào commit.
2. **Cảnh báo Peer Review (Đánh giá chéo)**:
   - Trong đợt đánh giá chéo đang mở, sinh viên này đã chấm hết cho các bạn trong nhóm chưa?
   - Nếu còn thiếu: Thêm cảnh báo loại `PEER_REVIEW_PENDING`.
3. **Cảnh báo Ghosting (Bỏ bê công việc)**:
   - Trong 5 ngày gần nhất sinh viên có commit hoặc cập nhật task nào không?
   - Nếu không có hoạt động nào: Thêm cảnh báo loại `GHOSTING_WARNING`.

---

## 6. Bảng Mã Trả Về (HTTP Status Codes)

| Mã HTTP | Tình huống | Trạng thái dữ liệu | Giao diện Frontend hiển thị |
| :--- | :--- | :--- | :--- |
| **`200 OK`** | Thành công bình thường | Dữ liệu đầy đủ | Hiển thị trọn vẹn Dashboard cá nhân. |
| **`200 OK`** | Đã vào lớp nhưng chưa có nhóm | `"team": null` | Hiện khung thông báo "Đang chờ Giảng viên xếp nhóm". |
| **`200 OK`** | Có nhóm nhưng chưa tạo dự án | `"projectId": null` | Hiện nút "Khởi tạo kết nối Jira/GitHub". |
| **`200 OK`** | Nhóm chưa bắt đầu Sprint | `"currentSprint": null` | Hiện thông báo "Chưa có Sprint nào đang chạy". |
| **`400 Bad Request`** | Sai mã `courseId` | `INVALID_COURSE_ID` | Báo lỗi và gợi ý chọn lại môn học. |
| **`401 Unauthorized`** | Hết hạn đăng nhập | `SESSION_EXPIRED` | Tự động chuyển về trang Đăng nhập. |
| **`403 Forbidden`** | Sinh viên không học lớp này | `FORBIDDEN` | Chuyển về trang chọn môn học `/student/courses`. |
| **`500 Internal Error`** | Lỗi máy chủ hoặc mất mạng | `SERVER_ERROR` | Hiện nút bấm "Thử lại". |

---

## 7. Lợi Ích Lớn Cho Cả Dự Án SAGA

1. **Tốc độ tải trang siêu nhanh (0ms độ trễ)**: 
   - Chỉ mất 1 lần gọi mạng là có đầy đủ dữ liệu hiển thị toàn bộ trang, không bị giật lag hay xoay vòng tròn chờ đợi.
2. **Công bằng & Minh bạch cho mọi sinh viên**: 
   - Xóa bỏ hoàn toàn lỗi `403 Forbidden` cho thành viên thường. Ai vào hệ thống cũng thấy rõ phần việc của mình.
3. **Điểm cộng lớn khi Bảo vệ Đồ án Tốt nghiệp (Capstone Defense)**: 
   - Thể hiện rõ tính năng phát hiện bất thường thực tế (XAI) và mô hình cổ phần Slicing Pie, chứng minh hệ thống giải quyết triệt để vấn nạn "ngồi không hưởng điểm" (Free-rider) trong làm việc nhóm.
