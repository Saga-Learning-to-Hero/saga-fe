# SAGA-37 — Audit và hướng dẫn điều chỉnh UI/UX các trang giảng viên

> Tài liệu tạm phục vụ triển khai UI. Nội dung được đối chiếu với source hiện tại ngày 03/09/2026. Phạm vi chỉ hướng dẫn thay đổi, chưa yêu cầu kết nối API thật.

## 1. Phạm vi đã audit

Các route và module liên quan:

- Bảng điểm lớp: `/lecturer/courses/[courseId]/grades`
  - `src/features/lecturer/final-grades/components/lecturer-final-grades-page.tsx`
  - `src/features/lecturer/final-grades/components/gradebook-table.tsx`
  - `src/features/lecturer/final-grades/data/mock-final-grades.ts`
- Cấu hình trọng số: `/lecturer/courses/[courseId]/settings/weights`
  - `src/features/lecturer/course-weight-config/components/course-weight-config-page.tsx`
  - `src/features/lecturer/course-weight-config/components/class-default-weight-card.tsx`
  - `src/features/lecturer/course-weight-config/components/team-weight-list.tsx`
  - `src/features/lecturer/course-weight-config/components/team-weight-dialog.tsx`
- Hoạt động dự án nhóm: `/lecturer/courses/[courseId]/teams/[teamId]`
  - `src/features/lecturer/team-project-activity/components/project/team-project-page.tsx`
  - `src/features/lecturer/team-project-activity/components/project/project-tabs.tsx`
  - `src/features/lecturer/team-project-activity/components/project/overview-tab.tsx`
  - `src/features/lecturer/team-project-activity/components/project/analytics-tab.tsx`
  - `src/features/lecturer/team-project-activity/components/project/github-commits-tab.tsx`
  - `src/features/lecturer/team-project-activity/components/project/jira-kanban-tab.tsx`

## 2. Kết luận audit nhanh

| Khu vực | Hiện trạng | Vấn đề chính | Mức ưu tiên |
| --- | --- | --- | --- |
| Bảng điểm | Một bảng phẳng theo sinh viên, có cột Nhóm | Không hỗ trợ luồng chấm/xem theo từng team | Cao |
| Cấu hình trọng số | Chọn một trong hai mode Toàn lớp/Từng team | Che mất cấu hình lớp khi chọn team và tạo hai mô hình loại trừ không cần thiết | Cao |
| Dự án nhóm | Đồ thị nằm trong Tổng quan và tab Phân tích đứng cuối | Insight quan trọng chưa nằm ở vị trí ưu tiên, phải thao tác hoặc cuộn mới thấy | Cao |
| Bộ lọc | Nhiều nơi dùng trực tiếp shadcn `Select` | Chưa thống nhất với quy chuẩn `CustomSelect` của dự án | Trung bình |
| Thuật ngữ | Trộn “team”, “nhóm”, một số tiêu đề tiếng Anh | Chưa đảm bảo 100% tiếng Việt và khó nhất quán | Trung bình |

---

## 3. Thay đổi trang Bảng điểm: chia theo nhóm

### 3.1. Vấn đề hiện tại

`GradebookTable` đang render trực tiếp `gradebook.students.map(...)`. Cột “Nhóm” chỉ lặp lại tên nhóm ở từng dòng, vì vậy:

- Giảng viên khó nhìn mặt bằng điểm của một nhóm.
- Không thấy nhanh số thành viên, điểm trung bình nhóm, số sinh viên thiếu điểm hoặc dưới chuẩn.
- Sinh viên chưa có nhóm lẫn vào danh sách chung.
- Khi lớp đông, việc tìm và chấm theo team tốn nhiều thao tác lọc.

### 3.2. Kiến trúc UI đề xuất

Giữ các thẻ tổng quan toàn lớp ở trên cùng, sau đó chuyển phần bảng điểm thành hai chế độ xem:

1. **Theo nhóm** — mặc định.
2. **Tất cả sinh viên** — phục vụ tìm kiếm toàn lớp và xuất dữ liệu.

Không dùng select cho hai chế độ này. Dùng segmented control hoặc Tabs vì đây là chuyển đổi cách trình bày cùng một tập dữ liệu.

```text
[Theo nhóm] [Tất cả sinh viên]

Tìm sinh viên hoặc nhóm...   Trạng thái ▾   [Xuất file]
```

### 3.3. Chế độ “Theo nhóm”

Mỗi nhóm là một `Card` hoặc `Accordion` độc lập:

```text
Nhóm 01 · 4 thành viên                         Điểm TB 7.82
Đồ án: Library Management System              1 sinh viên thiếu điểm
Trưởng nhóm: Đinh Công Tú                      [Mở rộng]

Sinh viên        Quá trình  Sprint  Đồ án  Đóng góp  Bảo vệ  Tổng kết
Đinh Công Tú        8.0       8.5     8.2      9.0      8.0      8.31
Trần Thị B          7.0       7.5     8.2       —       7.5        —
```

Header của card nhóm cần có:

- Tên nhóm và tên dự án.
- Trưởng nhóm.
- Số thành viên.
- Điểm trung bình nhóm.
- Số sinh viên hoàn chỉnh, thiếu điểm, dưới chuẩn.
- Badge cảnh báo khi có điểm thiếu hoặc sinh viên dưới chuẩn.
- Nút mở/thu gọn có `aria-expanded`.

Quy tắc mặc định:

- Tự mở nhóm có sinh viên thiếu điểm hoặc dưới chuẩn.
- Các nhóm không có vấn đề có thể thu gọn.
- Giữ trạng thái mở/đóng trong component state khi tìm kiếm hoặc đổi bộ lọc.
- Không làm một bảng lớn rồi dùng `rowSpan`; card/accordion rõ ngữ cảnh nhóm hơn và responsive tốt hơn.

### 3.4. Khu vực “Chưa có nhóm”

Sinh viên có `groupId === null` phải được gom thành một section cuối danh sách:

```text
Chưa có nhóm · 1 sinh viên
[Badge: Cần xử lý]
```

Section này dùng border nét đứt và semantic warning, nhưng không chỉ dựa vào màu. Cần có icon và dòng giải thích “Sinh viên chưa được xếp nhóm nên chưa có điểm đồ án nhóm”.

### 3.5. Bộ lọc và thao tác

Thanh công cụ nên sticky bên dưới tiêu đề section khi cuộn:

- Tìm theo họ tên, MSSV hoặc tên nhóm.
- `CustomSelect` lọc nhóm.
- `CustomSelect` lọc trạng thái: Tất cả, Hoàn chỉnh, Thiếu điểm, Dưới chuẩn, Đã chỉnh sửa, Đã khóa.
- Toggle “Chỉ hiển thị nhóm cần chú ý”.
- Nút “Mở tất cả”/“Thu gọn tất cả”.

