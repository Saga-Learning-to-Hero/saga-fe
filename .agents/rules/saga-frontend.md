# SAGA Frontend — Quy tắc phát triển giao diện

## Ngôn ngữ
- Toàn bộ UI, label, placeholder, tooltip, thông báo lỗi, nội dung tĩnh đều phải bằng **tiếng Việt**.
- Comment trong code bằng tiếng Việt.
- Tên biến, hàm, component vẫn dùng tiếng Anh theo chuẩn camelCase/PascalCase.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand
- **Data Fetching**: TanStack React Query + Axios
- **Graph**: Cytoscape.js
- **Icons**: lucide-react
- **Font**: **Plus Jakarta Sans** (UI & Heading) + **JetBrains Mono** (Code & Số liệu/Metrics) — load qua `next/font/google` hỗ trợ tiếng Việt hoàn chỉnh.

## Design System — Academic Tech (globals.css)

### Triết lý thiết kế (Theme: Academic Tech)
- Phong cách giao diện lấy cảm hứng từ **Linear / Vercel / GitHub Next**: Trí tuệ, Hiện đại, Chuẩn Đại học & Phân tích Đồ thị.
- **Primary Color**: Deep Indigo (`#4F46E5` / `oklch(0.52 0.22 265)`) — màu của trí tuệ và sự chuẩn mực.
- **Accent Color**: Teal Cyan (`#06B6D4` / `oklch(0.65 0.18 200)`) — màu điểm nhấn dữ liệu, node đồ thị.
- **Background**:
  - **Light Mode**: Slate siêu nhạt `#F8FAFC` (`oklch(0.985 0.005 250)`), Sidebar nền `#FAFCFF` sáng sạch.
  - **Dark Mode**: Deep Obsidian Slate `#0F172A` (`oklch(0.12 0.03 260)`), Sidebar `#131D31`.

### Nguyên tắc bất di bất dịch
- **KHÔNG bao giờ hardcode màu, font, shadow, spacing** ở component hay page.
- Luôn dùng CSS variable hoặc Tailwind utility tương ứng.

### CSS Variables chính (dùng trực tiếp)
```
Màu brand:    var(--saga-primary), var(--saga-accent)
Trạng thái:   var(--saga-success), var(--saga-warning), var(--saga-danger), var(--saga-info)
Surface:      var(--background), var(--card), var(--popover)
Text:         var(--foreground), var(--muted-foreground)
Border:       var(--border)
Graph nodes:  var(--node-student), var(--node-activity), var(--node-criterion), var(--node-group), var(--node-outcome)
Typography:   var(--font-sans) (Plus Jakarta Sans), var(--font-mono) (JetBrains Mono)
```

### Tailwind utilities tương ứng
```
bg-primary, text-primary          → màu brand chính (Deep Indigo)
bg-muted, text-muted-foreground   → màu phụ/mờ
bg-card, border-border            → card surface
text-success/warning/danger/info  → trạng thái (custom utility)
bg-success-muted, bg-danger-muted → badge/tag status
surface-card, surface-raised      → card có border + shadow
shadow-saga-sm/md/lg              → shadow levels
transition-fast/normal/slow       → animation
node-student/activity/criterion   → graph node color
```

### Dark mode
- Tự động theo system preference (`prefers-color-scheme: dark`).
- Hỗ trợ toggle trực tiếp qua class `.dark` trên `<html>` và lưu `localStorage` key `saga-theme`.
- Không cần viết variant `dark:` thủ công nếu đã dùng CSS variable.

## shadcn/ui
- Thêm component mới bằng lệnh: `npx shadcn@latest add <component>`
- Không sửa trực tiếp file trong `src/components/ui/` — đây là file do shadcn generate.
- Khi dùng shadcn component, ưu tiên truyền `variant` và `size` prop thay vì override className.
- Nếu cần style tuỳ chỉnh, tạo wrapper component riêng thay vì sửa file gốc.

## Cấu trúc thư mục
```
src/
├── app/
│   ├── (auth)/           # Route group auth (không có header/sidebar)
│   │   └── login/        # Trang đăng nhập
│   ├── (dashboard)/      # Route group dashboard (App Shell Layout với Sidebar)
│   ├── (marketing)/      # Route group landing/marketing
│   │   └── page.tsx      # Landing page (route "/")
│   └── layout.tsx        # Root layout — Plus Jakarta Sans + JetBrains Mono, QueryProvider
├── components/
│   ├── ui/               # shadcn/ui components (KHÔNG sửa)
│   ├── landing/          # UI components cho trang landing
│   └── layout/           # App Shell Layout: Sidebar, Header
│       └── sidebar/      # Sidebar modular (index, sidebar-nav, sidebar-user-profile, nav-config)
├── features/             # Business logic theo domain (cùng cấp với components/)
│   ├── assessment/       # Tính năng đánh giá
│   ├── auth/             # Tính năng xác thực & Auth store
│   ├── dashboard/        # Tính năng dashboard
│   ├── graph/            # Tính năng đồ thị Cytoscape
│   └── integrations/     # Tích hợp bên ngoài
├── providers/            # React context providers
├── hooks/                # Custom hooks dùng chung
├── lib/                  # Utilities, helpers
├── store/                # Zustand stores
└── types/                # TypeScript types
```

> **Phân biệt `components/` vs `features/`**:
> - `components/` → UI thuần, không có business logic, có thể tái sử dụng nhiều nơi.
> - `features/` → Mỗi folder là một domain nghiệp vụ, chứa components, hooks, store, types riêng của feature đó.

## Quy trình kiểm tra bắt buộc (Verification)
**Sau mỗi lần thay đổi code, PHẢI chạy đủ 2 lệnh theo thứ tự:**

```bash
npm run lint    # Kiểm tra lỗi ESLint — phải pass 0 error
npm run build   # Build production — phải thành công không lỗi
```

- Nếu lint báo **error** → phải fix trước khi tiếp tục, không được bỏ qua.
- Nếu build **fail** → bắt buộc fix trước khi commit.
- Chỉ commit khi cả lint + build đều pass.
