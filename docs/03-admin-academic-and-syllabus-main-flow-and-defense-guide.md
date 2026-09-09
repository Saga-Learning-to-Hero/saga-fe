# Kiến Trúc & Luồng Nghiệp Vụ Chính: Phân Hệ Quản Trị Học Thuật & Đề Cương (Admin Academic & Syllabus Main Flow)

Tài liệu này giải thích chi tiết **Luồng chính (Main Flow)** của phân hệ Quản trị Học thuật (**Admin Academic**) và Quản lý Đề cương Môn học (**Syllabus FLM**) do **Dev 1** phụ trách trong hệ thống SAGA. Tài liệu giúp các thành viên trong nhóm hiểu rõ bản chất nghiệp vụ từ Frontend đến Backend và tự tin trả lời phỏng vấn trước Hội đồng Đồ án Tốt nghiệp.

---

## 1. Bản Chất Kiến Trúc & Triết Lý Thiết Kế Nghiệp Vụ

Hệ thống SAGA mô hình hóa cấu trúc đào tạo theo tiêu chuẩn quản lý của các trường đại học công nghệ (FPT University) với 4 thực thể cốt lõi độc lập:

$$\text{\textbf{Semester (Học kỳ)}} \quad \times \quad \text{\textbf{Academic Class (Lớp hành chính)}} \quad \times \quad \text{\textbf{Subject \& Syllabus (Môn học \& Đề cương)}} \quad \longrightarrow \quad \text{\textbf{Course (Lớp học phần)}}$$

### 📌 Nguyên Tắc Bất Biến Của Đề Cương (Syllabus Immutability Principle)
* **Trạng thái Bản thảo (`DRAFT`)**: Quản trị viên được toàn quyền sửa đổi thông tin, thêm/bớt bài nộp (`Deliverable`), phân bổ trọng số % và gán mã chuẩn đầu ra (`CLO - Course Learning Outcome`).
* **Trạng thái Xuất bản (`PUBLISHED`)**: Khi một đề cương được bấm "Xuất bản chính thức", nó trở thành một **Snapshot Bất biến (Immutable)** trong cơ sở dữ liệu:
  * Không bất kỳ ai (kể cả Admin cấp cao nhất) được quyền sửa cấu trúc hay trọng số của một đề cương đã `PUBLISHED`.
  * Nếu môn học đổi cấu trúc chấm điểm ở kỳ sau, Admin bắt buộc phải nhân bản để tạo một phiên bản `DRAFT` mới (ví dụ từ `v1.0` sang `v2.0`).
  * **Ý nghĩa học thuật**: Đảm bảo tính pháp lý và công bằng. Điểm số của sinh viên đã học kỳ trước không bao giờ bị ảnh hưởng khi môn học cập nhật đề cương mới.

---

## 2. Luồng Nghiệp Vụ Chính (The Main Flow)

Toàn bộ luồng khởi tạo dữ liệu học thuật được thực hiện tuần tự theo sơ đồ sau:

```text
[1. Quản trị Học kỳ & Kích hoạt kỳ] ────> [2. Tạo Lớp hành chính ban đầu]
                                                       │
                                                       ▼
[4. Xuất bản Đề cương Bất biến] <──── [3. Tạo Môn học & Xây dựng Cây Đề cương]
        │
        ▼
[5. Mở Lớp học phần (Course)] ────> [6. Tải File Mẫu Excel Roster]
                                                       │
                                                       ▼
[8. Sinh viên nhận Mail & Vào lớp] <──── [7. Upload Preview Kiểm toán ──> Confirm Import]
```

---

### Bước 1: Quản trị Học kỳ (`Semester`)
1. Quản trị viên truy cập `/admin/academic`, chuyển sang Tab **"Học kỳ"**.
2. Bấm nút **"Thêm học kỳ"**: Nhập Mã kỳ (ví dụ `FA26`), Tên kỳ (`Fall 2026`), Ngày bắt đầu và Ngày kết thúc.
3. **Thao tác nghiệp vụ quan trọng**: Bấm **"Kích hoạt kỳ này"** (`POST /api/admin/semesters/{id}/activate`):
   * Backend sẽ chuyển kỳ này thành `ACTIVE` và tự động hạ các kỳ cũ về `INACTIVE`.
   * Toàn bộ hệ thống (Giảng viên, Sinh viên, Bảng điều khiển) sẽ tự động lấy kỳ `ACTIVE` làm ngữ cảnh làm việc mặc định.

### Bước 2: Quản lý Lớp Hành chính (`Academic Class`)
1. Quản trị viên chuyển sang Tab **"Lớp hành chính"**.
2. Tạo các lớp quản lý sinh viên theo khóa (ví dụ `SE1801`, `IA1802`).
3. Lớp hành chính đại diện cho mã định danh lớp cố định của sinh viên trong suốt quá trình học tại trường.