### 3.6. Xử lý dữ liệu phía UI

Tạo selector hoặc utility thay vì group trực tiếp trong JSX:

```ts
type GradeGroup = {
  groupId: string | null;
  groupName: string;
  students: StudentFinalGrade[];
  averageScore: number | null;
  incompleteCount: number;
  failedCount: number;
};
```

Các giá trị tổng hợp phải suy ra từ `gradebook.students`, không tạo thêm mock độc lập dễ lệch dữ liệu.

### 3.7. Responsive

- Desktop: card nhóm + bảng điểm đầy đủ; cột Sinh viên sticky.
- Tablet: giữ cuộn ngang trong từng card, không cuộn toàn trang theo chiều ngang.
- Mobile: header nhóm thành hai hàng; bảng chuyển thành danh sách card sinh viên hoặc chỉ giữ các cột cốt lõi và mở drawer để xem chi tiết.
- Thanh hành động Công bố/Lưu nháp không được biến mất hoàn toàn trên mobile; đưa vào menu hành động hoặc sticky footer.

### 3.8. Tiêu chí nghiệm thu

- Mặc định nhìn thấy danh sách được chia theo nhóm.
- Mỗi sinh viên chỉ xuất hiện đúng một nơi.
- Có section riêng cho sinh viên chưa có nhóm.
- Số liệu nhóm được tính từ danh sách sinh viên hiện có.
- Có thể tìm kiếm và lọc mà không làm mất cấu trúc nhóm.
- Badge cảnh báo và trạng thái dùng tiếng Việt, có icon/text đầy đủ.

---

## 4. Thay đổi trang Cấu hình trọng số: bỏ hai mode loại trừ

### 4.1. Vấn đề hiện tại

`CourseWeightConfigPage` đang có `RadioGroup` với hai lựa chọn:

- `CLASS_WIDE`
- `PER_TEAM`

Sau đó UI render có điều kiện: chọn Toàn lớp thì chỉ thấy `ClassDefaultWeightCard`, chọn Từng team thì chỉ thấy `TeamWeightList`. Cách này gây ra các vấn đề:

- Người dùng phải chọn “mode” trước khi hiểu cấu hình hiện có.
- Khi vào danh sách team, cấu hình lớp nền bị ẩn nên khó đối chiếu.
- Chuyển mode có thể xóa toàn bộ `teamWeights`, đây là thao tác rủi ro quá lớn cho một lựa chọn giao diện.
- Logic thực tế phù hợp hơn với mô hình kế thừa: lớp có cấu hình mặc định, một số team có thể override.

### 4.2. Mô hình UX mới

Bỏ hoàn toàn section “Chế độ áp dụng” và không dùng Radio/Select toàn cục.

Trang luôn có hai section theo chiều dọc:

```text
1. Cấu hình mặc định của lớp
   CODE / TEST / DOCUMENT / RESEARCH = 100%

2. Cấu hình riêng cho từng nhóm
   Nhóm nào không tùy chỉnh sẽ tự động dùng cấu hình lớp
```

Luồng đọc tự nhiên:

1. Giảng viên cấu hình trọng số chung ở trên.
2. Cuộn xuống xem danh sách nhóm.
3. Chỉ bật cấu hình riêng cho nhóm có project khác biệt.

### 4.3. Section “Cấu hình mặc định của lớp”

Luôn render `ClassDefaultWeightCard`, không phụ thuộc mode.

Nội dung cần sửa:

- Tiêu đề: “Cấu hình mặc định của lớp”.
- Mô tả: “Tất cả nhóm sẽ sử dụng cấu hình này nếu chưa có cấu hình riêng.”
- Hiển thị badge “Đang áp dụng cho X/Y nhóm”.
- Tổng trọng số phải luôn bằng 100%.
- Nút “Khôi phục mặc định” không nên bị disable chỉ vì trang chưa dirty; chỉ disable khi giá trị hiện tại đã đúng bằng preset mặc định.

Sau card nên có một dải giải thích nhỏ:

> Các thay đổi ở cấu hình lớp cũng cập nhật nhóm đang kế thừa. Nhóm có cấu hình riêng không bị thay đổi.

### 4.4. Section “Cấu hình riêng cho từng nhóm”

Luôn hiển thị ngay dưới cấu hình lớp. Mỗi `TeamWeightCard` có một trong hai trạng thái rõ ràng:

**Đang dùng cấu hình lớp**

- Badge: “Kế thừa từ lớp”.
- Preview bốn trọng số lấy trực tiếp từ `classWeights`.
- Nút chính: “Tạo cấu hình riêng”.

**Đang dùng cấu hình riêng**

- Badge: “Cấu hình riêng”.
- Preview bốn trọng số override.
- Dòng “Khác cấu hình lớp ở N tiêu chí”.
- Nút: “Chỉnh sửa”.
- Nút phụ: “Dùng lại cấu hình lớp”.

Không cần switch cho cả trang. Nếu dùng switch trong từng team, nhãn phải là hành động rõ nghĩa và thao tác tắt override phải có xác nhận khi dữ liệu đã thay đổi.

### 4.5. Thay đổi state và type

Mô hình đề xuất:

```ts
type CourseWeightConfiguration = {
  courseId: string;
  classWeights: ContributionWeights;
  teamOverrides: Record<string, TeamWeightConfiguration>;
  updatedAt: string;
  updatedBy: string;
};
```

`applicationMode` không còn cần thiết. Nếu backend hoặc mock cũ vẫn dùng field này, tạo bước migration khi đọc localStorage rồi loại dần khỏi UI state.

Quy tắc lấy trọng số hiệu lực:

```ts
effectiveWeights(teamId) = teamOverrides[teamId]?.weights ?? classWeights;
```

Quy tắc thao tác:

- “Tạo cấu hình riêng”: copy `classWeights` hiện tại vào override của team rồi mở dialog chỉnh sửa.
- “Dùng lại cấu hình lớp”: xóa duy nhất `teamOverrides[teamId]`, không ảnh hưởng team khác.
- Thay đổi `classWeights`: cập nhật ngay preview của các team đang kế thừa.
- Không tự động ghi đè các team đã có override.

### 4.6. Validation và lưu

- Cấu hình lớp bắt buộc tổng bằng 100%.
- Mỗi override tồn tại cũng bắt buộc tổng bằng 100%.
- Team không có override luôn hợp lệ vì kế thừa cấu hình lớp.
- Nút Lưu bị disable nếu không có thay đổi hoặc có bất kỳ cấu hình không hợp lệ.
- Khi có lỗi, hiển thị summary ở gần nút Lưu và cuộn/focus đến card lỗi đầu tiên.
- Không dùng confirm “chuyển mode” nữa.
- Chỉ dùng confirm khi xóa một override đã chỉnh sửa.

