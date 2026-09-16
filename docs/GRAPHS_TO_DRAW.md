# Trao đổi Kỹ thuật & Đề xuất Đồng bộ Đồ thị SAGA (BE & FE)
> **Tài liệu tham chiếu:** [`docs/SAGA_GRAPHS_TO_DRAW.md`](./SAGA_GRAPHS_TO_DRAW.md)  
> **Người gửi:** Phân hệ Frontend (FE)  
> **Người nhận:** Phân hệ Backend (BE) / Kỹ sư cơ sở dữ liệu Neo4j  
> **Mục đích:** Thống nhất mô hình dữ liệu đồ thị Neo4j, chuẩn hóa câu truy vấn Cypher và đặc tả 5 API Endpoint trả về định dạng Cytoscape.js để phục vụ trực quan hóa và báo cáo bảo vệ tốt nghiệp.

---

## 📌 I. ĐÁNH GIÁ CHUNG VỀ TÀI LIỆU `SAGA_GRAPHS_TO_DRAW.md`

Tài liệu `SAGA_GRAPHS_TO_DRAW.md` có tính định hướng và thực tiễn rất cao:
1. **Phân rã phạm vi hợp lý**: Giới hạn đồ thị theo từng đối tượng hẹp (1 Project / 1 Sprint / 1 Sinh viên) giúp đồ thị trực quan, không bị quá tải điểm (lag/vỡ layout trên canvas WebGL).
2. **Khắc họa trúng trọng tâm đề tài**:
   - **Graph 1 (Tổng quan)**: Chứng minh mối quan hệ giữa Ngữ cảnh học thuật (Course, Team, Project, Sprint) và Bằng chứng kỹ thuật (Task, Commit).
   - **Graph 2 (Contribution Path)**: Giải thích nguồn gốc điểm số (Traceability / XAI) cho từng sinh viên.
   - **Graph 3 (Sprint Activity)**: Minh chứng cho tính chất "Continuous Assessment" (Đánh giá liên tục qua các giai đoạn).
   - **Graph 4 (Attribution)**: Minh chứng tính toàn vẹn dữ liệu, chống gian lận gán bừa commit.
   - **Graph 5 (Peer Review)**: Giải thích hệ số đồng đẳng $P$ trong công thức đóng góp Slicing Pie.
3. **Nguyên tắc tính điểm đúng đắn**: Task Jira là **nguồn điểm**, Commit/PR là **bằng chứng đối soát** (không coi commit là điểm để tránh tình trạng sinh viên spam commit rác).

---

## ❓ II. 5 VẤN ĐỀ KỸ THUẬT CẦN BE XÁC NHẬN & ĐỒNG BỘ

Để việc truy vấn từ cơ sở dữ liệu đồ thị Neo4j lên Frontend diễn ra liền mạch, FE đề xuất thảo luận 5 nội dung kỹ thuật sau:

### 1. Chuẩn hóa Tên nhãn Quan hệ (Relationship Types) trong Neo4j
Trong tài liệu `SAGA_GRAPHS_TO_DRAW.md` có một số tên quan hệ đang hơi khác với quy chuẩn Neo4j thông dụng của đề tài:

| Quan hệ trong tài liệu | Đề xuất chuẩn hóa Neo4j | Chiều mũi tên | Ghi chú & Rationale |
| :--- | :--- | :--- | :--- |
| `ASSIGNED` | `[:ASSIGNED_TO]` | `(Student) ➔ (Task)` | Thống nhất với ngữ nghĩa phân công công việc Jira. |
| `EVIDENCED_BY` | `[:IMPLEMENTS]` | `(Commit) ➔ (Task)` | Trong kỹ nghệ phần mềm (MSR), Commit sinh ra để hiện thực hóa Task (`Commit -> Task`). FE hoàn toàn có thể hiển thị nhãn `EVIDENCED_BY` trên UI cho người xem dễ hiểu. |
| `AUTHORED_BY` | `[:AUTHORED]` | `(Identity) ➔ (Commit)` hoặc `(Student) ➔ (Commit)` | Chuẩn ngữ nghĩa tác giả mã nguồn Git. |
| `CLASSIFIED_AS` | `[:CLASSIFIED_AS]` | `(Task) ➔ (Criterion)` | Giữ nguyên như tài liệu. |
| `REVIEWS` | `[:REVIEWED]` | `(Student) ➔ (Student)` | Đi kèm thuộc tính `{ stars: 5, sprintId: "..." }`. |

