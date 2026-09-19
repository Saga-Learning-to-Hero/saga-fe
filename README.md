# SAGA — Student Activity Graph Based Continuous Assessment

> **Hệ thống Đánh giá Quá trình Liên tục dựa trên Đồ thị cho Project-Based Learning**  
> Dự án Tốt nghiệp Capstone · FPT University · 2026

SAGA tích hợp sâu với **GitHub** (Commits, PRs) và **Jira** (Tasks, Sprints) để mô hình hóa toàn bộ hoạt động học tập của sinh viên thành đồ thị ngữ nghĩa (Neo4j), từ đó đánh giá tỷ lệ đóng góp công sức minh bạch và có thể giải thích (Explainable AI).

---

## Ngăn Xếp Công Nghệ

| Tầng | Công nghệ | Phiên bản |
| :--- | :--- | :--- |
| **Framework** | Next.js App Router + TypeScript | 16.3.5 |
| **UI Runtime** | React | 19.2.8 |
| **Styling** | Tailwind CSS v4 + shadcn/ui | — |
| **Graph** | Cytoscape.js | ^3.34.1 |
| **Charts** | Recharts | ^3.10.1 |
| **Server State** | TanStack React Query | ^5.102.2 |
| **Client State** | Zustand | ^5.0.15 |
| **HTTP** | Axios | ^1.19.0 |
| **Validation** | Zod | ^4.5.4 |
| **Thông báo** | Sonner | ^2.0.8 |
| **Icon** | Lucide React | ^1.33.0 |
| **Testing** | Vitest + Testing Library | — |

---

## Cấu Trúc Thư Mục

```text
saga-fe/
├── src/
│   ├── app/                        # Next.js App Router — chỉ routing, không viết logic
│   │   ├── (auth)/                 # Tuyến không bảo vệ (Login)
│   │   ├── (dashboard)/            # Tuyến bảo vệ có App Shell
│   │   │   ├── admin/              # Quản trị viên (/admin/*)
│   │   │   ├── lecturer/           # Giảng viên (/lecturer/*)
│   │   │   └── student/            # Sinh viên (/student/*)
│   │   └── (marketing)/            # Landing Page
│   │
│   ├── features/                   # Toàn bộ nghiệp vụ phân theo Domain
│   │   ├── admin/                  # Quản lý Users, Academic, Subjects, Audit Log
│   │   ├── auth/                   # Đăng nhập, phân quyền, Role Routes
│   │   ├── analytics/              # Activity Heatmap, thống kê
│   │   ├── graph/                  # Cytoscape Engine, Traceability, Pipeline, SNA
│   │   ├── integrations/           # Jira / GitHub OAuth & Webhook
│   │   ├── lecturer/               # Courses, Contribution, Peer Review, Teams
│   │   ├── notification/           # SSE Realtime, Notification Center
│   │   ├── profile/                # Hồ sơ cá nhân, liên kết tài khoản
│   │   ├── progress/               # Tiến độ Sprint
│   │   └── student/                # Assessment, Commits, Contribution, Dashboard,
│   │                               # Project, Sprint Progress, Courses, Graph
│   │
│   ├── components/
│   │   ├── common/                 # SagaLogo, CustomSelect, ThemeToggle...
│   │   ├── layout/                 # Sidebar, TopNavHeader, NavConfig
│   │   └── ui/                     # shadcn/ui nguyên bản
│   │
│   ├── lib/                        # Axios client, helpers, formatters
│   ├── providers/                  # QueryClient, Tooltip Provider
│   ├── store/                      # Zustand Global Stores
│   ├── testing/                    # Vitest helpers, FPT Reporter
│   └── types/                      # TypeScript interfaces & enums dùng chung
│
├── tests/
│   └── unit/                       # 81 Unit Test file ánh xạ 1-1 với src/
│
├── docs/
│   ├── SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md   # Canonical spec
│   ├── PROJECT_HANDOFF_GUIDE.md                     # Hướng dẫn bàn giao
│   ├── api/                        # Contract API & OpenAPI spec
│   ├── architecture/               # SAGA_GRAPHS_SPECIFICATION.md
│   └── capstone-defense/           # Tài liệu bảo vệ đề tài
│
└── .agents/
    └── rules/                      # Quy chuẩn phát triển bắt buộc đọc trước khi code
```

---

## Lệnh Phát Triển

```bash
npm run dev          # Khởi động dev server (Turbopack)
npm run build        # Build production (bắt buộc pass 34/34 trang)
npm run lint         # ESLint — bắt buộc 0 Error, 0 Warning
npm run test         # Vitest — bắt buộc 794/794 tests pass
npm run test:watch   # Vitest chế độ watch
npm run test:coverage  # Báo cáo độ phủ test
```

---

## Phân Quyền 3 Vai Trò

| Vai trò | Namespace | Điều hướng sau đăng nhập |
| :--- | :--- | :--- |
| **Quản trị viên** | `/admin/*` | `/admin/dashboard` |
| **Giảng viên** | `/lecturer/*` | `/lecturer/courses` |
| **Sinh viên** | `/student/*` | `/student/courses` |

Layout shell tự động chọn theo vai trò: Admin dùng **Sidebar dọc**, Giảng viên & Sinh viên dùng **Top Header Navigation 2 tầng**.

---

## Quy Trình Trước Khi Commit

```bash
npm run lint      # 0 Error, 0 Warning
npm run test      # 794/794 pass
npm run build     # 34/34 trang
git push
```

Xem thêm quy chuẩn Git, commit message và PR workflow tại [`.agents/rules/git-and-workflow.md`](.agents/rules/git-and-workflow.md).

---

## Tài Liệu Dự Án

| Tài liệu | Mô tả |
| :--- | :--- |
| [`docs/SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md`](docs/SAGA_BUSINESS_REQUIREMENTS_AND_COVERAGE.md) | Đặc tả nghiệp vụ & độ phủ (Canonical) |
| [`docs/PROJECT_HANDOFF_GUIDE.md`](docs/PROJECT_HANDOFF_GUIDE.md) | Hướng dẫn bàn giao & onboarding |
| [`docs/architecture/SAGA_GRAPHS_SPECIFICATION.md`](docs/architecture/SAGA_GRAPHS_SPECIFICATION.md) | Đặc tả kỹ thuật 5 đồ thị Neo4j |
| [`docs/api/`](docs/api/) | Contract API & OpenAPI spec |
| [`docs/capstone-defense/`](docs/capstone-defense/) | Tài liệu bảo vệ hội đồng |
| [`.agents/rules/`](.agents/rules/) | Quy chuẩn phát triển bắt buộc |