### 4.7. Dialog chỉnh trọng số team

Trong `TeamWeightDialog`, luôn hiển thị hai cột hoặc hai vùng so sánh:

- Cấu hình lớp hiện tại.
- Cấu hình riêng đang chỉnh.

Có nút “Sao chép lại từ cấu hình lớp”. Modal phải có header/footer cố định, body cuộn độc lập và `max-h-[92vh]` theo design system.

### 4.8. Bộ lọc danh sách team

- Dùng `CustomSelect`, không dùng trực tiếp shadcn `Select`.
- Lọc: Tất cả, Kế thừa từ lớp, Có cấu hình riêng, Cấu hình không hợp lệ.
- Tìm theo tên nhóm hoặc tên dự án.
- Hiển thị summary: “2 nhóm cấu hình riêng · 6 nhóm kế thừa”.

### 4.9. Tiêu chí nghiệm thu

- Không còn control chọn mode Toàn lớp/Từng team.
- Cấu hình lớp luôn nằm trên và luôn nhìn thấy.
- Danh sách team luôn nằm dưới.
- Một team không override phải dùng đúng giá trị lớp.
- Có thể thêm/xóa override cho riêng một team mà không ảnh hưởng team khác.
- Không còn hành vi xóa toàn bộ cấu hình team do chuyển mode.
- Mọi cấu hình được lưu đều có tổng trọng số 100%.

---

## 5. Thay đổi trang Dự án nhóm: ưu tiên đồ thị và insight

### 5.1. Vấn đề hiện tại

Source hiện có các chart tốt (`SprintBurndownChart`, `WorkDistributionChart`, `CumulativeFlowChart`, `VelocityChart`, `CommitIssueChart`, `CycleTimeChart`, `MemberContributionChart`) nhưng thứ tự thông tin chưa nhấn mạnh phân tích:

- `ProjectTabs` đang xếp: Tổng quan → Commit GitHub → Jira Kanban → Phân tích.
- Tab Phân tích quan trọng nhất lại đứng cuối.
- Tổng quan hiển thị sáu KPI trước đồ thị; trên laptop thấp, chart có thể nằm dưới fold.
- Tab GitHub mở đầu bằng sáu statistic card rồi tới bộ lọc và bảng commit, chưa có biểu đồ xu hướng ở vùng đầu.
- Tab Kanban mở thẳng toolbar và board, thiếu snapshot trực quan về sức khỏe sprint.

### 5.2. Thứ tự điều hướng đề xuất

Đổi các tab nhỏ thành:

1. **Phân tích tiến độ** — tab mặc định.
2. **Tổng quan dự án**.
3. **GitHub Commit**.
4. **Jira Kanban**.

Hoặc gộp “Tổng quan” và “Phân tích” thành một tab đầu tiên tên **Tổng quan & Phân tích** nếu muốn giảm số tab. Phương án gộp phù hợp hơn vì tránh lặp KPI và giúp đồ thị xuất hiện ngay khi chọn team.

Query mặc định nên là `tab=analytics` hoặc route không query render tab phân tích. Reload phải giữ đúng tab qua URL.

### 5.3. Above-the-fold của trang dự án

Giữ `ProjectHeader` ở dạng compact như hiện tại, nhưng ngay sau header và tab phải là:

```text
[Bộ lọc Sprint] [Khoảng thời gian] [Thành viên] [Nguồn dữ liệu]

[Tiến độ 68%] [3 việc trễ hạn] [1 thành viên ít hoạt động] [7 ngày còn lại]

[Sprint Burndown — rộng 2/3] [Cảnh báo/Insight — rộng 1/3]
```

Biểu đồ chính phải xuất hiện trong viewport đầu ở độ phân giải laptop 1366×768. Không đặt activity feed hoặc bảng dữ liệu dài trước chart.

### 5.4. Thứ bậc đồ thị

#### Nhóm 1 — Quyết định nhanh, đặt trên cùng

- Sprint Burndown.
- Cumulative Flow hoặc phân bổ trạng thái công việc.
- Insight “Cần chú ý” dựa trên mock data.

#### Nhóm 2 — Phân tích xu hướng, đặt ngay sau

- Velocity theo sprint.
- Commit và Jira Issue theo thời gian.
- Cycle Time.

#### Nhóm 3 — Phân tích con người, đặt cuối phần chart nhưng trước bảng chi tiết

- Phân bổ đóng góp thành viên.
- Workload Matrix.

Sau toàn bộ chart mới tới activity feed, commit table hoặc dữ liệu chi tiết liên quan.

### 5.5. Cải tổ KPI

Không để sáu card ngang nhau chiếm toàn bộ chiều cao đầu trang. Thay bằng một `MetricStrip` compact:

- 4 chỉ số quan trọng nhất hiển thị trực tiếp.
- Chỉ số phụ nằm trong tooltip/drawer “Xem thêm”.
- Giá trị dùng `font-mono`.
- Mỗi chỉ số ghi rõ phạm vi: “Sprint hiện tại”, “7 ngày gần nhất”.
- Không dùng tăng/giảm phần trăm nếu mock data không có cơ sở so sánh.

### 5.6. Tab GitHub Commit

Thứ tự mới:

1. Hai chart compact ở đầu:
   - Commit theo ngày.
   - Đóng góp theo thành viên.
2. Metric strip: tổng commit, PR mở, PR merge, additions/deletions.
3. Bộ lọc.
4. Bảng commit.

Chart phải dùng cùng dữ liệu `MOCK_COMMITS` với bảng, không hardcode số 128 nếu danh sách chỉ có số lượng khác. Dữ liệu hiển thị và số liệu tổng phải có một nguồn duy nhất.

### 5.7. Tab Jira Kanban

Không nên đẩy Kanban quá sâu. Phía trên board chỉ thêm một hàng insight compact:

- Mini burndown hoặc progress bar sprint.
- Tỷ lệ hoàn thành.
- Số issue blocked.
- Số issue quá hạn.

Sau đó hiển thị toolbar và Kanban ngay. Trên màn hình thấp, insight strip có thể collapse để ưu tiên chiều cao board.

`isOverdue` không được so sánh với ngày hardcode. Khi triển khai logic thật, dùng thời điểm hiện tại hoặc một `mockNow` dùng chung trong data fixture để kết quả test ổn định.

### 5.8. Bố cục chart card chuẩn

Mỗi chart card cần có:

- Tiêu đề tiếng Việt.
- Một câu mô tả mục đích.
- Khoảng dữ liệu hoặc sprint đang áp dụng.
- Tooltip giải nghĩa trục và đơn vị.
- Legend không che vùng vẽ.
- Trạng thái loading, empty, error và chưa kết nối nguồn.
- Nút “Xem chi tiết” nếu chart có drill-down.
- Bảng dữ liệu thay thế hoặc mô tả ngắn cho accessibility.

Không hardcode màu HEX mới trong component. Chuyển màu chart sang token dùng chung hoặc map semantic theo design system.

### 5.9. Responsive

- Desktop: chart chính 2/3 + insight 1/3; chart phụ lưới hai cột.
- Tablet: chart chính full width; insight chuyển thành hàng card.
- Mobile: một cột, chart cao tối thiểu 240px; tab cuộn ngang.
- Không đặt chart trong container thiếu chiều cao vì `ResponsiveContainer` sẽ render sai.
- Kanban tiếp tục cuộn ngang độc lập; không làm toàn trang tràn ngang.

### 5.10. Tiêu chí nghiệm thu

- Khi mở một team, chart/insight xuất hiện trước bảng hoặc feed dài.
- Tab phân tích là tab đầu tiên hoặc được gộp vào tab Tổng quan mặc định.
- Burndown nằm trong viewport đầu trên laptop phổ biến.
- GitHub có chart xu hướng trước bảng commit.
- Jira có sprint health compact trước Kanban nhưng board vẫn nhìn thấy sớm.
- KPI và chart được tính từ cùng nguồn mock data.
- Có trạng thái riêng khi GitHub/Jira chưa kết nối.
- Reload giữ nguyên `courseId`, `teamId` và tab.

---

## 6. Điều chỉnh dùng chung cho UI giảng viên

### 6.1. Chuẩn hóa thuật ngữ

Ưu tiên “nhóm” trên giao diện tiếng Việt. Chỉ giữ “Team” khi đó là tên riêng hoặc thuật ngữ bắt buộc. Ví dụ:

- “Từng Team” → “Cấu hình riêng theo nhóm”.
- “Danh sách team” → “Danh sách nhóm”.
- “Contributor” → “Người đóng góp”.
- “Priority” trong tooltip → “Độ ưu tiên”.
- “Workload Matrix” → “Ma trận khối lượng công việc”.

### 6.2. Chuẩn hóa select

Các bộ lọc trong `team-weight-list.tsx`, `analytics-tab.tsx`, `github-commits-tab.tsx` và `jira-kanban-tab.tsx` nên chuyển sang `src/components/common/custom-select.tsx` theo rule của dự án.

Tabs/segmented controls không chuyển thành select vì chúng đại diện cho navigation hoặc view mode, không phải chọn một giá trị form.

### 6.3. Tránh số liệu mock mâu thuẫn

Hiện có một số KPI hardcode trong khi bảng dùng mảng mock. Khi thay đổi UI:

- Tính tổng commit từ `MOCK_COMMITS`.
- Tính số issue theo trạng thái từ `MOCK_JIRA_ISSUES`.
- Tính blocked/overdue/done từ cùng danh sách issue.
- Tính thống kê nhóm từ danh sách điểm/sinh viên.
- Đặt `MOCK_NOW` tập trung nếu cần mô phỏng ngày hiện tại.

### 6.4. Trạng thái bắt buộc

Mỗi trang cần kiểm tra tối thiểu:

- Loading/skeleton.
- Không có dữ liệu.
- Không tìm thấy kết quả sau lọc.
- Lỗi dữ liệu.
- Chưa kết nối GitHub/Jira.
- Thay đổi chưa lưu.
- Mobile và màn hình chiều cao thấp.

---

## 7. Audit vòng 2 sau các thay đổi UI hiện tại

### 7.1. Kết luận

Các thay đổi hiện tại đã đi đúng hướng và đáp ứng phần lớn yêu cầu nghiệp vụ ban đầu:

| Hạng mục | Trạng thái hiện tại | Kết luận |
| --- | --- | --- |
| Bảng điểm chia nhóm | Đã có `GROUPED/ALL`, `GradeGroupCard`, section chưa có nhóm và bộ lọc | Hợp lý, cần hoàn thiện accessibility và dữ liệu mô tả nhóm |
| Cấu hình lớp + override nhóm | Đã bỏ `applicationMode`, luôn hiện cấu hình lớp và danh sách nhóm | Đúng mô hình, cần hoàn thiện xác nhận xóa override và migration |
| Ưu tiên đồ thị | Đã gộp Tổng quan & Phân tích thành tab đầu | Đúng hướng nhưng chart vẫn chưa chắc xuất hiện trong viewport đầu |
| Quy chuẩn dự án | Một số phần đã dùng `CustomSelect` và tiếng Việt | Chưa đạt hoàn toàn rules, cần xử lý các vi phạm ở mục 9 |

### 7.2. Bảng điểm — phần đã hợp lý

- Mặc định `viewMode = "GROUPED"` phù hợp luồng làm việc của giảng viên.
- `groupedData` và `filteredStudents` đã được `useMemo`, phù hợp performance rule.
- Nhóm có sinh viên thiếu điểm/dưới chuẩn tự mở.
- Sinh viên chưa có nhóm nằm trong một card cảnh báo riêng.
- Bộ lọc trạng thái đã dùng `CustomSelect`.
- `StatusBadge` được tách thành component dùng chung giữa hai kiểu bảng.

### 7.3. Bảng điểm — phần còn cần chỉnh

1. Header của `GradeGroupCard` đang dùng `<div onClick>`. Đổi thành `<button type="button">` hoặc đặt một button phủ đúng vùng tương tác để hỗ trợ Enter/Space, focus ring và screen reader.
2. `projectName` hiện mặc định là “Đồ án chung” và `leaderName` chưa được truyền từ dữ liệu thật. Không hiển thị dữ liệu giả có vẻ chính xác. Cần map metadata nhóm từ cùng mock repository hoặc ẩn dòng này khi chưa có dữ liệu.
3. Điểm trung bình nhóm đang được tính sau khi lọc sinh viên. Cần quyết định rõ:
   - Header luôn hiển thị thống kê toàn nhóm; hoặc
   - Ghi “Điểm TB của kết quả đang lọc”.
   Khuyến nghị giữ thống kê toàn nhóm để không thay đổi bất ngờ khi tìm kiếm.
4. Nút Xuất file và Lưu nháp vẫn bị ẩn bằng `hidden sm:flex`. Trên mobile, đưa vào menu “Thao tác” thay vì làm mất chức năng.
5. Thêm “Mở tất cả/Thu gọn tất cả” nếu số nhóm lớn. Khi đó trạng thái expanded nên được quản lý từ parent thay vì mỗi card tự giữ hoàn toàn độc lập.
6. Header nhóm cần hiển thị trọng số ở subheader hoặc tooltip của tên cột giống bảng toàn lớp, tránh mất thông tin `%` khi chuyển sang chế độ nhóm.