👉 **Câu hỏi cho BE**: BE hiện đang đặt tên các nhãn quan hệ này trong Cypher thế nào để FE cấu hình Cytoscape CSS styles cho khớp 100%?

---

### 2. Mô hình hóa 4 Node Tiêu chí (`Criterion`: CODE, TEST, DOCUMENT, RESEARCH)
Tài liệu quy định có 4 Node cố định đại diện cho 4 tiêu chí đánh giá, và Task chỉ được nối `CLASSIFIED_AS` tới Criterion khi có nhãn `saga:*` hợp lệ.

👉 **Đề xuất kỹ thuật cho BE**:
- **Phương án A (Khuyến nghị)**: Khởi tạo sẵn 4 Node gốc trong Neo4j:
  ```cypher
  MERGE (:Criterion { id: "crit_code", name: "CODE", label: "Lập trình" })
  MERGE (:Criterion { id: "crit_test", name: "TEST", label: "Kiểm thử" })
  MERGE (:Criterion { id: "crit_doc", name: "DOCUMENT", label: "Tài liệu" })
  MERGE (:Criterion { id: "crit_research", name: "RESEARCH", label: "Nghiên cứu" })
  ```
  Khi đồng bộ Jira Issue, nếu Task có nhãn `saga:code` và đủ bằng chứng, BE chỉ cần tạo cạnh:
  ```cypher
  MATCH (t:Task { key: $taskKey }), (c:Criterion { name: "CODE" })
  MERGE (t)-[:CLASSIFIED_AS]->(c)
  ```
- **Phương án B**: Nếu trong Database BE chỉ lưu thuộc tính `weightType` trên node Task, thì trong DTO API trả về cho FE, BE cần tự bổ sung các Node và Cạnh giả lập của Criterion để FE vẽ được Graph 2 và Graph 3.

---

### 3. Mô hình hóa Thực thể `Identity` trong Graph 4 (Attribution)
Tài liệu định nghĩa: `(Commit)-[:AUTHORED_BY]->(Identity)-[:MAPS_TO]->(Student)`.
- **Mục đích**: Giải quyết trường hợp sinh viên dùng email GitHub cá nhân lạ (không phải email trường), giúp hiển thị được liên kết bị đứt đoạn và phát hiện commit chưa được gán người làm.

👉 **Câu hỏi cho BE**:
- BE hiện đang lưu Node `(:Identity { email, username, provider: "GITHUB" })` trung gian trong Neo4j không, hay đang ánh xạ trực tiếp `Commit -> Student`?
- Nếu BE chưa có Node `Identity`, khi gặp commit không khớp sinh viên nào, BE đang xử lý ra sao (bỏ qua hay vẫn lưu commit mồ côi)?

---

### 4. Tình trạng Đồng bộ Bằng chứng (`Commit` vs `PullRequest`)
Tài liệu có đề cập `PullRequest` bên cạnh `Commit`.

👉 **Câu hỏi cho BE**:
- Webhook GitHub hiện tại của hệ thống đã bắt và lưu các sự kiện Pull Request (`(:PullRequest)`) vào Neo4j chưa?
- **Khuyến nghị từ FE**: Nếu BE chưa hoàn thiện việc bóc tách dữ liệu PR từ GitHub API, ở giai đoạn này nên **thống nhất chỉ dùng `(:Commit)` làm Evidence** để tránh việc đồ thị trên slide có PR nhưng khi bấm demo thực tế lại không có dữ liệu.

