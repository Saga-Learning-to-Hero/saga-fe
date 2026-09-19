# Đặc Tả Kỹ Thuật Đồ Thị SAGA (Cytoscape & Neo4j Graphs Specification)

> **Phân hệ:** Frontend & Backend Neo4j Engine  
> **Định nghĩa Đề tài:** SAGA — Student Activity Graph Based Continuous Assessment cho Project-Based Learning  
> **Mục tiêu:** Mô hình hóa hoạt động học tập của sinh viên thành đồ thị ngữ nghĩa (Semantic Graph), kết nối ngữ cảnh học thuật với dấu vết kỹ thuật (Jira & GitHub) và giải thích nguồn gốc đóng góp công sức (XAI & Traceability).

---

## I. BẢN ĐỒ NGỮ NGHĨA ĐỒ THỊ CHUNG (GRAPH SEMANTIC SCHEMA)

### 1. Đỉnh (Nodes / Vertices)
| Đỉnh (Node) | Ký hiệu | Ý nghĩa khi trực quan hóa |
| :--- | :--- | :--- |
| **`(:Student)`** | Hình tròn màu Indigo | Sinh viên trong nhóm (`studentCode`, `name`, `role`, `avatar`) |
| **`(:Course)`** | Hình chữ nhật | Lớp học phần mở trong học kỳ (`code`, `semester`) |
| **`(:Team)`** | Hình chữ nhật bo góc | Nhóm dự án sinh viên |
| **`(:Project)`** | Lục giác | Dự án thực thi của nhóm |
| **`(:Sprint)`** | Hình tròn màu lục bảo | Giai đoạn làm việc Scrum (`sprintName`, `state`, `goal`) |
| **`(:Task)`** | Hình vuông bo góc | Đầu việc nghiệp vụ trên Jira (`key`, `summary`, `status`, `storyPoints`) |
| **`(:Commit)`** | Hình tròn nhỏ màu tím | Dấu vết kỹ thuật Git Commit (bằng chứng đối soát, không phải điểm) |
| **`(:Criterion)`** | Hình thoi lớn | Một trong 4 tiêu chí đánh giá: `CODE`, `TEST`, `DOCUMENT`, `RESEARCH` |
| **`(:Identity)`** | Hình thoi nhỏ nét đứt | Tài khoản định danh GitHub/Jira liên kết với sinh viên |

### 2. Cạnh (Edges / Relationships)
| Quan hệ (Edge) | Hướng | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| **`[:ENROLLED_IN]`** | `(Student) ➔ (Course)` | Sinh viên ghi danh vào lớp học phần |
| **`[:MEMBER_OF]`** | `(Student) ➔ (Team)` | Sinh viên là thành viên nhóm (kèm `role`: `LEADER` hoặc `MEMBER`) |
| **`[:OWNS]`** | `(Team) ➔ (Project)` | Nhóm sở hữu dự án kỹ thuật |
| **`[:HAS_SPRINT]`** | `(Project) ➔ (Sprint)` | Dự án được tổ chức thành các Sprint |
| **`[:CONTAINS]`** | `(Sprint) ➔ (Task)` | Sprint chứa các Task |
| **`[:ASSIGNED_TO]`** | `(Student) ➔ (Task)` | Phân công công việc Jira cho sinh viên |
| **`[:CLASSIFIED_AS]`** | `(Task) ➔ (Criterion)` | Phân loại đầu việc vào tiêu chí đánh giá |
| **`[:EVIDENCED_BY]`** / **`[:IMPLEMENTS]`** | `(Task) ➔ (Commit)` hoặc `(Commit) ➔ (Task)` | Dấu vết mã nguồn chứng minh thực thi Task |
| **`[:AUTHORED_BY]`** | `(Commit) ➔ (Identity)` | Dấu vết tác giả commit |
| **`[:MAPS_TO]`** | `(Identity) ➔ (Student)` | Định danh tài khoản được xác minh thuộc về sinh viên |
| **`[:REVIEWS]`** | `(Student) ➔ (Student)` | Đánh giá chéo đồng đẳng (Peer Review kèm `stars`, `sprintId`) |

---

## II. 5 ĐỒ THỊ CHUYÊN BIỆT THEO PHẠM VI (5 SPECIALIZED GRAPHS)

