# 📑 BÁO CÁO KIỂM THỬ ĐƠN VỊ — PHÂN HỆ MINH CHỨNG CÔNG SỨC & PHIÊN LÀM VIỆC (DEV 1 — SAGA-57)

| **Thông tin dự án** | **Chi tiết** |
| :--- | :--- |
| **Dự án** | SAGA — Academic Graph Analytics System |
| **Phân hệ** | Frontend Web Application (`saga-fe`) |
| **Nhóm nghiệp vụ** | **Phân hệ Thu thập Minh chứng, Bấm giờ Phiên làm việc & Xác nhận Đóng góp (Dev 1 — SAGA-57)** |
| **Các Service kiểm thử** | `TaskEvidenceService` |
| **Nhánh Git** | `feat/SAGA-57-task-evidence` |
| **Framework kiểm thử** | Vitest 4.1.11 + V8 Coverage + helper `fptTest` (`UTCID` + `[N]`/`[A]`/`[B]`) |
| **Tiêu chuẩn áp dụng** | Quy chuẩn Mẫu Báo cáo Kiểm thử Đơn vị — FPT University Capstone Project |
| **Ngày thực thi** | **09/09/2026** |
| **Lệnh thực thi** | `npx vitest run src/features/student/sprint-progress/api/task-evidence-service.spec.ts --reporter=verbose` |
| **Trạng thái nghiệm thu** | <mark style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold;">✅ 100% PASSED (30/30 Test Cases)</mark> |

---

## 🔄 NHẬT KÝ THỰC THI (TEST EXECUTION LOG)

> Báo cáo này ghi nhận **kết quả kiểm thử đơn vị thực tế** được thực hiện trên nhánh `feat/SAGA-57-task-evidence` ngày `09/09/2026`. Bộ kiểm thử gồm 30 ca kiểm thử bao phủ toàn bộ 10 API endpoints thuộc phân hệ Minh chứng công sức (Task Evidence & Work Sessions), đạt 100% tỷ lệ thành công.

### 📊 Bảng Kết Quả Chạy Nghiệm Thu

| Đợt Kiểm Thử (Run) | Thời Gian Thực Hiện | Tổng Số Ca | Số Ca Đạt (Passed) | Số Ca Lỗi (Failed) | Tỷ Lệ Đạt (Pass Rate) | Ghi Chú |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Nghiệm thu SAGA-57** | `09/09/2026 - 21:50` | 30 | **30** | **0** | **100.00%** | Bao phủ 10 API endpoints, Vitest 4.1.11 + jsdom |

```text
Kết quả chạy Vitest (TaskEvidenceService):
Test Files  1 passed (1)
     Tests  30 passed (30)
  Duration  2.42s

TaskEvidenceService : 30/30 PASSED (10 Normal, 16 Abnormal, 4 Boundary)
```

---

## 📊 PHẦN 1: BẢNG THỐNG KÊ TỔNG HỢP (STATISTICS)

| STT | Tên Service / Module | Mã Module | Passed | Failed | Normal (N) | Abnormal (A) | Boundary (B) | Tổng Số Ca | Ngày Thực Thi |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **`TaskEvidenceService`** (Bấm giờ, Liên kết, Tệp & Xác nhận đóng góp) | `STU_EVI` | **`30`** | `0` | `10` | `16` | `4` | **`30`** | `09/09/2026` |
| | **TỔNG CỘNG PHÂN HỆ SAGA-57** | — | **`30`** | **`0`** | **`10`** | **`16`** | **`4`** | **`30`** | `09/09/2026` |

<br/>

### 🎯 Phân Tích Tỷ Lệ Bao Phủ & Phân Loại Ca Kiểm Thử (SAGA-57)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  📈 Tỷ lệ kiểm thử thành công                 : 100.00% (30/30 Passed)       │
│  🔹 Ca kiểm thử luồng chuẩn (Normal - N)      : 33.33%  (10/30 Cases)        │
│  🔸 Ca kiểm thử luồng ngoại lệ (Abnormal - A) : 53.33%  (16/30 Cases)        │
│  ▫️ Ca kiểm thử giá trị biên (Boundary - B)   : 13.33%  (4/30 Cases)         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 PHẦN 2: MA TRẬN ĐỐI SOÁT CHI TIẾT 30 CA KIỂM THỬ (DECISION MATRIX)