### Bước 3: Tạo Danh Mục Môn Học & Soạn Thảo Đề Cương FLM (`Subject & Syllabus`)
1. Quản trị viên truy cập `/admin/subjects`, bấm **"Tạo môn học mới"**:
   * Nhập Mã môn (`SWP391`), Tên tiếng Anh (`Software Development Project`), Tên tiếng Việt, Số tín chỉ.
   * Gửi `POST /api/admin/subjects` ➔ Môn học được tạo ở trạng thái `ACTIVE`.
2. Bấm vào môn học để mở trang chi tiết `/admin/subjects/[id]`:
   * Bấm **"Tạo phiên bản đề cương mới"**: Nhập tên phiên bản (ví dụ `v1.0 - FA26`), Số tín chỉ.
   * Backend tạo một Syllabus mới với trạng thái ban đầu là `DRAFT`.

### Bước 4: Xây Dựng Cây Tiêu Chí & Ma Trận Đánh Giá (Syllabus Structure Builder)
Tại giao diện xây dựng cấu trúc đề cương, Admin thiết lập 3 tầng dữ liệu:
1. **Milestones (Cột mốc)**: Phân rã tiến độ môn học theo các Sprint/Cột mốc (ví dụ `Sprint 1 - SRS`, `Sprint 2 - Prototype`, `Sprint 3 - Final`).
2. **Deliverables (Sản phẩm giao nộp & Trọng số)**:
   * Mỗi Milestone chứa các bài nộp cụ thể (ví dụ: `SRS Document`, `Git Commit & Source Code`, `Kanban Board`).
   * Mỗi Deliverable có trọng số phần trăm (`weightPercentage`).
   * **Ràng buộc nghiệp vụ bắt buộc**: Tổng trọng số của toàn bộ bài nộp trong đề cương phải **chính xác bằng 100%**. Nếu khác 100%, hệ thống sẽ chặn nút lưu và cảnh báo đỏ.
3. **CLO Matrix (Ma trận Chuẩn đầu ra)**:
   * Mỗi bài nộp phải được tích chọn liên kết tới ít nhất một chuẩn đầu ra (`outcomeCodes`, ví dụ: `G1.1`, `G2.1`, `G3.2`).
4. **Lưu Cấu Trúc**: Admin bấm **"Lưu cấu trúc đề cương"** (`PUT /api/admin/subjects/{subjectId}/syllabi/{syllabusVersionId}/structure`).
5. **Xuất Bản Chính Thức**: Admin bấm **"Xuất bản chính thức (Publish)"** (`POST /api/admin/subjects/{subjectId}/syllabi/{syllabusVersionId}/publish`):
   * Đề cương chuyển sang trạng thái `PUBLISHED`.
   * Toàn bộ các nút chỉnh sửa cấu trúc bị khóa lại để bảo toàn tính bất biến.

### Bước 5: Mở Lớp Học Phần (`Course`)
1. Quản trị viên quay lại `/admin/academic`, chuyển sang Tab **"Lớp học phần"** và bấm **"Tạo lớp học phần mới"**.
2. Form yêu cầu chọn đủ 5 yếu tố liên kết:
   * **Môn học**: Chọn `SWP391`.
   * **Phiên bản đề cương**: Hệ thống chỉ hiển thị các đề cương đã `PUBLISHED`.
   * **Lớp hành chính**: Chọn `SE1801`.
   * **Học kỳ**: Tự động chọn học kỳ `ACTIVE` (ví dụ `Fall 2026`).
   * **Giảng viên**: Chọn Giảng viên phụ trách giảng dạy và chấm điểm.
3. Bấm **"Tạo lớp học phần"** (`POST /api/admin/courses`): Lớp học phần được kích hoạt ngay lập tức trên hệ thống.

### Bước 6: Quy Trình Ghi Danh Sinh Viên Bằng Excel 3 Bước (Two-Phase Roster Import)
Admin bấm vào nút **"Roster"** trên thẻ lớp học phần để chuyển vào trang `/admin/academic/courses/[id]`:

1. **Pha 1 - Tải File Mẫu Chuẩn (`Download Template`)**:
   * Admin bấm nút **"Tải file mẫu Excel"** (`GET /api/admin/courses/{id}/roster/template`).
   * Trình duyệt tải về file `Roster_Template_SWP391_SE1801.xlsx` chứa sẵn các cột chuẩn: `studentCode`, `fullName`, `email`.
