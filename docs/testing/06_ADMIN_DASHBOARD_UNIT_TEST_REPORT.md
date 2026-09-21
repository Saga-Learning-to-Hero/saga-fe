# 06 — Admin Dashboard SAGA-91

## Phạm vi

Kiểm thử phần FE tích hợp `GET /api/admin/dashboard/summary` và force refresh theo contract canonical của Backend. Bộ test không dùng lại các field mock cũ như `projectHealthDistribution`, `sprintMilestones` hoặc provider health giả lập.

| Test file | Mục tiêu | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `tests/unit/features/admin/dashboard/api/admin-dashboard-service.spec.ts` | Query params, force refresh và response canonical | 5 | 3 | 1 | 1 |
| `tests/unit/features/admin/dashboard/hooks/use-admin-dashboard.spec.tsx` | Query cache, mutation thành công và lỗi | 3 | 1 | 1 | 1 |
| `tests/unit/features/admin/dashboard/lib/dashboard-format.spec.ts` | Phần trăm nullable, date/time và enum labels | 6 | 4 | 0 | 2 |
| `tests/unit/features/admin/dashboard/components/dashboard-sections.spec.tsx` | KPI, timeline, pulse và cảnh báo canonical | 3 | 2 | 0 | 1 |
| **Tổng cộng** |  | **17** | **10** | **2** | **5** |

## Kết quả

```text
4 test files passed
17 tests passed
0 failed
```

## Contract được bảo vệ

- Semester filter lấy từ `availableSemesters`, không hard-code.
- Tỷ lệ nullable hiển thị “Chưa có dữ liệu”, không biến thành `0%` giả.
- Force refresh ghi response canonical vào query cache và xử lý `refreshPending`.
- Weekly timeline phân biệt commit trong tuần, task Done hiện tại và traceability.
- `integrationPulse` chỉ biểu diễn số delivery webhook duy nhất, không suy diễn thành trạng thái Jira/GitHub.
- Cảnh báo team chưa kết nối hỗ trợ `PROJECT`, `JIRA`, `GITHUB`, `BOTH`.

## Giới hạn

- Chưa có browser E2E với tài khoản Admin và Backend deploy thật.
- Visual QA bằng in-app Browser chưa chạy được trong phiên này vì Browser không khả dụng.
- Coverage aggregate chưa chạy lại; không suy 17/17 passed thành coverage 100%.

