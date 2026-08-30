---
trigger: always_on
description: Cytoscape.js & Neo4j graph visualization standards, Traceability Graph semantics, and Social Network Analysis (SNA) metrics for SAGA Frontend.
---

# Quy Chuẩn Đồ Thị Neo4j & Trực Quan Hóa Mạng Lưới (Graph & Neo4j Standards)

## 1. Bản Đồ Ngữ Nghĩa Đồ Thị (Graph Semantic Schema)

Hệ thống SAGA sử dụng cơ sở dữ liệu đồ thị **Neo4j AuraDB** kết hợp thư viện **Cytoscape.js** trên Frontend để mô hình hóa và trực quan hóa toàn bộ mối quan hệ công sức:

### 🔵 Đỉnh (Nodes / Vertices)
- **`(:Student)`**: Chủ thể thực thi (Actor) — Chứa `name`, `studentCode`, `role`, `avatar`, `commitsCount`, `tasksCount`.
- **`(:JiraTask)`**: Đầu việc nghiệp vụ (Work Artifact) — Chứa `key` (ví dụ `SAGA-15`), `summary`, `status` (`TODO`, `IN_PROGRESS`, `DONE`), `storyPoints`, `weightType` (`CODE`, `TEST`, `DOC`, `RESEARCH`).
- **`(:Commit)`**: Dấu vết kỹ thuật (Technical Artifact) — Chứa `hash`, `shortHash`, `message`, `branch`, `additions`, `deletions`, `isVerified`.

### 🔗 Cạnh (Edges / Relationships)
- **`[:AUTHORED]`**: Sinh viên tạo Commit mã nguồn (Nét đứt xanh dương `(Student) ➔ (Commit)`).
- **`[:ASSIGNED_TO]`**: Sinh viên được phân công Task Jira (Mũi tên xanh lá `(Student) ➔ (JiraTask)`).
- **`[:IMPLEMENTS]`**: Commit thực thi Task qua Biểu thức chính quy `SAGA-xx` (Mũi tên tím nổi bật `(Commit) ➔ (JiraTask)`).
- **`[:REVIEWED]`**: Đánh giá Pull Request giữa các thành viên (Độ dày mũi tên phản ánh trọng số số lượng review).
- **`[:COMMENTED_ON]`**: Thảo luận trên Jira Issue hoặc PR.

---

## 2. Quy Chuẩn Trực Quan Hóa & Hiệu Ứng (Cytoscape Canvas UX)

### ✨ A. Hiệu ứng Cô Lập Mạng Lưới (Neighborhood Dimming & Highlighting)
Khi rê chuột (`mouseover`) vào bất kỳ Đỉnh nào:
- Toàn bộ các đỉnh và cạnh KHÔNG liên quan trực tiếp phải tự động chuyển sang trạng thái mờ (`class .faded` với `opacity: 0.15`).
- Đỉnh đang chọn và các đỉnh lân cận liên kết (`neighborhood`) phải sáng rõ và viền đậm (`class .highlighted`).
- Giúp người xem lập tức nhìn thấy đường đi minh chứng công sức:
  $$\text{(:Student)} \xrightarrow{\text{[:ASSIGNED\_TO]}} \text{(:JiraTask)} \xleftarrow{\text{[:IMPLEMENTS]}} \text{(:Commit)}$$

### 📐 B. 4 Thuật Toán Bố Cục Bắt Buộc (Layouts)
Canvas đồ thị phải hỗ trợ chuyển đổi linh hoạt 4 thuật toán bố cục:
1. **Phân cấp Trực giao (`breadthfirst`)**: Bố cục cây phân cấp từ Sinh viên ➔ Task ➔ Commit (Mặc định).
2. **Lực đàn hồi (`cose`)**: Bố cục lực vật lý mô phỏng cụm tương tác tự nhiên.
3. **Đồng tâm (`concentric`)**: Bố cục vòng tròn đồng tâm phân tầng theo mức độ ưu tiên.
4. **Vòng tròn (`circle`)**: Sắp xếp toàn bộ đỉnh theo vòng tròn mở.

---

## 3. Thuật Toán Nhận Diện Bất Thường (XAI Anomaly Detection)

### 🚨 A. Bất thường MSR Anomaly (Mining Software Repositories)
- **Định nghĩa**: Một Task Jira được đánh dấu trạng thái `DONE`, nhưng đồ thị Neo4j ghi nhận **0 commits linked** (không có bất kỳ cạnh `[:IMPLEMENTS]` nào nối về).
- **Trực quan hóa**: Node Task tự động đổi màu đỏ cam, viền đỏ nhấp nháy (`animate-pulse`) và gắn cờ cảnh báo nghi vấn báo cáo khống để Giảng viên đối soát.

### 🚨 B. Cảnh báo Cô lập Ghosting (Social Network Analysis)
- **Định nghĩa**: Một thành viên có số lượt review PR và bình luận trao đổi bằng 0 trong Sprint, dẫn đến **Hệ số Trung tâm Bậc (Degree Centrality)** $\approx 0$.
- **Trực quan hóa**: Gắn nhãn `Ghosting Anomaly Alert` và cảnh báo Giảng viên can thiệp kịp thời.

### 👑 C. Nhận diện Key Contributor (Đóng góp Cốt lõi)
- Thành viên có Degree Centrality cao vượt trội ($> 85\%$) và có lượt review PR cho hầu hết thành viên khác.

---

## 4. Bảng Ma Trận Đối Soát Nguồn Gốc (Traceability Matrix Table)
Bên dưới mỗi Đồ thị Traceability **BẮT BUỘC** phải có bảng ma trận đối soát dạng bảng (Tabular Audit Trail) liệt kê chi tiết từng Task, Người làm, Trọng số, Commit đối soát, Biến động dòng code $+ / -$ và Trạng thái kiểm định XAI.
