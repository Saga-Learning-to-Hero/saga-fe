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

## 4. Chiến Lược Caching & Tối Ưu Gọi API (TanStack Query + Axios)
- **Phân tầng `staleTime`**:
  - `staleTime: 1000 * 60 * 5` (5 phút): Dữ liệu tĩnh ít biến động (học kỳ, danh mục môn học, danh sách lớp).
  - `staleTime: 1000 * 30` (30 giây): Dữ liệu biến động theo thời gian thực (commit log, trạng thái Jira task, bảng điểm).
- **Request Deduplication & Cache Reuse**: Tận dụng cơ chế gom request tự động của TanStack Query để loại bỏ các cuộc gọi API trùng lặp tại cùng một thời điểm.
- **Optimistic Updates (Cập nhật Lạc quan)**:
  - Với các thao tác tức thời (đổi trạng thái Task Jira, thêm/xóa Repo, chấm điểm): Cập nhật State giao diện ngay lập tức để phản hồi người dùng < 16ms, sau đó mới gọi mutation ngầm tới Backend. Tự động rollback khi gặp lỗi.
- **Debounce Cho Tìm Kiếm & Bộ Lọc**: Bắt buộc debounce 300ms - 400ms cho các ô input tìm kiếm (commit, issue, audit log) để tránh spam API trên từng ký tự.

---

## 5. Tối Ưu Bundle & Iconography
- **Tree-shaking Lucide Icons**: Luôn import tường minh từng icon riêng lẻ (`import { UsersIcon } from "lucide-react"`), tuyệt đối không import cả gói `import * as Icons`.
- **Zero Runtime CSS**: Tận dụng tối đa Tailwind CSS v4 biên dịch tĩnh, không dùng CSS-in-JS gây overhead trên runtime.

---

## 6. Ổn Định Khung Hình & Chống Nhấp Nháy (Zero Layout Shift - CLS = 0)
- **Skeleton Loaders Đúng Kích Thước**: Mọi trang và component khi đợi API phản hồi phải sử dụng Skeleton Loader có chiều cao (`h-...`) và bố cục tương đương nội dung thật.
- **Tránh Spinner Toàn Màn Hình**: Không dùng loading overlay che toàn bộ trang gây đứt đoạn trải nghiệm, ưu tiên skeleton theo từng thẻ card hoặc bảng dữ liệu.

---

## 7. Tải Trước Dự Đoán (Predictive Hover & Viewport Prefetching)
- **Tận dụng độ trễ cơ học (150ms - 300ms)**: Con người mất trung bình 150ms - 300ms từ khi rê chuột (`hover`) vào một phần tử cho tới khi nhấn (`click`).
- **Prefetch Đa Tầng khi `onMouseEnter`**:
  - Gọi `router.prefetch(url)` để Next.js nạp trước gói mã nguồn JS của trang đích.
  - Gọi `queryClient.prefetchQuery(...)` để TanStack Query nạp trước dữ liệu API vào RAM.
  - Khi người dùng click chuột, trang và dữ liệu đã có sẵn trong RAM ➔ Giao diện hiển thị ngay lập tức trong **0ms (Instant Navigation)**.

---

## 8. Kế Thừa Dữ Liệu Bộ Nhớ Đệm (`initialData` Cache Inheritance)
- Khi điều hướng từ trang danh sách (List View) sang trang chi tiết (Detail View `[id]`):
  - **Bắt buộc** cấu hình `initialData` trong `useQuery` để lấy thông tin đối tượng đã có sẵn từ query cache của danh sách:
  ```typescript
  export function useCourseDetail(courseId: string) {
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: ACADEMIC_QUERY_KEYS.courseDetail(courseId),
      queryFn: () => CourseService.getCourseById(courseId),
      staleTime: 1000 * 60 * 5,
      initialData: () => {
        const cached = queryClient.getQueryData<CourseResponse[]>(ACADEMIC_QUERY_KEYS.courses());
        return cached?.find((c) => c.id === courseId);
      },
    });
  }
  ```
  - Loại bỏ hoàn toàn thác đổ gọi API (Waterfall), hiển thị tiêu đề và thông tin cơ bản ngay trong 0ms mà không làm gián đoạn người dùng.

---

## 9. Điều Hướng Tức Thời Với Next.js (`prefetch={true}`)
- **Bắt buộc bật `prefetch={true}`**: Toàn bộ các thẻ `<Link>` trên Sidebar (`sidebar-nav.tsx`), Top Header Tabs (`top-nav-tabs.tsx`), và các liên kết thẻ/dòng bảng sang trang chi tiết bắt buộc phải có `prefetch={true}`:
  ```tsx
  <Link href={item.href} prefetch={true} className={...}>
  ```
- Giúp Next.js tự động tải trước các chunk tĩnh vào bộ nhớ đệm ngay khi liên kết xuất hiện trong tầm nhìn (Viewport).

---

## 10. Tìm Kiếm Không Nghẽn Luồng & Giữ Trạng Thái Tab
- **`useDeferredValue` Cho Tìm Kiếm / Lọc**: Tuyệt đối không để việc tính toán lọc danh sách lớn làm đơ luồng nhập liệu bàn phím. Sử dụng `useDeferredValue` để phản hồi gõ phím luôn đạt 60 FPS mượt mà.
- **Giữ DOM Cho Component Tab (`keepMounted: true`)**: Các giao diện chuyển đổi Tab quản trị (như trang Dữ liệu học thuật, Bảng điểm) phải kích hoạt `keepMounted` trên `TabsContent` để không bị hủy (unmount) và phải render lại từ đầu, giúp chuyển tab diễn ra tức thì trong 0ms.


