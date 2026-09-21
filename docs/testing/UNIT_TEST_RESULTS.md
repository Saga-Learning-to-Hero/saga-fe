# Báo cáo kiểm thử đơn vị — SAGA Frontend

## Kết quả regression hiện hành

| Thuộc tính | Giá trị |
| --- | --- |
| Lần chạy gần nhất | 20/09/2026 |
| Nhánh | `feat/SAGA-91-admin-dashboard` |
| Commit kiểm tra | Chưa commit — bản chờ review |
| Lệnh thực thi | `npm test` |
| Framework | Vitest 4.1.11 + jsdom |
| Test files | **85 passed / 85** |
| Test cases | **811 passed / 811** |
| Failed | **0** |
| Normal / Abnormal / Boundary | **354 / 268 / 189** |
| Thời gian Vitest báo cáo | **18.90s** |

Nguồn chi tiết canonical: [Current regression 20/09/2026](CURRENT_REGRESSION_2026-09-20.md).

Không dùng các số `39 files / 425 tests`, `240/240` hoặc `17 test files` của snapshot cũ làm kết quả hiện hành.

## Phạm vi regression

| Nhóm kiểm thử | Files | Tests | N | A | B | Báo cáo chi tiết |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Xác thực, lỗi API và hồ sơ | 8 | 80 | 24 | 38 | 18 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Admin học thuật, users và audit | 11 | 134 | 57 | 47 | 30 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Admin Dashboard và analytics | 7 | 36 | 17 | 9 | 10 | [Báo cáo SAGA-91](06_ADMIN_DASHBOARD_UNIT_TEST_REPORT.md) |
| Giảng viên | 14 | 150 | 46 | 57 | 47 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Student course, project, integrations và realtime | 7 | 72 | 32 | 23 | 17 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Notification Center, user realtime và Web Push | 5 | 43 | 24 | 13 | 6 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Student peer review | 7 | 43 | 14 | 18 | 11 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Sprint, Jira tasks, commits và evidence | 13 | 121 | 67 | 35 | 19 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Graph và Pipeline | 11 | 106 | 60 | 22 | 24 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| Progress và student contribution | 2 | 26 | 13 | 6 | 7 | [Snapshot](CURRENT_REGRESSION_2026-09-20.md) |
| **Tổng cộng** | **85** | **811** | **354** | **268** | **189** | |

`N` = Normal, `A` = Abnormal, `B` = Boundary. Custom reporter mặc định coi test không có nhãn loại là Normal.

## Snapshot lịch sử

Các file dưới đây được giữ để truy vết từng đợt nghiệm thu. Số liệu trong chúng không thay thế regression hiện hành:

1. [Regression 16/09/2026 — 66 files, 643 tests](CURRENT_REGRESSION_2026-09-16.md)
2. [Regression 14/09/2026 — 39 files, 425 tests](CURRENT_REGRESSION_2026-09-14.md)
3. [01 — Auth](01_AUTH_UNIT_TEST_REPORT.md)
4. [02 — Admin academic](02_ADMIN_ACADEMIC_UNIT_TEST_REPORT.md)
5. [03 — Lecturer, course, team](03_LECTURER_COURSE_TEAM_UNIT_TEST_REPORT.md)
6. [04 — Student project & integrations](04_STUDENT_PROJECT_INTEGRATIONS_UNIT_TEST_REPORT.md)
7. [05 — Task evidence & work sessions](05_TASK_EVIDENCE_WORK_SESSIONS_UNIT_TEST_REPORT.md)
8. [06 — Admin Dashboard SAGA-91](06_ADMIN_DASHBOARD_UNIT_TEST_REPORT.md)

## Cách chạy và giới hạn coverage

```bash
npm test
npm run test:coverage
npm run lint
npx tsc --noEmit
```

- `npm test` ngày 20/09/2026 là nguồn pass/fail và số lượng test hiện hành trong báo cáo này.
- Bảng coverage dưới đây là snapshot gần nhất ngày 16/09/2026 trên 66 files/643 tests; chưa chạy lại coverage cho snapshot 20/09/2026 nên không được hiểu là coverage của 811 test hiện hành.

| Metric | Covered / Total | Tỷ lệ |
| --- | ---: | ---: |
| Statements | 842 / 1145 | 73.53% |
| Branches | 774 / 1193 | 64.87% |
| Functions | 174 / 198 | 87.87% |
| Lines | 835 / 1109 | 75.29% |

- Coverage hiện chỉ đo `src/**/api/*.ts` và `src/lib/*.ts`; component, hook và page chưa nằm đầy đủ trong denominator.
- Một số API file được include nhưng chưa có test trực tiếp, nổi bật là personal integration services và `student-project-service.ts`; tổng phần trăm cần được đọc theo từng file, không chỉ nhìn aggregate.
- **643/643 passed không đồng nghĩa code coverage 100%** và không chứng minh các integration thật với Jira, GitHub, Firebase hoặc Railway.
- Chưa cấu hình coverage threshold bắt buộc trong `vitest.config.mts`.

## Cấu trúc file test

Unit/component test hiện được tập trung theo cấu trúc phản chiếu source:

```text
tests/unit/features/admin/dashboard/
├── api/admin-dashboard-service.spec.ts
├── components/dashboard-sections.spec.tsx
├── hooks/use-admin-dashboard.spec.tsx
└── lib/dashboard-format.spec.ts
```

Giữ cấu trúc này nhất quán; không trộn trở lại test vào source nếu không có quyết định kiến trúc chung. Test xuyên module tiếp tục tách riêng:

```text
tests/
├── integration/
└── e2e/

src/testing/
├── fixtures/
├── fpt-reporter.ts
└── test-utils.tsx
```

## Quy tắc cập nhật báo cáo

Khi thêm, xóa hoặc đổi test:

1. Chạy lại `npm test` từ root `saga-fe`.
2. Tạo snapshot `CURRENT_REGRESSION_YYYY-MM-DD.md` mới; không ghi đè snapshot lịch sử khác ngày.
3. Cập nhật tổng file, test, N/A/B và link canonical trong file này.
4. Ghi riêng giới hạn chưa được test; không suy pass rate thành coverage hoặc E2E assurance.
5. Chạy `npx tsc --noEmit`, `npm run lint` và `git diff --check` trước khi chốt release.
