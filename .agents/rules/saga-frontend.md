---
trigger: always_on
description: Master frontend architecture, tech stack guidelines, and core engineering standards for SAGA Capstone.
---

# SAGA Frontend — Quy Chuẩn Kiến Trúc & Phát Triển Giao Diện (Master Rule)

## 1. Triết Lý & Ngôn Ngữ (Language & Philosophy)
- **100% Tiếng Việt trên giao diện**: Toàn bộ UI, văn bản, tiêu đề, nhãn (label), placeholder, tooltip, thông báo trạng thái, toast alert và modal đều phải dùng **tiếng Việt chuẩn mực, rõ ràng, giàu tính học thuật**.
- **Code & Comment**: Tên biến, interface, type, hàm, component và tên file viết bằng **tiếng Anh** chuẩn `camelCase` / `PascalCase`. Comment giải thích logic bằng **tiếng Việt**.
- **Tính Minh Bạch Dựa Trên Dữ Liệu (Data-Driven Transparency)**: Mọi biểu đồ, bảng đối soát, ma trận đóng góp đều phải hiển thị minh chứng thực tế (Empirical Evidence) từ Jira và GitHub.

---

## 2. Ngăn Xếp Công Nghệ (Tech Stack)
- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand (kết hợp `persist` middleware lưu session an toàn)
- **Data Fetching & Caching**: TanStack React Query v5 + Axios
- **Graph Visualization**: Cytoscape.js (`^3.34.1`)
- **Charts & Metrics**: Recharts (`^3.10.1`)
- **Iconography**: `lucide-react`
- **Typography**: 
  - **Plus Jakarta Sans**: Font giao diện chính, tiêu đề, bảng biểu (`var(--font-sans)`).
  - **JetBrains Mono**: Font mã nguồn, commit hash, story points, mã số sinh viên, công thức toán học (`var(--font-mono)`).

---

## 3. Cấu Trúc Thư Mục Chuẩn (Role-Based Directory Structure)

```text
src/
├── app/
│   ├── (auth)/                    # Tuyến không kèm Sidebar/App Shell (Login)
│   │   └── login/                 # Trang Đăng nhập phân quyền 3 Role
│   ├── (dashboard)/               # Tuyến có App Shell Layout bảo vệ
│   │   ├── admin/                 # Không gian Quản trị viên (/admin/*)
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── academic/
│   │   │   ├── subjects/
│   │   │   └── audit-log/
│   │   ├── lecturer/              # Không gian Giảng viên (/lecturer/*)
│   │   │   ├── courses/           # Chọn lớp giảng dạy (No Sidebar Shell)
│   │   │   │   └── [courseId]/    # Dashboard chi tiết lớp học
│   │   │   ├── graph/             # Trung tâm Giám sát Đa nhóm & Đồ thị SNA
│   │   │   ├── assessment/        # Đánh giá & Master Gradebook
│   │   │   └── contribution/      # Ma trận đóng góp Slicing Pie
│   │   ├── student/               # Không gian Sinh viên (/student/*)
│   │   │   ├── courses/           # Chọn môn học kỳ này (No Sidebar Shell)
│   │   │   ├── dashboard/         # Dashboard chỉ số KPI & Cổ phần cá nhân
│   │   │   ├── project-info/      # Thông tin dự án nhóm & Workspace
│   │   │   ├── sprint-progress/   # Tiến độ Jira Kanban & Sprint Backlog
│   │   │   ├── commits/           # Nhật ký mã nguồn Git theo repo/branch
│   │   │   ├── graph/             # Đồ thị Truy xuất Nguồn gốc Traceability
│   │   │   ├── assessment/        # Đánh giá đồng đẳng (Peer Review)
│   │   │   └── contribution/      # Tỷ lệ đóng góp Slicing Pie
│   │   ├── profile/               # Trang quản lý hồ sơ tài khoản
│   │   ├── dashboard/             # Role Redirect Router tự động
│   │   └── layout.tsx             # Dashboard Shell Layout (Sidebar, No-sidebar rules, Role Protection)
│   ├── (marketing)/               # Tuyến Landing Page
│   │   └── page.tsx               # Landing Page giới thiệu giải pháp SAGA
│   └── layout.tsx                 # Root Layout nạp Google Fonts & Providers
├── components/
│   ├── common/                    # Component dùng chung toàn app (SagaLogo, CustomSelect, ThemeToggle...)
│   ├── layout/                    # Layout components (Sidebar, Header, NavConfig)
│   └── ui/                        # shadcn/ui components nguyên bản
├── features/                      # Business logic phân rã theo Domain & Role
│   ├── admin/                     # Modules nghiệp vụ Quản trị viên
│   ├── lecturer/                  # Modules nghiệp vụ Giảng viên
│   ├── student/                   # Modules nghiệp vụ Sinh viên
│   ├── auth/                      # Xác thực, Role routes, Auth Store
│   ├── graph/                     # Cytoscape Graph Engine, Traceability, SNA
│   └── profile/                   # Quản lý hồ sơ & liên kết Jira/GitHub
├── lib/                           # Utility functions, helpers, formatters
├── providers/                     # React Context Providers (QueryClient, Tooltip)
├── store/                         # Zustand Global Stores
└── types/                         # TypeScript interfaces & enums dùng chung
```

