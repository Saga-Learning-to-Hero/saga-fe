---
description: End-to-end user journeys, main business flows for Student, Lecturer, Admin, and Capstone Defense Presentation script.
---

# Quy Trình Nghiệp Vụ Cốt Lõi & Luồng Người Dùng (Mainflow & Business Logic)

## 1. Hành Trình Người Dùng Sinh Viên (Student User Journey)

```text
[Đăng Nhập] 
    │
    ▼
[/student/courses] ── (Chọn Khóa học / Học phần kỳ hiện tại)
    │
    ▼
[/student/dashboard] ── (Tổng quan KPI, Story Points, Cổ phần Slicing Pie)
    │
    ├──► [/student/project-info] ───── (Thông tin dự án, Workspace Jira/GitHub)
    ├──► [/student/sprint-progress] ── (Bảng Jira Kanban, Sprint Backlog)
    ├──► [/student/commits] ────────── (Lịch sử Commit theo Repo & Branch)
    ├──► [/student/graph] ──────────── (Đồ thị Traceability chứng minh công sức)
    ├──► [/student/peer-assessment] ── (Đánh giá chéo đồng đẳng ẩn danh)
    └──► [/student/contribution] ───── (Tỷ lệ phân bổ cổ phần động Slicing Pie)
```

### 🎯 Điểm Nhấn Sinh Viên:
- **Đồ thị Truy xuất Nguồn gốc ([/student/graph](file:///d:/Github/saga%20workspace/saga-fe/src/app/(dashboard)/student/graph/page.tsx))**: Sinh viên sử dụng để bảo vệ đồ án trước Hội đồng. Khi rê chuột vào tên mình, toàn bộ chuỗi chứng minh công sức `(:Student) ➔ (:JiraTask) ➔ (:Commit)` sẽ sáng bừng, các đỉnh khác mờ đi (**Neighborhood Dimming**).

---

## 2. Hành Trình Người Dùng Giảng Viên (Lecturer User Journey)

```text
[Đăng Nhập]
    │
    ▼
[/lecturer/courses] ── (Chọn Lớp giảng dạy kỳ hiện tại)
    │
    ▼
[/lecturer/courses/[id]/dashboard] ── (Tổng quan lớp, Sức khỏe nhóm, Cảnh báo)
    │
    ├──► [/lecturer/courses/[id]/teams] ────────── (Hoạt động từng nhóm, Kanban)
    ├──► [/lecturer/courses/[id]/graph] ────────── (Giám sát Đa nhóm, MSR & SNA)
    ├──► [/lecturer/courses/[id]/settings/weights] (Cấu hình trọng số Code/Test/Doc)
    └──► [/lecturer/courses/[id]/grades] ───────── (Bảng điểm tổng kết Master Gradebook)
```

### 🎯 Điểm Nhấn Giảng Viên:
- **Trung Tâm Giám Sát Đa Nhóm & SNA Matrix ([/lecturer/courses/[id]/graph](file:///d:/Github/saga%20workspace/saga-fe/src/app/(dashboard)/lecturer/courses/%5BcourseId%5D/graph/page.tsx))**:
  - Chuyển đổi nhanh giữa tất cả các nhóm trong lớp qua thanh Quick Switcher Pills.
  - **Phát hiện MSR Anomaly**: Gắn cờ cảnh báo các Task báo `DONE` nhưng 0 commits linked (nghi vấn báo cáo khống).
  - **Phát hiện Ghosting Anomaly**: Dựa trên thuật toán *Degree Centrality* để phát hiện thành viên mất tương tác, cô lập hoặc bỏ nhóm.
  - **Cơ chế Can thiệp (Human-in-the-loop)**: Giảng viên có quyền ghi đè điểm số cuối cùng dựa trên bằng chứng đồ thị.

---

## 3. Hành Trình Quản Trị Viên (Admin User Journey)

```text
[Đăng Nhập] ➔ [/admin/dashboard]
    │
    ├──► [/admin/users] ──── (Quản lý tài khoản, phân quyền Giảng viên/Sinh viên)
    ├──► [/admin/projects] ─ (Quản trị toàn bộ đề tài đồ án capstone)
    ├──► [/admin/academic] ─ (Quản lý cấu trúc học thuật, học kỳ, môn học)
    └──► [/admin/audit-log] ─ (Nhật ký kiểm toán hệ thống từ MongoDB)
```

---

## 4. Kịch Bản Trình Bày Demo Hội Đồng (10 - 15 Phút)

### ⏱️ Phân Bổ Thời Gian:
1. **Phút 1 - 2 (The Hook - Đặt vấn đề)**: Nêu nỗi đau Free-rider, Báo cáo khống trên Jira và Thiếu minh chứng kỹ thuật thực tế trong đồ án tốt nghiệp. Giới thiệu giải pháp **SAGA** với triết lý **Minh bạch dựa trên Dữ liệu (Data-Driven Transparency)**.
2. **Phút 3 - 6 (Demo Sinh viên)**: Đăng nhập Sinh viên ➔ Vào môn học ➔ Mở `/student/graph` ➔ Rê chuột làm sáng chuỗi liên kết `(:Student) ➔ (:JiraTask) ➔ (:Commit)` để chứng minh 100% công sức.
3. **Phút 7 - 11 (Demo Giảng viên - Bắt lỗi XAI & SNA)**:
   - Chuyển sang Giảng viên ➔ Mở `/lecturer/courses/[id]/graph`.
   - Bắt lỗi **MSR Anomaly** trên Task `SAGA-24` (Task Done nhưng 0 commit).
   - Bật tab **SNA Matrix** ➔ Chỉ ra **Ghosting Anomaly** (sinh viên bị cô lập) vs **Key Contributor** (thành viên gánh team).
4. **Phút 12 - 13 (Hạ tầng kỹ thuật Polyglot Persistence)**: Trình bày kiến trúc PostgreSQL + Neo4j AuraDB + MongoDB Audit Logs + Redis Cache.
5. **Phút 14 - 15 (Hỏi đáp Q&A)**: Trả lời câu hỏi trọng tâm của Hội đồng.
