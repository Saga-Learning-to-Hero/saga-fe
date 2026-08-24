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
