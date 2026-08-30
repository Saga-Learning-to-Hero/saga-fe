---
trigger: always_on
description: Frontend performance optimization rules, Cytoscape memory management, dynamic imports, and React caching strategies.
---

# Quy Chuẩn Tối Ưu Hiệu Năng & Quản Lý Bộ Nhớ (Performance & Optimization)

## 1. Tối Ưu Đồ Thị Cytoscape.js (Graph Performance Engine)
Đồ thị phân tích có thể chứa hàng trăm đỉnh (Nodes) và cạnh (Edges). Để đảm bảo trải nghiệm mượt mà 60 FPS:

### ⚡ A. Bắt Buộc Sử Dụng `cy.batch()` Khi Cập Nhật Đồ Thị
Không bao giờ thêm hoặc sửa đổi từng node/edge riêng lẻ gây re-render liên tục. Luôn gom vào khối `batch`:
```typescript
cy.batch(() => {
  cy.elements().remove();
  cy.add(newElements);
});
```

### 🧹 B. Quản Lý Rò Rỉ Bộ Nhớ (Memory Cleanup Bắt Buộc)
Khi unmount component đồ thị, **BẮT BUỘC** phải hủy instance Cytoscape để giải phóng bộ nhớ WebGL/Canvas:
```typescript
useEffect(() => {
  const cy = cytoscape({ ... });
  cyRef.current = cy;

  return () => {
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }
  };
}, []);
```

### 🎯 C. Debounce & Tối Ưu Render Tương Tác
- Sử dụng hiệu ứng **Class-based Dimming** (`.faded`, `.highlighted`) thay vì trực tiếp mutate CSS properties trên từng node qua vòng lặp.
- Giới hạn tần suất xử lý sự kiện `resize` và `zoom` bằng debounce/throttle.

---

## 2. Dynamic Imports Cho Thư Viện Nặng (Client-Only Code Splitting)
Cytoscape.js và Recharts là các thư viện chỉ chạy trên Client (yêu cầu DOM/Canvas). Khi import ở các trang phức tạp, luôn cân nhắc dùng dynamic import với `ssr: false`:

```typescript
import dynamic from "next/dynamic";

export const DynamicCytoscapeCanvas = dynamic(
  () => import("./cytoscape-graph-canvas").then((mod) => mod.CytoscapeGraphCanvas),
  { ssr: false, loading: () => <GraphCanvasSkeleton /> }
);
```

---

## 3. Tối Ưu Render React & Memoization
- **`useMemo`**: Bắt buộc dùng cho các tác vụ lọc dữ liệu đồ thị, tính tổng chỉ số sinh viên/nhóm và ma trận SNA:
  ```typescript
  const filteredNodes = useMemo(() => {
    return initialData.nodes.filter(...);
  }, [initialData, selectedStudentId, selectedSprint, filterType]);
  ```
- **`useCallback`**: Dùng cho các callback truyền sâu vào Cytoscape Canvas (như `onSelectNode`).
- **Phân tách State cục bộ**: Tránh lưu toàn bộ filter vào global store nếu chỉ dùng trong 1 view; giữ state ở mức component gần nhất.

---

## 4. Chiến Lược Caching Với TanStack Query
- **`staleTime: 1000 * 60 * 5`** (5 phút): Với dữ liệu tĩnh ít biến động như danh sách lớp học kỳ, danh mục môn học.
- **`staleTime: 1000 * 30`** (30 giây): Với dữ liệu biến động real-time như commit log, trạng thái Jira task.
- **Event-Driven Invalidation**: Chỉ kích hoạt `queryClient.invalidateQueries()` khi người dùng thực hiện thao tác đột biến (Mutations) hoặc khi nhận Webhook event.

---

## 5. Tối Ưu Bundle & Iconography
- **Tree-shaking Lucide Icons**: Luôn import tường minh từng icon riêng lẻ (`import { UsersIcon } from "lucide-react"`), tuyệt đối không import cả gói `import * as Icons`.
- **Zero Runtime CSS**: Tận dụng tối đa Tailwind CSS v4 biên dịch tĩnh, không dùng CSS-in-JS gây overhead trên runtime.
