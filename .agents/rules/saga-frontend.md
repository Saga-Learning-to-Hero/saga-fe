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
- **Font**: Inter (UI) + JetBrains Mono (code/số liệu) — load qua `next/font/google`

## Design System — SAGA globals.css

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
```

### Tailwind utilities tương ứng
```
bg-primary, text-primary          → màu brand chính
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
- Cũng hỗ trợ toggle qua class `.dark` trên `<html>`.
- Không cần viết variant `dark:` thủ công nếu đã dùng CSS variable.

## shadcn/ui
- Thêm component mới bằng lệnh: `npx shadcn@latest add <component>`
- Không sửa trực tiếp file trong `src/components/ui/` — đây là file do shadcn generate.
- Khi dùng shadcn component, ưu tiên truyền `variant` và `size` prop thay vì override className.
- Nếu cần style tuỳ chỉnh, tạo wrapper component riêng thay vì sửa file gốc.

## Cấu trúc thư mục
```
src/
├── app/              # Next.js App Router (pages, layouts)
├── components/
│   ├── ui/           # shadcn/ui components (KHÔNG sửa)
│   └── [feature]/    # Component theo feature
├── providers/        # React context providers
├── hooks/            # Custom hooks
├── lib/              # Utilities, helpers
├── store/            # Zustand stores
└── types/            # TypeScript types
```

## Component
- Dùng `"use client"` chỉ khi thực sự cần (event handler, useState, useEffect).
- Server Component là mặc định — ưu tiên fetch data ở Server Component.
- Mỗi component nằm trong file riêng, tên file = tên component dạng kebab-case.
- Export default cho page/layout, export named cho component tái sử dụng.

## React Query
- Mọi API call đều qua React Query (`useQuery`, `useMutation`).
- Query key là mảng string mô tả rõ: `["students", id]`, `["graph", courseId]`.
- Không dùng `useEffect` để fetch data.

## Zustand
- Mỗi feature có store riêng trong `src/store/`.
- Tên store: `useXxxStore` (ví dụ: `useGraphStore`, `useAuthStore`).
- Không lưu server state vào Zustand — server state thuộc về React Query.

## Quy trình kiểm tra bắt buộc (Verification)
**Sau mỗi lần thay đổi code, PHẢI chạy đủ 2 lệnh theo thứ tự:**

```bash
npm run lint    # Kiểm tra lỗi ESLint — phải pass 0 error
npm run build   # Build production — phải thành công không lỗi
```

- Nếu lint báo **error** → phải fix trước khi tiếp tục, không được bỏ qua.
- Nếu lint báo **warning** → ghi nhận, cố gắng fix nếu có thể.
- Nếu build **fail** → bắt buộc fix trước khi commit.
- Chỉ commit khi cả lint + build đều pass.

## Cấu trúc thư mục (thực tế)
```
src/
├── app/
│   ├── (auth)/           # Route group auth (không có header/sidebar)
│   │   └── login/        # Trang đăng nhập
│   ├── (marketing)/      # Route group landing/marketing
│   │   └── page.tsx      # Landing page (route "/")
│   └── layout.tsx        # Root layout — font, QueryProvider
├── components/
│   ├── ui/               # shadcn/ui components (KHÔNG sửa)
│   └── landing/          # Shared UI components theo trang/nhóm
├── features/             # Business logic theo domain (cùng cấp với components/)
│   ├── assessment/       # Tính năng đánh giá
│   ├── auth/             # Tính năng xác thực
│   ├── dashboard/        # Tính năng dashboard
│   ├── graph/            # Tính năng đồ thị
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
> - Feature component chỉ dùng trong feature đó → để trong `features/[domain]/components/`.
> - Component dùng lại ở nhiều feature → để trong `components/`.