| Mã Ca (UTCID) | Loại Ca | Mô Tả Ca Kiểm Thử | Dữ Liệu Đầu Vào (Input) | Kết Quả Kỳ Vọng (Expected Output) | Trạng Thái |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **`UTCID01`** | `[N]` | `POST /api/tasks/{taskId}/work-sessions/start` bắt đầu phiên làm việc | `taskId` hợp lệ | Trả về `{ id, status: "OPEN" }` | ✅ Pass |
| **`UTCID02`** | `[A]` | `startWorkSession` ném lỗi khi `taskId` rỗng | `taskId = ""` hoặc `"   "` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID03`** | `[A]` | `startWorkSession` không nuốt lỗi khi máy chủ trả về 404 | Mock Backend 404 Not Found | Ném ngoại lệ lỗi `Task not found` | ✅ Pass |
| **`UTCID04`** | `[N]` | `POST /api/tasks/{taskId}/work-sessions/{sessionId}/stop` dừng phiên | `taskId`, `sessionId` hợp lệ | Trả về `{ id, status: "STOPPED" }` | ✅ Pass |
| **`UTCID05`** | `[A]` | `stopWorkSession` ném lỗi khi `sessionId` rỗng | `sessionId = ""` hoặc `"   "` | Ném ngoại lệ `Error("sessionId is required")` | ✅ Pass |
| **`UTCID06`** | `[A]` | `stopWorkSession` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID07`** | `[N]` | `GET /api/tasks/{taskId}/web-links` lấy danh sách URL đính kèm | `taskId` hợp lệ | Trả về mảng `TaskWebLinkItem[]` | ✅ Pass |
| **`UTCID08`** | `[B]` | `getWebLinks` trả về mảng rỗng khi máy chủ trả về `null` | Mock Backend response data `null` | Trả về mảng rỗng `[]` | ✅ Pass |
| **`UTCID09`** | `[A]` | `getWebLinks` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID10`** | `[N]` | `POST /api/tasks/{taskId}/web-links` thêm liên kết tài liệu mới | `url`, `title` hợp lệ (có khoảng trắng) | Trim dữ liệu và trả về link tạo mới HTTP 201 | ✅ Pass |
| **`UTCID11`** | `[B]` | `addWebLink` xử lý hợp lệ khi không truyền `title` | `url` hợp lệ, `title = undefined` | Gửi payload kèm `title = ""` | ✅ Pass |
| **`UTCID12`** | `[A]` | `addWebLink` ném lỗi khi `url` rỗng | `url = ""` hoặc `"   "` | Ném ngoại lệ `Error("URL is required")` | ✅ Pass |
| **`UTCID13`** | `[A]` | `addWebLink` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID14`** | `[N]` | `GET /api/tasks/{taskId}/files` lấy danh sách tệp đính kèm | `taskId` hợp lệ | Trả về mảng `TaskFileItem[]` | ✅ Pass |
| **`UTCID15`** | `[B]` | `getFiles` trả về mảng rỗng khi máy chủ trả về `null` | Mock Backend response data `null` | Trả về mảng rỗng `[]` | ✅ Pass |
| **`UTCID16`** | `[A]` | `getFiles` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID17`** | `[N]` | `POST /api/tasks/{taskId}/files` tải lên tệp tin minh chứng | `File` đối tượng nhị phân hợp lệ | Gửi `multipart/form-data`, trả về HTTP 201 | ✅ Pass |
| **`UTCID18`** | `[A]` | `uploadFile` ném lỗi khi file `null` hoặc `undefined` | `file = null` | Ném ngoại lệ `Error("file is required")` | ✅ Pass |
| **`UTCID19`** | `[A]` | `uploadFile` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID20`** | `[N]` | `GET /api/tasks/{taskId}/files/{fileId}` tải file về máy | `taskId`, `fileId` hợp lệ | Trả về đối tượng `Blob` nhị phân | ✅ Pass |
| **`UTCID21`** | `[A]` | `downloadFile` ném lỗi khi `fileId` rỗng | `fileId = ""` | Ném ngoại lệ `Error("fileId is required")` | ✅ Pass |
| **`UTCID22`** | `[A]` | `downloadFile` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID23`** | `[N]` | `DELETE /api/tasks/{taskId}/files/{fileId}` xóa tệp đính kèm | `taskId`, `fileId` hợp lệ | Gọi `apiClient.delete` đúng URI | ✅ Pass |
| **`UTCID24`** | `[A]` | `deleteFile` ném lỗi khi `fileId` rỗng | `fileId = ""` | Ném ngoại lệ `Error("fileId is required")` | ✅ Pass |
| **`UTCID25`** | `[N]` | `DELETE /api/tasks/{taskId}/web-links/{linkId}` xóa link | `taskId`, `linkId` hợp lệ | Gọi `apiClient.delete` đúng URI | ✅ Pass |
| **`UTCID26`** | `[A]` | `deleteWebLink` ném lỗi khi `linkId` rỗng | `linkId = ""` | Ném ngoại lệ `Error("linkId is required")` | ✅ Pass |
| **`UTCID27`** | `[A]` | `deleteWebLink` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
| **`UTCID28`** | `[N]` | `POST /api/tasks/{taskId}/contribution-confirmations` xác nhận đóng góp | `commitShas`, `pullRequests` hợp lệ | Trả về `{ id, evidenceHash, state: "CONFIRMED" }` | ✅ Pass |
| **`UTCID29`** | `[B]` | `confirmContribution` xử lý an toàn khi payload rỗng | `payload = {}` | Gửi mảng rỗng `commitShas: []`, `pullRequests: []` | ✅ Pass |
| **`UTCID30`** | `[A]` | `confirmContribution` ném lỗi khi `taskId` rỗng | `taskId = ""` | Ném ngoại lệ `Error("taskId is required")` | ✅ Pass |