### 1. Graph 1 — Student Activity Graph (Đồ thị Hoạt động Tổng quan Nhóm)
- **Phạm vi:** 1 Project / 1 Team.
- **Mục đích:** Bức tranh toàn cảnh kết nối Ngữ cảnh học thuật (Team, Project, Sprint) với Dấu vết kỹ thuật (Task, Commit).
- **Mô hình đường đi:**
  ```text
  Student --MEMBER_OF--> Team --OWNS--> Project
     |                                  |
   ASSIGNED_TO                      HAS_SPRINT
     |                                  |
     v                                  v
    Task <--------- CONTAINS --------- Sprint
     |
   EVIDENCED_BY
     |
     v
   Commit
  ```

### 2. Graph 2 — Contribution Path (Đồ thị Đường đi Đóng góp Cá nhân)
- **Phạm vi:** 1 Sinh viên trong 1 Dự án.
- **Mục đích:** Giải thích nguồn gốc điểm số và tỷ lệ đóng góp (Explainable AI - XAI). Chứng minh điểm lấy từ Task nào, vào Tiêu chí nào và có Commit/File minh chứng nào.
- **Mô hình đường đi:**
  ```text
  Student --ASSIGNED_TO--> Task --CLASSIFIED_AS--> Criterion
                             |
                        EVIDENCED_BY
                             |
                             v
                           Commit / Document Evidence
  ```

### 3. Graph 3 — Sprint Activity (Đồ thị Hoạt động Theo Sprint)
- **Phạm vi:** 1 Sprint cụ thể.
- **Mục đích:** Thể hiện lát cắt Continuous Assessment theo từng giai đoạn: ai làm việc gì trong Sprint, tiến độ hoàn thành và các commit phát sinh.
- **Mô hình đường đi:**
  ```text
                  Sprint
                    |
                 CONTAINS
                    |
  Student --ASSIGNED_TO--> Task --CLASSIFIED_AS--> Criterion
                    |
               EVIDENCED_BY
                    |
                    v
                  Commit
  ```

### 4. Graph 4 — Attribution & Identity Mapping (Đồ thị Kiểm định Danh tính)
- **Phạm vi:** 1 Sinh viên hoặc các Commit nghi vấn / chưa được đối soát.
- **Mục đích:** Chứng minh tính toàn vẹn và chống gian lận gán bừa commit Git. Các commit chỉ được tính điểm khi liên kết với Identity đã `MAPS_TO` sinh viên.
- **Mô hình đường đi:**
  ```text
  Commit --AUTHORED_BY--> Identity --MAPS_TO--> Student
     ^                                            |
  EVIDENCED_BY                               ASSIGNED_TO
     |                                            |
     +----------------- Task <--------------------+
  ```

### 5. Graph 5 — Peer Review (Đồ thị Mạng Lưới Đánh Giá Đồng Đẳng)
- **Phạm vi:** Các thành viên trong cùng nhóm theo từng Sprint.
- **Mục đích:** Giải thích hệ số đồng đẳng $P$ trong công thức Slicing Pie. Đồ thị có hướng với trọng số là số sao đánh giá.
- **Mô hình đường đi:**
  ```text
  Student A --REVIEWS (stars, sprintId)--> Student B
  Student B --REVIEWS (stars, sprintId)--> Student A
  Student C --REVIEWS (stars, sprintId)--> Student A
  ```

---

## III. NGUYÊN TẮC HỌC THUẬT & TRỰC QUAN HÓA (ACADEMIC RULES)
1. **Task là nguồn đóng góp, Commit là bằng chứng đối soát**: Tuyệt đối không cộng điểm trực tiếp từ số lượng commit để chống gian lận spam commit rác.
2. **Xử lý Anomaly MSR**: Task có trạng thái `DONE` nhưng 0 Commit liên kết và 0 File tài liệu minh chứng sẽ bị gắn cờ cảnh báo đỏ `MSR Anomaly Alert`.
3. **Bố cục Canvas Cytoscape**: Canvas trực quan hóa ở chế độ Full Scope áp dụng mô hình Multi-Column DAG phân tầng rõ ràng từ trái sang phải: `Project` ➔ `Sprint` ➔ `Student` ➔ `Task` ➔ `Criterion` ➔ `Commit` ➔ `Identity` với thuật toán chống đè tọa độ Y.