### 7.4. Cấu hình trọng số — phần đã hợp lý

- Global RadioGroup Toàn lớp/Từng team đã được loại bỏ.
- `classWeights` luôn xuất hiện ở section đầu.
- `teamOverrides` luôn xuất hiện phía dưới và team không override kế thừa cấu hình lớp.
- Xóa override chỉ tác động một team.
- Dialog team nhận cả `classWeights` và trọng số riêng để đối chiếu.
- Validation không còn bắt mọi team phải tạo cấu hình riêng.

### 7.5. Cấu hình trọng số — phần còn cần chỉnh

1. `handleRemoveTeamOverride` đang xóa ngay. Phải có AlertDialog khi override đã tồn tại, với nội dung nêu rõ team sẽ quay lại dùng cấu hình lớp.
2. Migration localStorage hiện mới đổi tên field. Cần kiểm tra schema và fallback nếu thiếu `classWeights`, `teamOverrides` hoặc dữ liệu cũ sai kiểu; không cast JSON chưa kiểm chứng thành config hợp lệ.
3. Dialog team vẫn có RadioGroup “Tự định nghĩa/Chọn mẫu”. Đây không phải application mode, nhưng vẫn tạo cảm giác phải chọn một trong hai cách. Nên đơn giản hóa:
   - Editor luôn hiển thị.
   - Các preset là nhóm nút “Áp dụng nhanh” phía trên editor.
   - Chọn preset chỉ điền giá trị, sau đó người dùng vẫn chỉnh trực tiếp.
4. Đổi “Project:” thành “Dự án:” để đạt quy tắc 100% tiếng Việt.
5. “Lỗi tổng != 100%” đổi thành “Tổng trọng số chưa bằng 100%”.
6. Khi class weights thay đổi, card nhóm kế thừa phải cập nhật preview ngay; nhóm override giữ nguyên. Cần test boundary tổng bằng 100% và trường hợp không có override.

---

## 8. Đề xuất làm mới trang Hoạt động nhóm và ưu tiên đồ thị

### 8.1. Đánh giá ý tưởng thu nhỏ hoặc ẩn header

Ý tưởng này hợp lý và nên thực hiện. Vấn đề lớn nhất hiện tại không nằm ở chất lượng từng chart mà ở tổng chiều cao trước chart:

```text
Top Header hai tầng
→ Hero header “Hoạt động dự án của nhóm”
→ Tab lớn Danh sách lớp/Dự án nhóm
→ ProjectHeader
→ Tab nhỏ dự án
→ Bộ lọc
→ 4 KPI
→ Chart đầu tiên
```

Trên laptop 1366×768, chuỗi trên có thể khiến biểu đồ Burndown nằm hoàn toàn dưới fold. Người dùng mở dự án nhưng trước tiên chỉ thấy navigation và card số liệu, làm trải nghiệm chưa “wow”.

### 8.2. Phương án khuyến nghị: Adaptive Compact Header theo route

Không nên ẩn header tùy ý bằng JavaScript scroll ngay từ đầu. Nên thay đổi layout theo ngữ cảnh route vì ổn định, dễ hiểu và ít gây layout shift hơn.

#### Khi ở `/lecturer/courses/[courseId]/teams`

Giữ hero header đầy đủ vì đây là trang quản lý danh sách lớp:

- Breadcrumb.
- Tiêu đề “Hoạt động dự án của nhóm”.
- Mô tả.
- Mã lớp và thời điểm cập nhật.
- Hai tab lớn luôn hiển thị: “Danh sách lớp” và “Dự án nhóm”.

#### Khi ở `/lecturer/courses/[courseId]/teams/select`

Dùng header compact khoảng 56–64px:

- Nút quay lại danh sách lớp.
- Tiêu đề “Chọn dự án nhóm”.
- Không lặp lại mô tả dài và breadcrumb ba tầng.

#### Khi ở `/lecturer/courses/[courseId]/teams/[teamId]`

Ẩn hero header lớn của `LecturerTeamsLayout`. Thay bằng một context bar sticky cao khoảng 56–64px:

```text
[← Danh sách nhóm]  Nhóm 05 · IoT Smart Home  [Đang thực hiện]  [Đổi nhóm ▾]
```

Ngay dưới context bar là tab dự án cao khoảng 42–46px. ProjectHeader mở rộng hiện tại chuyển thành drawer/popover “Thông tin dự án” hoặc vùng details có thể mở khi cần.

Kết quả mong muốn:

- Không mất khả năng nhận biết đang ở nhóm nào.
- Không lặp tiêu đề trang và project header.
- Giải phóng khoảng 140–220px chiều cao cho chart.
- Điều hướng nhóm vẫn luôn hiện khi cuộn.

### 8.3. Vì sao không khuyến nghị auto-hide hoàn toàn theo scroll ngay

Header tự biến mất khi cuộn có thể tạo cảm giác giao diện nhảy, đặc biệt khi đổi chiều cuộn hoặc dùng trackpad. Nó cũng làm phức tạp nested scroll hiện tại (`flex-1 overflow-auto`).

Nếu vẫn muốn hiệu ứng động, chỉ dùng như enhancement sau khi route-based compact header đã ổn định:

- Dùng `IntersectionObserver` với sentinel thay vì lắng nghe `scroll` liên tục.
- Chỉ collapse phần mô tả/details, không ẩn context nhóm và nút đổi nhóm.
- Animation tối đa 150–200ms bằng `transform`/`opacity`.
- Tôn trọng `prefers-reduced-motion`.
- Giữ chiều cao container ổn định hoặc dùng sticky bar thay thế để tránh content jump.

