# Các graph cần vẽ — SAGA

SAGA = **Student Activity Graph Based Continuous Assessment** cho Project-Based Learning.

Tài liệu này chỉ mô tả **các đồ thị hoạt động** cần vẽ để đúng đề tài: ai làm gì, evidence nào, đường đi contribution ra sao. Không mô tả hạ tầng, schema, hay kho dữ liệu.

Mỗi graph vẽ **theo phạm vi hẹp**: một project, một sprint, hoặc một sinh viên. Không vẽ cả hệ thống.

---

## Ngôn ngữ đồ thị chung

Dùng chung bộ node / cạnh dưới đây cho mọi hình. Không thêm loại mới trừ khi hình đó thật sự cần.

### Node

| Node | Ý nghĩa khi vẽ |
| --- | --- |
| Student | Sinh viên trong team |
| Course | Lớp học phần |
| Team | Nhóm dự án |
| Project | dự án của team |
| Sprint | Giai đoạn làm việc |
| Task | Việc trên Jira, gắn sprint |
| Commit | Commit GitHub (bằng chứng, không phải điểm) |
| PullRequest | Pull request (bằng chứng) |
| Criterion | Một trong bốn tiêu chí: CODE, TEST, DOCUMENT, RESEARCH |
| Identity | Tài khoản GitHub hoặc Jira đã liên kết với sinh viên |

### Cạnh

| Cạnh | Từ → đến |
| --- | --- |
| ENROLLED_IN | Student → Course |
| MEMBER_OF | Student → Team (có `role`: LEADER / MEMBER) |
| OWNS | Team → Project |
| HAS_PROJECT | Course → Project |
| HAS_SPRINT | Project → Sprint |
| CONTAINS | Sprint → Task |
| ASSIGNED | Student → Task |
| CLASSIFIED_AS | Task → Criterion (chỉ khi đúng **một** nhãn `saga:code` / `saga:test` / `saga:document` / `saga:research`) |
| EVIDENCED_BY | Task → Commit hoặc PullRequest |
| AUTHORED_BY | Commit → Identity |
| MAPS_TO | Identity → Student |
| REVIEWS | Student → Student (có `stars`, gắn một sprint) |

### Quy tắc vẽ

1. Task là **nguồn điểm**. Commit / PullRequest chỉ là bằng chứng trên đường đi, không vẽ như cộng thêm điểm.
2. Task không nhãn, hoặc dính hai nhãn reserved, **không** nối `CLASSIFIED_AS`.
3. DOCUMENT / RESEARCH: chỉ nối Criterion khi Task đã có file hoặc link nộp. Thiếu evidence thì Task vẫn nằm trên graph, nhưng không vào tiêu chí.
4. Task không gắn sprint: vẽ được trên graph hoạt động, **không** dùng cho graph contribution.
5. Bốn Criterion là bốn node cố định, tái sử dụng — không tạo Criterion mới theo từng task.

---

## Graph 1 — Student Activity Graph (hình trung tâm đề tài)

**Phạm vi:** một project / một team.

**Mục đích:** cho thấy SAGA là đồ thị hoạt động sinh viên: ngữ cảnh học thuật + việc Jira + bằng chứng GitHub trên **cùng một hình**.

**Vẽ:**

- Team `OWNS` Project
- Student `MEMBER_OF` Team, `ASSIGNED` Task
- Project `HAS_SPRINT` Sprint, Sprint `CONTAINS` Task
- Task `EVIDENCED_BY` Commit / PullRequest (nếu có)

**Không vẽ trên hình này:** Criterion, peer review, identity. Để hình đọc được.

**Dùng cho:** hình chính luận văn, demo giảng viên xem một nhóm.

```text
Student --MEMBER_OF--> Team --OWNS--> Project
   |                                  |
 ASSIGNED                         HAS_SPRINT
   |                                  |
   v                                  v
  Task <--CONTAINS-- Sprint
   |
 EVIDENCED_BY
   |
   v
 Commit / PullRequest
```

---

## Graph 2 — Contribution path (một sinh viên)

**Phạm vi:** một Student trong một Project.

**Mục đích:** giải thích **đường đi ra % đóng góp** — không vẽ công thức số, chỉ vẽ path: việc nào được tính, thuộc tiêu chí nào, evidence nào đứng sau.

**Vẽ:**

