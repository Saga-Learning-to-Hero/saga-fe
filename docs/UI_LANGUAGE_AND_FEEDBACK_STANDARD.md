# SAGA FE — Chuẩn mực Ngôn ngữ Giao diện và Phản hồi Người dùng (UI Language & Feedback Standard)

Tài liệu này quy định các chuẩn mực về cách sử dụng ngôn ngữ trên giao diện, cách hiển thị thông báo, và các luồng phản hồi thao tác của người dùng trong dự án SAGA Frontend. Bất kỳ component hay feature nào cũng phải tuân thủ nghiêm ngặt tài liệu này.

## 1. Chuẩn mực Thuật ngữ và Ngôn ngữ

- **100% Tiếng Việt trên giao diện**: Toàn bộ UI, văn bản, tiêu đề, nhãn (label), placeholder, tooltip, thông báo trạng thái, toast alert và modal đều phải dùng tiếng Việt chuẩn mực, rõ ràng, giàu tính học thuật.
- **Sử dụng từ "Task"**: 
  - Luôn giữ nguyên từ “Task” khi nói về đơn vị công việc trong hệ thống (đối chiếu với Jira Task). 
  - **Không** đổi “Task” thành “công việc” trong các trường hợp mang tính đếm, định lượng hoặc tên gọi thực thể.
  - *Đúng:* "3 Task", "Task đã hoàn thành", "Tổng số Task", "Chi tiết Task".
  - *Sai:* "3 công việc", "công việc đã hoàn thành", "tổng số công việc".
  - *Ngoại lệ:* Có thể dùng "Công việc" ở các văn cảnh mang tính tổng thể, trừu tượng (ví dụ: "Tiến độ công việc", "Khối lượng công việc").
- **Tính Minh Bạch Dựa Trên Dữ Liệu**: Mọi biểu đồ, bảng đối soát, ma trận đóng góp đều phải hiển thị minh chứng thực tế (Empirical Evidence) từ Jira và GitHub. Nội dung mô tả phải sát với dữ liệu hiển thị (ví dụ: "So sánh số Task còn lại theo kế hoạch với số Task còn lại thực tế trong Sprint").

## 2. Chuẩn mực Thông báo và Phản hồi Thao tác (Feedback Standard)

- **Sử dụng Toast Notification (Sonner)**: Mọi action (tạo, cập nhật, xóa, thao tác đồng bộ) đều phải sử dụng toast notification để thông báo kết quả cho người dùng.
- **Xử lý Lỗi Tập trung**: Bắt buộc xử lý lỗi qua helper chung của hệ thống (như `api-error.ts`) thay vì hiện string cứng, trừ các lỗi nghiệp vụ đặc thù cần catch riêng. **Tuyệt đối không dùng trực tiếp module `sonner` ngoài file wrapper chuẩn.**
- **Thông báo Mang tính Xây dựng**: Thông báo lỗi phải mang tính xây dựng, chỉ dẫn người dùng cách khắc phục thay vì chỉ báo lỗi kỹ thuật.
  - *Đúng:* "Không thể kết nối đến Jira. Vui lòng kiểm tra lại thiết lập tích hợp hoặc cấu hình mạng."
  - *Sai:* "Lỗi server", "Network error", "Fetch failed".
- **Không Import Lộn Xộn**: Luôn sử dụng wrapper toast của ứng dụng (`src/lib/api-error.ts` hoặc tương đương) thay vì gọi `import { toast } from "sonner"` ở mọi nơi.

## 3. Luồng Xác nhận Thao tác Nguy hiểm

- **Dùng ConfirmActionDialog**: Bất kỳ hành động nguy hiểm nào có khả năng gây mất dữ liệu hoặc thay đổi trạng thái không thể hoàn tác (ví dụ: xóa Task, thu hồi quyền, ngắt kết nối tích hợp, xóa Project) đều **BẮT BUỘC** phải thông qua một Dialog xác nhận.
- **Thống nhất Component**: Toàn hệ thống sẽ dùng chung một component `ConfirmActionDialog` duy nhất cho mục đích này. Tránh việc tạo ra các Dialog xác nhận (ConfirmDelete, ConfirmDisconnect, v.v.) rải rác và lặp lại logic ở nhiều nơi.