### 8.4. Wireframe được đề xuất cho project detail

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ← Danh sách nhóm   Nhóm 05 · IoT Smart Home   [Rủi ro] [Đổi nhóm] │  60px
├─────────────────────────────────────────────────────────────────────┤
│ [Tổng quan & Phân tích] [GitHub Commit] [Jira Kanban]              │  44px
├─────────────────────────────────────────────────────────────────────┤
│ Sprint 3 ▾  30 ngày ▾  Tất cả thành viên ▾  GitHub + Jira ▾       │  48px
├──────────────────────────────────┬──────────────────────────────────┤
│                                  │ Tiến độ 68% · 7 ngày còn lại    │
│       SPRINT BURNDOWN             │ 3 việc trễ hạn                  │  300–340px
│                                  │ 1 bất thường cần kiểm tra       │
├──────────────────────────────────┴──────────────────────────────────┤
│ Cumulative Flow                  │ Velocity                         │
└─────────────────────────────────────────────────────────────────────┘
```

Chart chính xuất hiện ngay sau khoảng 150px UI nội bộ, thay vì sau nhiều tầng header và KPI.

### 8.5. Sắp xếp lại nội dung tab Tổng quan & Phân tích

Hiện tại `AnalyticsTab` đặt Filter Bar → Metric Strip → Chart. Đề xuất:

1. Context bar và project tabs nằm ngoài tab content.
2. Filter bar dạng compact, sticky hoặc collapsible.
3. Hero chart row xuất hiện ngay:
   - Burndown chiếm 2/3.
   - Sprint health + cảnh báo chiếm 1/3.
4. Metric strip phụ đặt ngay dưới hero chart hoặc tích hợp vào panel sprint health.
5. Cumulative Flow và Velocity.
6. Commit/Jira và Cycle Time.
7. Đóng góp thành viên và ma trận khối lượng.
8. Activity feed cuối trang.

Không cần loại KPI, chỉ cần giảm vai trò thị giác của KPI và đưa chúng vào panel cạnh chart chính.

### 8.6. Hai tab lớn phải luôn nhìn thấy

`PrimaryTabs` hiện chỉ render “Dự án nhóm” khi `isProjectActive === true`. Điều này làm tab lớn biến mất tại trang Danh sách lớp và giảm khả năng khám phá tính năng.

Sửa thành:

- Luôn render cả “Danh sách lớp” và “Dự án nhóm”.
- Khi chưa chọn team, click “Dự án nhóm” tới `/teams/select`.
- Khi đã có team gần nhất trong session/local mock state, có thể đi thẳng tới team đó nhưng phải cho phép đổi nhóm.
- Active state dựa trên pathname và có `aria-current="page"`.

### 8.7. URL canonical cho tab mặc định

Hiện server page fallback về `overview`, sau đó client đổi `overview` thành `analytics`. Cách này hoạt động nhưng tạo hai nguồn diễn giải tab.

Chỉ giữ một quy tắc:

- Server mặc định `analytics`.
- Danh sách tab hợp lệ chỉ gồm `analytics`, `github`, `kanban`.
- Nếu nhận `overview` cũ, dùng redirect/replace sang `?tab=analytics` hoặc normalize tại server.
- Không giữ file `overview-tab.tsx` đã bỏ nếu không còn consumer.

### 8.8. Nâng mức “wow” mà vẫn Academic Tech

- Chart hero có header rõ: tên sprint, trạng thái, thời gian còn lại và chú giải đường lý tưởng/thực tế.
- Khi hover một điểm Burndown, đồng thời highlight các task/commit tương ứng trong tooltip, thể hiện tính minh bạch Jira–GitHub.
- Insight card dùng câu trung lập: “Cần đối soát: 1 task hoàn thành chưa có commit liên kết”, kèm CTA “Mở đồ thị truy xuất”.
- Có skeleton chart khi tải và animation nhẹ chỉ ở lần render đầu.
- Cho phép mở chart toàn màn hình bằng dialog chuẩn responsive.
- Không dùng gradient/animation trang trí quá mức; điểm nhấn phải xuất phát từ dữ liệu và trạng thái rủi ro.

---

## 9. Checklist bắt buộc theo `.agents/rules`

### 9.1. Các vi phạm đang tồn tại cần xử lý

1. `project-progress-charts.tsx` đang hardcode nhiều mã HEX (`#94a3b8`, `#6366f1`, ...). Điều này vi phạm `ui-ux-design-system.md`. Chuyển sang CSS variables như `var(--chart-1)`, `var(--chart-2)`, `var(--success)`, `var(--destructive)` hoặc token được định nghĩa tập trung.
2. `member-filter-bar.tsx` vẫn import `@/components/ui/select`. Chuyển sang `CustomSelect`.
3. Một số text UI chưa thuần Việt:
   - “Sprint Burndown” → “Biểu đồ tiến độ Sprint”.
   - “Cumulative Flow Diagram” → “Biểu đồ luồng tích lũy”.
   - “Cycle Time” → “Thời gian hoàn thành công việc”.
   - “Workload Matrix” → “Ma trận khối lượng công việc”.
   - “Priority” → “Độ ưu tiên”.
   - “Project” → “Dự án”.
4. Chart data hiện nằm trong các mảng hardcode riêng, trong khi bảng GitHub/Jira dùng mock data khác. Điều này vi phạm nguyên tắc minh bạch dựa trên dữ liệu. Chart phải derive từ `MOCK_COMMITS`, `MOCK_JIRA_ISSUES`, sprint và members của project.
5. Các Recharts component đang import tĩnh. Theo performance rule, cân nhắc dynamic import `ssr: false` cho cụm chart lớn, kèm skeleton có cùng kích thước để tránh layout shift.
6. Các phép tổng hợp metric/filter mới phải dùng `useMemo`; callback truyền sâu hoặc qua chart interaction dùng `useCallback`.
7. Alert “task Done nhưng không có commit” phải được tính từ dữ liệu Jira/commit, không hardcode. CTA cần trỏ đúng route graph thuộc namespace lecturer/course hiện tại.

### 9.2. Quy tắc route và shell

- Lecturer tiếp tục dùng Top Header hai tầng, không thêm Sidebar trở lại.
- Compact header được triển khai trong nested lecturer route, không thay thế global TopNavHeader.
- Mọi link phải giữ `/lecturer/...` và đủ `courseId`, `teamId`.
- Reload trực tiếp project detail phải giữ đúng nhóm và tab từ URL.
- Không dựa hoàn toàn vào state bộ nhớ để render route hợp lệ.

### 9.3. Quy tắc graph/traceability

Nếu CTA từ cảnh báo mở Cytoscape Traceability Graph:

- Có neighborhood dimming/highlighting.
- Hỗ trợ bốn layout theo rule.
- Cleanup Cytoscape instance khi unmount.
- Dùng `cy.batch()` khi cập nhật data.
- Có bảng Traceability Matrix ngay bên dưới graph.

Các chart Recharts thông thường không cần áp dụng quy tắc node/edge của Cytoscape.

### 9.4. Quy tắc test và nghiệm thu

Khi tách các hàm tính group grade, KPI, overdue, anomaly và chart series vào `lib/`, thêm unit test theo format:

- `UTCIDxx - [N] Normal: ...`
- `UTCIDxx - [A] Abnormal: ...`
- `UTCIDxx - [B] Boundary: ...`

Các boundary bắt buộc nên có:

- Lớp không có sinh viên.
- Sinh viên không có nhóm.
- Team không có commit hoặc Jira issue.
- Tổng trọng số đúng 100%, dưới 100%, trên 100%.
- Issue Done nhưng không có commit liên kết.
- Sprint không có dữ liệu chart.

