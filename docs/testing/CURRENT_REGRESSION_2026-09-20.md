# Current regression — 20/09/2026

> Snapshot canonical cho nhánh `feat/SAGA-91-admin-dashboard` trước khi commit và chờ người dùng review. Kết quả được xác minh bằng `npm test` từ root `saga-fe`.

```text
Test Files  85 passed (85)
Tests       811 passed (811)
Failed      0
Duration    18.90s
N / A / B   354 / 268 / 189
```

## Phân nhóm hiện hành

| Nhóm kiểm thử | Files | Tests | N | A | B |
| --- | ---: | ---: | ---: | ---: | ---: |
| Xác thực, lỗi API và hồ sơ | 8 | 80 | 24 | 38 | 18 |
| Admin học thuật, users và audit | 11 | 134 | 57 | 47 | 30 |
| Admin Dashboard và analytics | 7 | 36 | 17 | 9 | 10 |
| Giảng viên | 14 | 150 | 46 | 57 | 47 |
| Student course, project, integrations và realtime | 7 | 72 | 32 | 23 | 17 |
| Notification Center, user realtime và Web Push | 5 | 43 | 24 | 13 | 6 |
| Student peer review | 7 | 43 | 14 | 18 | 11 |
| Sprint, Jira tasks, commits và evidence | 13 | 121 | 67 | 35 | 19 |
| Graph và Pipeline | 11 | 106 | 60 | 22 | 24 |
| Progress và student contribution | 2 | 26 | 13 | 6 | 7 |
| **Tổng cộng** | **85** | **811** | **354** | **268** | **189** |

`N` = Normal, `A` = Abnormal, `B` = Boundary. Reporter xem test không có nhãn loại là Normal.

## Phần tăng thêm cho SAGA-91

Admin Dashboard bổ sung 4 file, 17 test (`N=10`, `A=2`, `B=5`) cho service contract, query/mutation cache, formatting và các section hiển thị canonical data. Chi tiết tại [06_ADMIN_DASHBOARD_UNIT_TEST_REPORT.md](06_ADMIN_DASHBOARD_UNIT_TEST_REPORT.md).

## Xác minh bổ sung

- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- BE Admin Dashboard: 16 test classes, 107 tests, 0 failure/error/skip.
- Browser visual QA chưa thực hiện được vì in-app Browser không khả dụng trong phiên làm việc này.
- Snapshot này là unit/component regression; không thay thế E2E với API deploy thật.

