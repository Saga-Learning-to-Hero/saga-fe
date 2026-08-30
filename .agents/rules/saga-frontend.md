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
│   │   │   ├── projects/
│   │   │   ├── academic/
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
npm run build   # Build production tối ưu hóa tĩnh — BẮT BUỘC PASS 100% (21/21 trang)
```