Trước commit/PR phải chạy `npm run test`, `npm run lint` và `npm run build`; lint bắt buộc 0 error, 0 warning.

---

## 10. Thứ tự triển khai được khuyến nghị

1. Sửa nested layout để project detail dùng compact context header.
2. Luôn hiển thị đủ hai tab lớn và chuẩn hóa tab mặc định thành `analytics` tại server.
3. Đưa hero Burndown lên ngay sau compact filter; chuyển KPI vào side insight panel.
4. Derive toàn bộ KPI/chart từ cùng mock Jira/GitHub data.
5. Hoàn thiện accessibility cho `GradeGroupCard` và dữ liệu project/leader của nhóm.
6. Hoàn thiện confirm xóa override, migration config và bỏ mode trong dialog team.
7. Thay toàn bộ Select còn sót bằng `CustomSelect`.
8. Thay màu HEX chart bằng design tokens và Việt hóa nhãn.
9. Thêm loading/empty/error/disconnected states và unit test utility.
10. Kiểm tra viewport 1366×768: chart Burndown phải xuất hiện ngay khi mở project mà không cần cuộn.

---

## 11. Checklist review cuối

- [ ] Bảng điểm mặc định chia theo nhóm.
- [ ] Có section sinh viên chưa có nhóm.
- [ ] Không còn selector mode Toàn lớp/Từng nhóm.
- [ ] Cấu hình lớp luôn hiển thị ở trên.
- [ ] Team override là tùy chọn và kế thừa rõ ràng.
- [ ] Biểu đồ dự án nằm trước bảng/feed dài.
- [ ] Tab phân tích được ưu tiên hoặc gộp vào Tổng quan.
- [ ] GitHub có chart trước commit table.
- [ ] Jira có sprint health trước Kanban.
- [ ] Số liệu KPI và chart cùng nguồn mock.
- [ ] UI dùng tiếng Việt nhất quán.
- [ ] Bộ lọc dùng `CustomSelect`.
- [ ] Không có overflow ở modal, bảng, chart và Kanban.
- [ ] Lint và production build đều pass.

---

## 12. Audit thuật ngữ trong phạm vi giảng viên

### 12.1. Nguyên tắc đặt tên trên UI

Không dịch máy từng chữ và cũng không loại bỏ toàn bộ thuật ngữ chuyên môn. Dùng ba cấp độ:

1. **Từ phổ thông tiếng Việt làm nhãn chính** để giảng viên hiểu ngay.
2. **Thuật ngữ quen thuộc đặt trong ngoặc** ở lần xuất hiện đầu tiên nếu cần đối chiếu Jira/GitHub.
3. **Mã kỹ thuật giữ nguyên** khi đó là dữ liệu thật, ví dụ mã commit, mã Jira, tên nhánh và tên repository.

Ví dụ tốt:

> Thời gian xử lý công việc (Cycle Time)

Sau khi đã giải thích một lần, các vị trí tiếp theo chỉ cần dùng “Thời gian xử lý”.

### 12.2. Bảng thuật ngữ khuyến nghị

| Đang dùng hoặc dễ dùng nhầm | Nhãn nên dùng trên UI | Ghi chú |
| --- | --- | --- |
| Dashboard | Tổng quan | “Dashboard” chỉ dùng trong code/route |
| Team | Nhóm | Dùng thống nhất trong toàn bộ UI giảng viên |
| Project | Dự án | Không dùng “Project:” trong dialog |
| Member | Thành viên | Không dùng trong nhãn/bộ lọc |
| Leader | Trưởng nhóm | Có thể giữ “Leader” trong dữ liệu kỹ thuật, không hiển thị trực tiếp |
| Mode | Cách áp dụng hoặc bỏ hẳn nhãn | Trang trọng số mới không còn mode toàn cục |
| Override | Cấu hình riêng | “Kế thừa từ lớp” là trạng thái ngược lại |
| Preset | Mẫu cấu hình | CTA: “Áp dụng mẫu” |
| Custom | Tùy chỉnh | Không dùng “Tự định nghĩa” nếu chỉ là chỉnh số |
| GitHub Commit | Hoạt động mã nguồn | Subtext: “Các lần cập nhật mã trên GitHub” |
| Commit | Lần cập nhật mã (commit) | Mã hash và commit message vẫn giữ nguyên |
| Contributor | Thành viên đóng góp | Tránh “Người đóng góp” nếu đang nói về thành viên nhóm |
| Pull Request / PR | Yêu cầu gộp mã (PR) | Sau lần đầu có thể dùng “PR” |
| Branch | Nhánh mã nguồn | Tên nhánh như `main`, `develop` giữ nguyên |
| Repository / Repo | Kho mã nguồn | Tên repository giữ nguyên |
| Jira Issue | Công việc Jira hoặc thẻ công việc | “Issue” dễ bị hiểu là lỗi |
| Task | Công việc | Nếu cần phân biệt loại Jira: “Loại: Task” trong chi tiết kỹ thuật |
| Story | Yêu cầu người dùng | Có thể ghi “Story” trong badge phụ |
| Bug | Lỗi | Không cần dịch thành “sự cố” nếu ngữ cảnh mã nguồn |
| Story Point | Điểm công việc | Tooltip: “Mức độ lớn tương đối, không phải số giờ” |
| Priority | Độ ưu tiên | Tooltip và aria-label đều dùng tiếng Việt |
| To Do | Cần làm | Có thể để “TO DO” nhỏ trong badge phụ nếu đồng bộ Jira |
| In Progress | Đang thực hiện | Tránh “Đang làm” ở trang này và “Đang thực hiện” ở trang khác |
| In Review | Chờ duyệt | “Đang duyệt” dễ ngụ ý có người đang xử lý ngay lúc này |
| Blocked | Đang bị chặn | Tự nhiên hơn “Bị nghẽn” trong ngữ cảnh công việc |
| Done | Hoàn thành | Thống nhất mọi bảng và chart |
| Sprint | Giai đoạn (Sprint) | Có thể giữ “Sprint” sau lần giải thích đầu vì Jira dùng thuật ngữ này |
| Sprint Burndown | Tiến độ công việc còn lại | Subtext giải thích đường kế hoạch và thực tế |
| Cumulative Flow Diagram | Luồng công việc theo thời gian | Không cần hiện tên tiếng Anh trên card |
| Velocity | Khối lượng hoàn thành qua từng Sprint | Tránh dịch sát thành “Vận tốc” |
| Cycle Time | Thời gian xử lý công việc | Nêu rõ đơn vị giờ/ngày |
| Workload Matrix | Phân bổ khối lượng theo thành viên | Không cần thêm tiếng Anh trong ngoặc ở tiêu đề |
| Traceability Graph | Đồ thị đối chiếu công việc và mã nguồn | Dễ hiểu hơn “Đồ thị truy xuất” đứng riêng |
| MSR Anomaly | Công việc hoàn thành nhưng thiếu minh chứng mã nguồn | Không đưa từ MSR ra giao diện chính |
| Ghosting | Thành viên ít tương tác | Không gắn nhãn mang tính phán xét con người |
| Key Contributor | Thành viên đóng góp nổi bật | Tránh “thành viên gánh team” trên UI học thuật |
| Export file | Tải file | Nếu có định dạng: “Tải file Excel” |
| Import Excel | Nhập từ Excel | Tự nhiên hơn “Nhập Excel” |
| Filter | Bộ lọc hoặc Lọc | CTA ngắn: “Lọc”; tên vùng: “Bộ lọc” |
| Reset | Đặt lại | Với dữ liệu: “Khôi phục mặc định” hoặc “Dùng lại cấu hình lớp” |
| Status | Trạng thái | Dùng thống nhất |