- Student `ASSIGNED` Task (chỉ Task DONE + có sprint)
- Task `CLASSIFIED_AS` Criterion
- Task `EVIDENCED_BY` Commit / PullRequest nếu có

**Nhãn trên Task (ngắn):** story point, status, nhãn reserved, đã có evidence hay chưa.

**Không vẽ:** cả team, identity, peer review.

**Dùng cho:** trả lời “sinh viên này lấy điểm CODE / DOCUMENT từ đâu?”

```text
Student --ASSIGNED--> Task --CLASSIFIED_AS--> Criterion
                         |
                    EVIDENCED_BY
                         |
                         v
                   Commit / PullRequest
```

---

## Graph 3 — Sprint activity (đánh giá liên tục theo thời gian)

**Phạm vi:** một Sprint.

**Mục đích:** lát cắt continuous assessment: trong sprint này ai làm việc nào, việc vào tiêu chí nào, evidence nào mới xuất hiện.

**Vẽ:**

- Sprint `CONTAINS` Task
- Student `ASSIGNED` Task
- Task `CLASSIFIED_AS` Criterion (nếu hợp lệ)
- Task `EVIDENCED_BY` Commit / PullRequest (nếu có)

**Không vẽ:** Course, Team, Project (trừ một nhãn tiêu đề sprint/project). Không vẽ peer review trên cùng hình này.

**Dùng cho:** so sánh sprint giữa kỳ với sprint cuối; hình “đánh giá liên tục”.

```text
                Sprint
                  |
               CONTAINS
                  |
Student --ASSIGNED--> Task --CLASSIFIED_AS--> Criterion
                  |
             EVIDENCED_BY
                  |
                  v
            Commit / PullRequest
```

---

## Graph 4 — Attribution / identity (gán đúng người)

**Phạm vi:** một Student, hoặc vài commit chưa map.

**Mục đích:** chứng minh activity GitHub/Jira gắn đúng sinh viên SAGA. Đây là phần tin cậy của đề tài, không phải phần tính điểm.

**Vẽ:**

- Identity `MAPS_TO` Student
- Commit `AUTHORED_BY` Identity
- Task `EVIDENCED_BY` Commit và Student `ASSIGNED` Task (nếu đã nối được)

**Trường hợp cần có trên hình:** Commit dừng ở Identity, chưa `MAPS_TO` Student — để thấy attribution đứt, không gán bừa.

**Không vẽ:** Criterion, % đóng góp, cả team.

```text
Commit --AUTHORED_BY--> Identity --MAPS_TO--> Student
   ^                                           |
EVIDENCED_BY                                ASSIGNED
   |                                           |
   +---------------- Task <--------------------+
```

---

## Graph 5 — Peer review (hệ số đồng đội)

**Phạm vi:** một Sprint, các thành viên cùng team.

**Mục đích:** đồ thị đánh giá lẫn nhau. Cạnh có hướng, trọng số là số sao. Dùng để **giải thích hệ số P**, không mint điểm Task.

**Vẽ:**

- Chỉ node Student
- Cạnh `REVIEWS` (nhãn: số sao)

**Không vẽ:** Task, Commit, Criterion.

```text
Student A --REVIEWS (stars)--> Student B
Student B --REVIEWS (stars)--> Student A
Student C --REVIEWS (stars)--> Student A
```

---

## Thứ tự vẽ

| Ưu tiên | Graph | Việc dùng |
| --- | --- | --- |
| P0 | Graph 1 — Student Activity Graph | Hình trung tâm đề tài |
| P0 | Graph 2 — Contribution path | Giải thích scoring |
| P1 | Graph 3 — Sprint activity | Continuous assessment |
| P1 | Graph 4 — Attribution | Độ tin cậy evidence |
| P2 | Graph 5 — Peer review | Hệ số P |

Không vẽ thêm ở giai đoạn này: graph theo file/module, graph chuẩn đầu ra môn học, graph cả course hàng trăm sinh viên.

---

## Checklist trước khi chốt một hình

- [ ] Phạm vi ghi rõ: 1 project / 1 sprint / 1 student
- [ ] Mọi cạnh thuộc bảng ngôn ngữ chung
- [ ] Commit/PR không bị hiểu nhầm là điểm
- [ ] Task không đủ điều kiện contribution thì không nối Criterion
- [ ] Hình không trộn quá hai câu chuyện (ví dụ: identity + peer review trên cùng một sheet)
