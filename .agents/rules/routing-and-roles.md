---
trigger: always_on
description: Role-based routing, authentication guards, sidebar navigation sync, and layout shell rules for SAGA Frontend.
---

# Quy Chuẩn Định Tuyến & Phân Quyền Vai Trò (Routing & Role-Based Access)

## 1. Bản Đồ Tuyến Đường Theo Vai Trò (Role Route Mapping)

Hệ thống SAGA phân chia 3 vai trò độc lập với các tuyến đường (`namespaces`) riêng biệt:

### 👑 Quản Trị Viên (Admin - `/admin/*`)
- `/admin/dashboard`: Tổng quan hệ thống, tài nguyên và trạng thái tích hợp Webhook Jira/GitHub.
- `/admin/users`: Quản lý tài khoản người dùng và phân quyền.
- `/admin/projects`: Quản trị toàn bộ dự án đồ án trong trường.
- `/admin/academic`: Quản lý chương trình đào tạo, học kỳ và môn học.
- `/admin/audit-log`: Nhật ký kiểm toán hệ thống từ MongoDB.

### 👨‍🏫 Giảng Viên (Lecturer - `/lecturer/*`)
- `/lecturer/courses`: Không gian chọn lớp giảng dạy (No-Sidebar Shell, hiển thị danh sách lớp kỳ hiện tại).
- `/lecturer/courses/[courseId]/dashboard`: Dashboard chi tiết lớp học phần và sức khỏe các nhóm.
- `/lecturer/graph`: Trung tâm giám sát đa nhóm & Đồ thị phân tích mạng lưới SNA (Ghosting vs Key Contributor).
- `/lecturer/assessment`: Bảng chấm điểm tổng kết và Master Gradebook.
- `/lecturer/contribution`: Bảng phân tích tỷ lệ đóng góp Slicing Pie toàn lớp.

### 🎓 Sinh Viên (Student - `/student/*`)
- `/student/courses`: Không gian chọn môn học / lớp học phần đang tham gia trong kỳ.
- `/student/dashboard`: Dashboard cá nhân, chỉ số KPI, số cổ phần (Slices) và đóng góp.
- `/student/project-info`: Thông tin dự án nhóm, liên kết Jira workspace & GitHub repo.
- `/student/sprint-progress`: Bảng tiến độ Jira Kanban & Sprint Backlog.
- `/student/commits`: Nhật ký commit mã nguồn GitHub theo repo và branch.
- `/student/graph`: Đồ thị truy xuất nguồn gốc Traceability Graph chứng minh công sức.
- `/student/assessment`: Đánh giá chéo đồng đẳng (Peer Review).
- `/student/contribution`: Mức đóng góp cổ phần Slicing Pie cá nhân.

---

## 2. Quy Tắc Chuyển Hướng Sau Đăng Nhập (`getRoleHomePath`)
Toàn bộ logic chuyển hướng sau khi đăng nhập thành công phải gọi tập trung qua hàm `getRoleHomePath` trong file `src/features/auth/lib/role-routes.ts`:

```typescript
export function getRoleHomePath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'LECTURER':
      return '/lecturer/courses';
    case 'STUDENT':
      return '/student/courses';
  }
}
```

- **Luồng Sinh viên**: Đăng nhập ➔ Chuyển hướng đến `/student/courses` (chọn môn học) ➔ Bấm vào môn học sẽ lưu `selectedCourse` vào Zustand và chuyển tiếp đến `/student/dashboard`.
- **Luồng Giảng viên**: Đăng nhập ➔ Chuyển hướng đến `/lecturer/courses` (chọn lớp giảng dạy) ➔ Bấm vào lớp sẽ chuyển tiếp vào `/lecturer/courses/[courseId]/dashboard`.

---

## 3. Quy Tắc Phân Bổ Layout Shell (Admin Sidebar vs Lecturer/Student Top Header)
Trong `src/app/(dashboard)/layout.tsx`:
- **👑 Quản trị viên (Admin)**: Sử dụng **Sidebar dọc bên trái** (`Sidebar` component) hỗ trợ thu gọn/mở rộng, phù hợp với các tác vụ quản trị hệ thống, dữ liệu học thuật, dự án và nhật ký kiểm toán.
- **👨‍🏫 Giảng viên (Lecturer) & 🎓 Sinh viên (Student)**: Chuyển đổi hoàn toàn sang **Top Header Navigation 2 tầng** (`TopNavHeader` component), **HOÀN TOÀN KHÔNG DÙNG SIDEBAR**.
  - Giải phóng 100% không gian hiển thị (Full-width canvas) cho các bảng dữ liệu lớn, bảng tiến độ Kanban Jira, đồ thị tương tác Cytoscape.js (Traceability & SNA), nhật ký Git Commit và bảng điểm/đóng góp Slicing Pie.
  - **Tầng 1 (Primary Header - 56px)**: Logo SAGA, Course Context Pill kèm bộ chọn nhanh khóa học (Quick Course Switcher), Badge học kỳ, Theme toggle Sáng/Tối, Chuông thông báo, User Profile Dropdown (đổi vai trò demo, mở hồ sơ cá nhân, đăng xuất).
  - **Tầng 2 (Subnav Tabs - 46px)**: Thanh Tabs điều hướng ngang dạng pill/card mượt mà theo từng môn/lớp học.
  - **Mobile Drawer**: Tích hợp Mobile Sheet drawer khi duyệt trên thiết bị di động.

---

## 4. Bảo Vệ Định Tuyến (Route Guards & Role Protection)
Trong `DashboardLayout`, hệ thống tự động kiểm tra `user.role` với tiền tố `pathname`:
- Sinh viên truy cập tuyến `/admin/*` hoặc `/lecturer/*` ➔ Tự động `router.replace(getRoleHomePath("STUDENT"))`.
- Giảng viên truy cập tuyến `/admin/*` hoặc `/student/*` ➔ Tự động `router.replace(getRoleHomePath("LECTURER"))`.
- Quản trị viên truy cập tuyến `/lecturer/*` hoặc `/student/*` ➔ Tự động `router.replace(getRoleHomePath("ADMIN"))`.

---

## 5. Đồng Bộ Sidebar Navigation ([nav-config.ts](file:///d:/Github/saga%20workspace/saga-fe/src/components/layout/sidebar/nav-config.ts))
Tất cả các liên kết trong `NAV_GROUPS` **BẮT BUỘC** phải có tiền tố namespace vai trò tương ứng (`/student/...`, `/lecturer/...`, `/admin/...`). **Tuyệt đối không dùng đường dẫn gốc không định danh** (như `/commits`, `/project-info`, `/sprint-progress`, `/courses`).