### 12.3. Thuật ngữ tiêu chí trọng số

`CODE`, `TEST`, `DOCUMENT`, `RESEARCH` là mã tiêu chí nghiệp vụ nên có thể giữ trong dữ liệu/code, nhưng UI nên hiển thị song ngữ có ưu tiên tiếng Việt:

- Mã nguồn (`CODE`).
- Kiểm thử (`TEST`).
- Tài liệu (`DOCUMENT`).
- Nghiên cứu (`RESEARCH`).

Ở màn hình hẹp chỉ hiện tiếng Việt; mã tiêu chí nằm trong tooltip hoặc mô tả phụ.

### 12.4. Các chuỗi hiện tại cần đổi trước nghiệm thu

- “Sprint Burndown” → “Tiến độ công việc còn lại”.
- “Cumulative Flow Diagram” → “Luồng công việc theo thời gian”.
- “Velocity theo sprint” → “Khối lượng hoàn thành qua từng Sprint”.
- “Cycle Time” → “Thời gian xử lý công việc”.
- “Ma trận khối lượng công việc (Workload Matrix)” → “Phân bổ khối lượng theo thành viên”.
- Tooltip `Priority: ...` → `Độ ưu tiên: ...`.
- Tooltip `Story Points` → `điểm công việc`.
- Placeholder “Tìm kiếm issue...” → “Tìm theo mã hoặc tên công việc...”.
- “Commit Message” → “Nội dung cập nhật”.
- “Contributor” → “Thành viên đóng góp”.
- “Project:” → “Dự án:”.
- “Lỗi tổng != 100%” → “Tổng trọng số chưa bằng 100%”.
- “Từng Team”/“Danh sách team” → “Theo từng nhóm”/“Danh sách nhóm”.

### 12.5. Giọng điệu cảnh báo

Không dùng ngôn ngữ kết luận hoặc quy chụp khi dữ liệu chỉ là dấu hiệu:

| Không nên dùng | Nên dùng |
| --- | --- |
| Có dấu hiệu báo cáo khống | Cần đối chiếu thêm minh chứng |
| Thành viên không làm việc | Chưa ghi nhận hoạt động trong khoảng thời gian này |
| Thành viên ghosting | Thành viên có mức tương tác thấp |
| Nhóm yếu | Nhóm cần hỗ trợ |
| Đóng góp kém | Mức đóng góp đang thấp hơn mặt bằng nhóm |

Mọi cảnh báo phải kèm khoảng thời gian, nguồn dữ liệu và CTA kiểm tra minh chứng.

---

## 13. Kết luận nghiệm thu UI hiện tại

### 13.1. Đã đáp ứng

- Bảng điểm đã có chế độ chia theo nhóm và chế độ toàn lớp.
- Có khu vực riêng cho sinh viên chưa có nhóm.
- Cấu hình trọng số đã chuyển sang lớp mặc định + cấu hình riêng theo nhóm.
- Tab phân tích đã được ưu tiên và gộp với tổng quan.
- GitHub và Jira đã có bộ lọc, chỉ số tổng quan và dữ liệu minh họa.
- Phần lớn bộ lọc mới đã dùng `CustomSelect`.
- UI lecturer vẫn nằm trong Top Header shell, không quay lại Sidebar.

### 13.2. Chưa đáp ứng hoàn toàn

- Hero header lớn của route hoạt động nhóm vẫn chiếm nhiều chiều cao; compact project context header chưa được triển khai.
- Burndown vẫn đứng sau filter và bốn KPI nên chưa chắc xuất hiện trong viewport 1366×768.
- Tab “Dự án nhóm” đang bị ẩn ở trang Danh sách lớp, trái với yêu cầu hai tab lớn.
- Server vẫn mặc định `overview`, client mới chuyển thành `analytics`; URL/tab state chưa có một nguồn sự thật duy nhất.
- Header nhóm trong bảng điểm chưa phải phần tử tương tác bàn phím chuẩn.
- Metadata dự án/trưởng nhóm trong GradeGroupCard chưa được cung cấp đầy đủ.
- Xóa cấu hình riêng theo nhóm chưa có bước xác nhận.
- Dialog trọng số vẫn còn lựa chọn “Tự định nghĩa/Chọn mẫu” không cần thiết.
- Chart dùng màu HEX hardcode và dữ liệu chart chưa derive từ cùng mock Jira/GitHub.
- Còn shadcn Select trực tiếp trong `member-filter-bar.tsx`.
- Còn nhiều thuật ngữ chuyên môn/dịch sát nghĩa như Burndown, Cumulative Flow, Cycle Time, Workload Matrix, issue và Priority.
- `npm run lint` hiện có 1 warning do import `Label` không sử dụng trong `team-weight-dialog.tsx`.
- `git diff --check` hiện báo nhiều trailing whitespace, chưa đạt chuẩn sẵn sàng commit.

### 13.3. Đánh giá cuối

UI hiện tại đã đạt đúng hướng về nghiệp vụ nhưng **chưa nên chuyển sang trạng thái hoàn tất**. Sau khi xử lý các mục sau, có thể audit trực quan và nghiệm thu lại:

1. Triển khai compact context header cho project detail.
2. Đưa hero chart lên trước metric strip hoặc gộp metric vào panel cạnh chart.
3. Luôn hiển thị đủ hai tab lớn.
4. Việt hóa thuật ngữ theo bảng ở mục 12.
5. Đồng bộ chart/KPI với cùng nguồn mock.
6. Xử lý accessibility, confirm override, `CustomSelect`, chart tokens và dynamic import.
7. Dọn lint warning và trailing whitespace.
8. Kiểm tra trực quan desktop 1366×768, tablet và mobile trước khi commit.