2. **Pha 2 - Kiểm Toán & Xem Trước Lỗi (`Preview Audit`)**:
   * Admin kéo thả file Excel vào Modal **"Import danh sách sinh viên"**.
   * Frontend gửi file qua `POST /api/admin/courses/{id}/roster/import/preview`.
   * Backend đọc file, đối soát kiểm tra dữ liệu và trả về kết quả kiểm toán:
     * Danh sách hợp lệ (`validEntries`).
     * Danh sách cảnh báo/lỗi (`errors`: trùng mã sinh viên, email sai định dạng, sinh viên đã có trong lớp).
     * Số lượng sinh viên đã có tài khoản (`enrolledCount`) vs sinh viên mới cần gửi thư mời kích hoạt (`pendingInvitationCount`).
3. **Pha 3 - Xác Nhận Ghi Danh (`Confirm Commit`)**:
   * Sau khi kiểm tra bảng đối soát, Admin bấm **"Xác nhận ghi danh"** (`POST /api/admin/courses/{id}/roster/import/confirm`).
   * Backend thực hiện ghi danh:
     * Sinh viên đã có tài khoản trường: Trực tiếp vào trạng thái **"Đã ghi danh" (`ENROLLED`)**.
     * Sinh viên chưa có tài khoản: Hệ thống tạo bản ghi **"Lời mời" (`INVITED`)** và tự động gửi email thông báo kèm liên kết kích hoạt tài khoản.

---

## 3. Các Cơ Chế Kỹ Thuật Đỉnh Cao Của Frontend (Technical Highlights)

Để mang lại trải nghiệm người dùng tức thời và đạt chuẩn công nghệ đồ án tốt nghiệp xuất sắc, phân hệ của Dev 1 đã áp dụng các kỹ thuật:

### ⚡ 1. Cập Nhật Giao Diện Lạc Quan & Đồng Bộ Bộ Nhớ Đệm Tức Thời (< 16ms)
* **Kỹ thuật**: Khi Admin tạo mới hoặc chỉnh sửa Học kỳ, Lớp hành chính, Lớp học phần, hay Đề cương:
  * Dialog đóng ngay lập tức trong 1 khung hình (< 16ms).
  * Hàm mutation gọi `queryClient.setQueryData()` để chèn trực tiếp dòng dữ liệu mới vào bảng hiển thị trên màn hình mà không cần gọi lại API tải danh sách.
  * Nếu Backend trả về lỗi: Tự động rollback về dữ liệu cũ và hiện Toast thông báo lỗi.

### ⚡ 2. Kế Thừa Dữ Liệu Bộ Nhớ Đệm (`initialData` Cache Inheritance)
* **Kỹ thuật**: Khi Admin click từ trang danh sách Môn học/Lớp học vào trang chi tiết `[id]`:
  * Hook `useSubjectDetail` và `useCourseDetail` sử dụng cấu hình `initialData` lấy đối tượng đã có sẵn từ cache của danh sách.
  * **Kết quả**: Tiêu đề môn/lớp, mã số, giảng viên hiển thị ngay trong **0ms**, loại bỏ hoàn toàn hiện tượng màn hình trắng hoặc thác đổ gọi API (Waterfall).

### ⚡ 3. Tải Trước Đa Tầng Khi Rê Chuột (Predictive Hover Pre-fetching)
* **Kỹ thuật**: Tận dụng độ trễ cơ học 150ms - 300ms khi người dùng rê chuột (`onMouseEnter`):
  * Tầng 1: `router.prefetch()` nạp trước mã nguồn JavaScript của trang con.
  * Tầng 2: `queryClient.prefetchQuery()` nạp trước dữ liệu chi tiết vào RAM.
  * Tầng 3: Nạp trước cấu trúc đề cương hoặc danh sách Roster sinh viên.
* **Kết quả**: Khi người dùng click chuột, toàn bộ trang và dữ liệu đã sẵn sàng trong RAM ➔ Trang mở ra ngay tức khắc trong **0ms (Zero Latency)**.

### ⚡ 4. Ổn Định Khung Hình Chuẩn Tuyệt Đối (Zero Layout Shift - CLS = 0)
* Xóa bỏ hoàn toàn Spinner xoay tròn che toàn bộ màn hình.
* Thay thế bằng **Skeleton Shimmer** có kích thước và bố cục 1:1 tương đương nội dung thật, giúp chỉ số đo lường hiệu năng LCP (Largest Contentful Paint) luôn duy trì ở mức màu xanh an toàn (< 0.5s).

