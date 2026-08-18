# 📊 Student Activity Graph - Frontend MVP

Dự án này là hệ thống đánh giá quá trình liên tục (Continuous Assessment) dựa trên đồ thị (Graph-Based) của sinh viên.
Hệ thống tích hợp sâu với GitHub (Commits, PRs) và Jira (Tasks, Sprints) để tính toán tỷ lệ đóng góp của từng thành viên.

## 🛠 Tech Stack Chốt Hạ
* **Framework:** Next.js (App Router) + TypeScript.
* **Styling:** Tailwind CSS + shadcn/ui.
* **Graph Rendering:** Cytoscape.js (Cập nhật Imperative, Không nhét vào React State).
* **Server State:** TanStack Query (Quản lý API caching, refetching).
* **Client State:** Zustand (Chỉ lưu UI tĩnh như theme, filters).
* **Real-time:** Server-Sent Events (SSE) kèm kiểm tra version.

---

## 📂 Kiến Trúc Thư Mục (Feature-Sliced Design)
Dự án áp dụng chặt chẽ kiến trúc chia theo tính năng (Feature-Based). Mọi nghiệp vụ phải nằm trong thư mục `src/features/`.

```text
src/
├── app/                  # Lớp Routing (Next.js App Router). Chỉ gọi Component, KHÔNG viết logic ở đây.
├── features/             # LỚP NGHIỆP VỤ CỐT LÕI (Chia theo Domain)
│   ├── auth/             # Logic đăng nhập, phân quyền, OAuth2 (Jira/GitHub credentials)
│   ├── dashboard/        # Bảng điều khiển chung, thống kê tổng quan
│   ├── graph/            # Lõi hiển thị đồ thị (Cytoscape.js, Web Worker)
│   ├── tasks/            # Quản lý Task kéo từ Jira về (Bảng, danh sách)
│   ├── assessment/       # Nghiệp vụ tính điểm, trọng số, tỷ lệ đóng góp (Continuous Assessment)
│   └── integrations/     # Quản lý cấu hình liên kết Jira, GitHub Webhooks của user
│
├── components/           # UI Components dùng chung (Button, Modal, Layout, Navbar)
├── hooks/                # Custom Hooks toàn cục (useSSE, useDebounce...)
├── lib/                  # Cấu hình thư viện (Axios interceptors, QueryClient)
└── types/                # Định nghĩa TypeScript toàn cục (API Responses, Models)

📝 HƯỚNG DẪN DÀNH CHO FE DEV: CÁCH TẠO MỘT TÍNH NĂNG MỚI
Khi bạn được giao code một tính năng mới (Ví dụ: Thêm chức năng xem "Lịch sử Commit"), TUYỆT ĐỐI KHÔNG tạo file lung tung. Hãy làm theo 4 bước sau:

1. Xác định Domain (Tính năng thuộc nhóm nào?):
Thuộc nhóm liên kết hệ thống -> Chui vào thư mục src/features/integrations/. Nếu là tính năng hoàn toàn mới, hãy tạo một thư mục mới trong features/ (VD: features/commits/).

2. Tạo cấu trúc bên trong thư mục Feature mới:
Bất kỳ một Feature nào cũng phải có đủ các thư mục con sau (nếu có sử dụng):

/components: Chứa giao diện (VD: CommitList.tsx).

/api: Chứa các hàm gọi TanStack Query (VD: getCommits.ts).

/store: Chứa trạng thái Zustand của riêng tính năng đó (nếu cần).

/types: Chứa interface TypeScript của dữ liệu trả về.

3. Khai báo API chuẩn:
Không gọi Axios trực tiếp trong Component. Viết hàm ở /api, sau đó dùng TanStack Query:

TypeScript
// features/commits/api/useCommits.ts
export const useCommits = (taskId: string) => {
  return useQuery({
    queryKey: ['commits', taskId],
    queryFn: () => axios.get(`/api/tasks/${taskId}/commits`),
  });
};
4. Gọi vào App Router:
Ra ngoài thư mục src/app/, tạo file page.tsx và gọi cái component bạn vừa làm vào.

⚠️ 3 NGUYÊN TẮC SỐNG CÒN VỀ HIỆU NĂNG (ĐẶC BIỆT LÀ GRAPH)
Xử Lý Cytoscape.js (Chống Treo Trình Duyệt)

Bắt buộc Lazy Load: Component chứa Canvas bắt buộc phải dùng next/dynamic với ssr: false.

KHÔNG lưu Nodes/Edges vào React State: Khi có dữ liệu realtime, lưu reference bằng useRef và cập nhật trực tiếp vào Canvas bằng lệnh cy.batch(). Đừng để Next.js re-render 10,000 node!

Xử Lý State (Tách bạch rõ ràng)

TanStack Query dùng để lấy dữ liệu từ Spring Boot (Server State).

Zustand CHỈ dùng để lưu trạng thái giao diện UI (Ví dụ: ID node đang click, bộ lọc, Sidebar mở hay đóng).

Nhận Dữ Liệu Real-Time (SSE)

Mọi đồ thị và bảng điểm đều được Backend bắn qua SSE. Mỗi event có một mã version.

FE phải check: Nếu version mới > version hiện tại + 1 -> Mạng FE vừa bị rớt, mất gói tin -> Phải gọi lại API (TanStack Query) để lấy dữ liệu mới nhất.