---
trigger: always_on
description: UI/UX design system, color tokens, CustomSelect component rules, modal responsiveness standards, and styling patterns for SAGA Frontend.
---

# Hệ Thống Thiết Kế UI/UX & Quy Chuẩn Giao Diện (Design System)

## 1. Phong Cách Thiết Kế: Academic Tech
- **Chủ đề**: Hiện đại, Học thuật, Trực quan hóa dữ liệu theo phong cách Linear/GitHub Next.
- **Màu sắc chủ đạo**:
  - **Deep Indigo Brand** (`var(--saga-primary)` / `oklch(0.52 0.22 265)`): Màu của trí tuệ, tính chuẩn mực học thuật.
  - **Teal Cyan Accent** (`var(--saga-accent)` / `oklch(0.65 0.18 200)`): Màu điểm nhấn dữ liệu, node đồ thị và đồ thị truy xuất.
- **Quy tắc bất di bất dịch**:
  - **KHÔNG hardcode mã màu HEX trực tiếp trong inline styles hoặc arbitrary Tailwind classes** (như `bg-[#123456]`).
  - Luôn sử dụng CSS variables hoặc semantic Tailwind classes: `bg-primary`, `bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`.

---

## 2. Quy Chuẩn Thành Phần Dùng Chung (Component Rules)

### 📌 A. Bắt Buộc Dùng `<CustomSelect>` — Cấm dùng `<select>` HTML nguyên bản
- **Tuyệt đối KHÔNG sử dụng thẻ `<select>` và `<option>` mặc định của HTML** trên bất kỳ giao diện nào của hệ thống.
- **BẮT BUỘC sử dụng component chuẩn hóa**: `src/components/common/custom-select.tsx`
  ```tsx
  import { CustomSelect } from "@/components/common/custom-select";

  <CustomSelect
    id="sprint-filter"
    value={selectedSprint}
    onChange={setSelectedSprint}
    options={[
      { value: "sprint-01", label: "Sprint 1 - Nền tảng", subLabel: "Đã hoàn thành" },
      { value: "sprint-02", label: "Sprint 2 - Slicing Pie", subLabel: "Đang diễn ra" },
    ]}
  />
  ```
- `<CustomSelect>` hỗ trợ: nhãn phụ `subLabel`, nhãn nhóm `groupLabel`, icon, tìm kiếm, vô hiệu hóa và truyền `id` để tương thích với `<Label htmlFor="...">`.

---

### 📌 B. Cấu Trúc Modal / Dialog Chống Tràn Màn Hình (Responsive Modal Pattern)
Tất cả các Modal và Dialog (chỉnh sửa dự án, chi tiết task, chi tiết commit, đánh giá chéo) **BẮT BUỘC** phải tuân thủ cấu trúc 3 phần với body cuộn độc lập:

```tsx
<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
  {/* 1. Modal Container: Giới hạn chiều cao max-h-[92vh] và flex flex-col */}
  <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
    
    {/* 2. Modal Header (Cố định ở đỉnh) */}
    <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
      <h3 className="text-base font-extrabold text-foreground">Tiêu đề Modal</h3>
      <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-muted cursor-pointer">
        <XIcon className="w-4 h-4" />
      </button>
    </div>

    {/* 3. Modal Body (Cuộn độc lập - flex-1 overflow-y-auto) */}
    <div className="p-6 overflow-y-auto flex-1 space-y-4">
      {/* Nội dung form hoặc chi tiết */}
    </div>

    {/* 4. Modal Footer (Cố định ở đáy) */}
    <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
      <Button variant="outline" onClick={onClose}>Hủy</Button>
      <Button type="submit">Lưu thay đổi</Button>
    </div>

  </div>
</div>
```

---

## 3. Quy Chuẩn Typography & Font
- **Plus Jakarta Sans (`var(--font-sans)`)**: Dùng cho toàn bộ UI, văn bản tiếng Việt, tiêu đề `h1`, `h2`, `h3`, menu điều hướng và bảng biểu.
- **JetBrains Mono (`var(--font-mono)`)**: Dùng cho:
  - Mã sinh viên (`HE170504`, `SE171234`)
  - Mã băm Git Commit (`d46f600`, `21394e3`)
  - Mã Task Jira (`SAGA-15`, `SAGA-28`)
  - Số liệu thống kê, Story points, phần trăm và công thức toán học (`+340 / -12 lines`, `94.5%`).

---

## 4. Bảng Màu Huy Hiệu & Trạng Thái (Status Badges)
| Trạng thái | Class Tailwind | Ý nghĩa học thuật |
| :--- | :--- | :--- |
| **Active / Đang học** | `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30` | Lớp/Task đang tiến hành bình thường |
| **Completed / Hoàn thành** | `bg-muted text-muted-foreground border border-border` | Đã kết thúc |
| **Warning / Cần chú ý** | `bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30` | Chậm tiến độ / ít tương tác |
| **Critical / Nguy cơ cao** | `bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30` | Thiếu commit / Nguy cơ rớt môn |
| **MSR Anomaly Alert** | `bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 animate-pulse` | Task Done nhưng 0 commit linked |
| **Ghosting Anomaly Alert** | `bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 animate-pulse` | Thành viên bị cô lập, Degree Centrality = 0 |
| **Key Contributor** | `bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30` | Thành viên nòng cốt gánh team |