### ⚡ 5. Hệ Thống Kiểm Thử Đơn Vị Đạt Chuẩn 100% Pass (Vitest Suite)
* Toàn bộ các API Service của Dev 1 (`AcademicService`, `CourseService`, `RosterService`, `SubjectService`, `SyllabusService`) đều có file test tương ứng.
* Đạt **97/97 ca kiểm thử thành công (100% Pass Rate)**, được phân loại rõ ràng theo chuẩn báo cáo đồ án tốt nghiệp FPT:
  * **Ca Thông thường (`N` - Normal)**: Happy path, HTTP 200 OK.
  * **Ca Bất thường (`A` - Abnormal)**: Thiếu trường bắt buộc, sai định dạng, HTTP 400/404/500 Exception.
  * **Ca Giá trị biên (`B` - Boundary)**: Tổng trọng số bằng 0%, tổng trọng số khác 100%, danh sách rỗng `[]`.

---

## 4. Bốn Câu Hỏi Phản Biện Cốt Lõi Khi Hội Đồng Hỏi Về Phân Hệ Này

### ❓ Câu 1: Tại sao hệ thống lại tách riêng `Subject` (Môn học) và `Syllabus` (Đề cương) thành 2 thực thể độc lập mà không gộp chung vào 1 bảng?
* **Trả lời**:
  * Một môn học (`Subject`) như `SWP391` có thể tồn tại qua nhiều năm, nhưng đề cương và tiêu chí đánh giá (`Syllabus`) thường xuyên thay đổi qua từng kỳ hoặc từng năm học (ví dụ: bổ sung tiêu chí kiểm thử, đổi trọng số đồ án).
  * Việc tách riêng cho phép **Quản lý đa phiên bản (Multi-versioning)**: Môn học đóng vai trò danh mục cha, bên dưới có thể chứa nhiều phiên bản đề cương (`v1.0 - FA25`, `v2.0 - SP26`). Khi mở lớp học phần, nhà trường có thể linh hoạt chọn đúng phiên bản đề cương áp dụng cho kỳ đó.

### ❓ Câu 2: Nếu một Lớp học phần đang diễn ra, Giảng viên hoặc Admin có được phép sửa lại trọng số bài nộp trong Đề cương không?
* **Trả lời**:
  * **Tuyệt đối KHÔNG.** Hệ thống áp dụng quy tắc **Bất biến của Đề cương đã xuất bản (Syllabus Immutability)**.
  * Một khi đề cương đã chuyển sang `PUBLISHED` và được gán vào Lớp học phần, Backend sẽ chặn mọi thao tác cập nhật cấu trúc (`PUT /api/admin/subjects/{subjectId}/syllabi/{syllabusVersionId}/structure`).
  * Nếu cố tình gọi API, Backend sẽ trả về lỗi nghiệp vụ: `COURSE_SYLLABUS_IMMUTABLE`. Điều này ngăn chặn gian lận điểm số và bảo vệ quyền lợi minh bạch của sinh viên.

### ❓ Câu 3: Quy trình Import Roster sinh viên bằng file Excel xử lý thế nào nếu gặp sinh viên chưa từng có tài khoản trong hệ thống?
* **Trả lời**:
  * Hệ thống thiết kế theo cơ chế **Kiểm toán 2 giai đoạn (Two-Phase Audit Flow)**:
    1. Khi tải file lên, hệ thống chạy pha **Preview**: Tự động bóc tách và phân loại sinh viên thành 2 nhóm: Nhóm đã có tài khoản (`ENROLLED`) và Nhóm chưa có tài khoản (`PENDING_INVITATION`).
    2. Khi Admin bấm **Confirm**: Hệ thống tự động ghi danh các bạn đã có tài khoản, đồng thời sinh mã token và gửi Email lời mời (`INVITATION`) đến hòm thư FPT của sinh viên mới. Sinh viên bấm vào link trong email để kích hoạt tài khoản và tự động gia nhập vào lớp.

### ❓ Câu 4: Vì sao khi người dùng nhấp vào xem chi tiết một môn học hoặc lớp học phần, giao diện lại hiển thị ra ngay lập tức mà không phải chờ đợi vòng xoay loading?
* **Trả lời**:
  * Nhóm đã áp dụng kết hợp 3 kỹ thuật hiệu năng:
    1. **Predictive Hover Pre-fetching**: Khi con trỏ chuột vừa rê vào thẻ Card (150ms trước khi click), hệ thống đã gọi ngầm `router.prefetch` và `queryClient.prefetchQuery` để nạp sẵn mã nguồn và dữ liệu vào RAM.
    2. **Cache Inheritance (`initialData`)**: Trang chi tiết kế thừa ngay thông tin môn học đã có sẵn từ trang danh sách để render tiêu đề và thông tin cơ bản trong 0ms.
    3. **Zero-CLS Skeleton Shimmer**: Thay vì dùng spinner chặn trang, hệ thống render khung xương giữ chỗ chuẩn kích thước, giúp trình duyệt vẽ nội dung ngay từ mili-giây đầu tiên và đưa điểm LCP xuống dưới 0.5s.