---

### 5. Đặc tả 5 API Endpoint trả dữ liệu JSON Cytoscape cho FE
Thay vì để FE phải gọi nhiều API rồi tự tính toán nối đỉnh/cạnh (rất dễ gây sai lệch logic đồ thị), **đề xuất BE cung cấp 5 endpoint chuyên biệt trả về DTO chuẩn Cytoscape.js**:

#### Cấu trúc Payload DTO chuẩn:
```typescript
interface CytoscapeGraphResponse {
  nodes: Array<{
    data: {
      id: string;
      label: string;
      subLabel?: string;
      type: "STUDENT" | "TASK" | "COMMIT" | "SPRINT" | "PROJECT" | "CRITERION" | "IDENTITY";
      status?: string;       // Cho Task: TODO, IN_PROGRESS, DONE
      weightType?: string;   // CODE, TEST, DOC, RESEARCH
      isAnomaly?: boolean;   // true nếu phát hiện MSR Anomaly (Task DONE nhưng 0 commit)
      avatar?: string;       // Cho Student
      [key: string]: any;
    }
  }>;
  edges: Array<{
    data: {
      id: string;
      source: string;
      target: string;
      label: string;         // ASSIGNED_TO, IMPLEMENTS, CLASSIFIED_AS, REVIEWS...
      weight?: number;       // Cho Peer review (stars)
      isAnomaly?: boolean;
    }
  }>;
}
```

#### Danh sách 5 Endpoints đề xuất:
1. **Graph 1 — Student Activity Graph (Toàn nhóm)**:
   - `GET /api/projects/{projectId}/graph/overview`
   - *Phạm vi:* Team, Project, các Sprint, các Task và các Commit liên kết.
2. **Graph 2 — Contribution Path (Cá nhân sinh viên)**:
   - `GET /api/projects/{projectId}/students/{studentId}/graph/contribution?sprintId={sprintId}`
   - *Phạm vi:* Chỉ các Task của sinh viên đó, nối sang Criterion tương ứng và các Commit bằng chứng.
3. **Graph 3 — Sprint Activity (Theo từng Sprint)**:
   - `GET /api/projects/{projectId}/sprints/{sprintId}/graph/activity`
   - *Phạm vi:* Lát cắt hoạt động trong 1 Sprint cụ thể của nhóm.
4. **Graph 4 — Attribution / Identity (Kiểm tra gán định danh)**:
   - `GET /api/projects/{projectId}/graph/attribution`
   - *Phạm vi:* Danh sách Commit, Identity và Student (nổi bật các commit chưa map thành công).
5. **Graph 5 — Peer Review (Mạng lưới đánh giá đồng đẳng)**:
   - `GET /api/projects/{projectId}/sprints/{sprintId}/graph/peer-review`
   - *Phạm vi:* Đồ thị mạng lưới giữa các sinh viên trong nhóm, nhãn cạnh là số sao đánh giá chéo.

---

## 🚀 III. KẾ HOẠCH PHỐI HỢP TIẾP THEO

1. **BE xem xét và phản hồi**:
   - Khả năng cung cấp các endpoint theo DTO chuẩn trên.
   - Trạng thái thực tế của dữ liệu Node `Identity`, `Criterion` và `PullRequest` trong Neo4j.
2. **FE cam kết**:
   - Ngay khi BE chốt định dạng DTO hoặc dựng xong mock endpoint, FE sẽ tích hợp ngay vào component Cytoscape Canvas đã hoàn thiện (`src/features/graph/components/cytoscape-graph-canvas.tsx`).
   - Đảm bảo hỗ trợ đầy đủ: Highlight lân cận (Neighborhood Dimming), Đổi 4 thuật toán bố cục (`breadthfirst`, `cose`, `concentric`, `circle`), và Cảnh báo bất thường XAI nhấp nháy đỏ theo đúng chuẩn của Hội đồng.