> **Nguyên tắc phân biệt `components/` và `features/`:**
> - `components/` chứa UI thuần, không phụ thuộc vào nghiệp vụ cụ thể, có tính tái sử dụng cao.
> - `features/` chứa toàn bộ UI + State + Mock Data + Types chuyên biệt theo từng Domain chức năng.

---

## 4. Quy Trình Kiểm Thử Bắt Buộc (Verification Pipeline)
Trước khi commit bất kỳ thay đổi nào, **BẮT BUỘC** phải chạy kiểm tra và đảm bảo không có lỗi:

```bash
npm run lint    # Kiểm tra ESLint & TypeScript lints — BẮT BUỘC 0 ERROR, 0 WARNING
npm run test    # Chạy toàn bộ Unit Tests — BẮT BUỘC PASS 100% (97/97 tests pass)
npm run build   # Build production tối ưu hóa tĩnh — BẮT BUỘC PASS 100% (29/29 trang)
```

---

## 5. Quy Chuẩn Thuật Ngữ Học Thuật Chuyên Ngành SE & Hệ Thống FPT (Academic & SE Standards)

Để đảm bảo tính nhất quán, chuyên nghiệp và chuẩn mực khi trình bày trước Hội đồng Đồ án Tốt nghiệp (Capstone Defense), toàn bộ giao diện và mã nguồn phân hệ Admin/Học thuật phải tuân thủ nghiêm ngặt các thuật ngữ sau:

### 📚 A. Khung Chương Trình & Đề Cương Chi Tiết (FLM Curriculum & Syllabus)
1. **Môn học (`Subject`)**:
   - Đại diện cho mã môn học chính thức theo chương trình đào tạo của trường (ví dụ: `SWP391`, `SWR302`, `SWP490`).
   - Phân biệt rõ `nameEnglish` (Tên tiếng Anh chuẩn) và `nameVietnamese` (Tên tiếng Việt).
2. **Đề cương chi tiết (`Syllabus` / `Syllabi`)**:
   - Một Môn học có thể có nhiều **Phiên bản Đề cương** (`Syllabus Versions`) theo từng năm học hoặc lần cập nhật giáo trình (ví dụ: `v1.0`, `v2.0`, `2026-v1`).
   - **Trạng thái phiên bản đề cương**:
     - `DRAFT`: **Bản nháp biên soạn** (cho phép thêm/sửa/xóa CLOs, Units, Phases).
     - `PUBLISHED`: **Bản chuẩn áp dụng** (đã ban hành chính thức, cấu trúc bị KHÓA BẤT BIẾN - *Immutable* để bảo toàn tính toàn vẹn dữ liệu đánh giá).
     - `ARCHIVED`: **Đã lưu trữ** (phiên bản cũ đã ngưng áp dụng).
3. **Cấu trúc 3 trụ cột của Đề cương chi tiết Đồ án Kỹ thuật phần mềm**:
   - **CLOs (`Course Learning Outcomes`)**: Chuẩn đầu ra môn học — Định nghĩa các năng lực, kỹ năng chuyên ngành sinh viên cần đạt được sau khi hoàn thành môn học.
   - **Learning Units**: Nội dung đào tạo & Bài học — Phân rã kiến thức lý thuyết/thực hành theo từng tuần học.
   - **Phases & Deliverables**: Các mốc Sprint đồ án & Sản phẩm bàn giao — Thiết lập các đợt nghiệm thu Sprint (Inception/SRS, Architecture/Design, MVP/Coding, Final Defense), sản phẩm bàn giao thực tế (Tài liệu SRS, Mockup, Repo GitHub, Jira Board) và % trọng số đánh giá đóng góp.

### 🏫 B. Phân Định Rõ 2 Loại Lớp Học Trong Hệ Thống FPT
Tuyệt đối không sử dụng cụm từ "lớp hành chính" gây mơ hồ. Hệ thống phân định rõ ràng:
1. **Lớp học phần mở trong kỳ (`Course Section` / `Course`)**:
   - Là một phiên bản lớp cụ thể được mở trong 1 Học kỳ nhất định (ví dụ: `SWP391_FA26_SE1705`).
   - Chứa thông tin: Môn học (`Subject`), Học kỳ (`Semester`), Giảng viên phụ trách (`Lecturer`), Phiên bản đề cương áp dụng (`Syllabus Version`), và Danh sách sinh viên đăng ký môn học (`Student Roster`).
2. **Lớp sinh viên niên khóa (`Cohort Class` / `Academic Class`)**:
   - Đại diện cho lớp sinh viên sinh hoạt theo niên khóa/chuyên ngành tuyển sinh (ví dụ: `SE1705`, `SE1801`, `IA1701`).
   - Dùng để tổ chức nhóm sinh viên cùng niên khóa và theo dõi tiến trình học tập tổng thể của khóa đào tạo.
