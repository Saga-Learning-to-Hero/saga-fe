# Báo cáo kiểm thử đơn vị — SAGA Frontend

## Kết quả regression hiện hành

| Thuộc tính | Giá trị |
| --- | --- |
| Lần chạy gần nhất | 16/09/2026 |
| Nhánh | `feat/SAGA-76-notification-center-and-firebase-web-push` |
| Commit kiểm tra | `6a05e3c` |
| Lệnh thực thi | `npm test` |
| Framework | Vitest 4.1.11 + jsdom |
| Test files | **66 passed / 66** |
| Test cases | **643 passed / 643** |
| Failed | **0** |
| Normal / Abnormal / Boundary | **270 / 228 / 145** |
| Thời gian Vitest báo cáo | **14.24s** |

Nguồn chi tiết canonical: [Current regression 16/09/2026](CURRENT_REGRESSION_2026-09-16.md).

Không dùng các số `39 files / 425 tests`, `240/240` hoặc `17 test files` của snapshot cũ làm kết quả hiện hành.

## Phạm vi regression

| Nhóm kiểm thử | Files | Tests | N | A | B | Báo cáo chi tiết |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Xác thực, lỗi API và hồ sơ | 7 | 70 | 20 | 35 | 15 | [Mục 1](CURRENT_REGRESSION_2026-09-16.md#1-xác-thực-lỗi-api-và-hồ-sơ) |
| Quản trị học thuật | 6 | 84 | 33 | 35 | 16 | [Mục 2](CURRENT_REGRESSION_2026-09-16.md#2-quản-trị-học-thuật) |
| Giảng viên, course, team, contribution và peer review | 13 | 143 | 43 | 56 | 44 | [Mục 3](CURRENT_REGRESSION_2026-09-16.md#3-giảng-viên-course-team-contribution-và-peer-review) |
| Student course, project, integrations và realtime | 7 | 63 | 29 | 19 | 15 | [Mục 4](CURRENT_REGRESSION_2026-09-16.md#4-student-course-project-integrations-và-realtime) |
| Notification Center, user realtime và Web Push | 5 | 42 | 23 | 13 | 6 | [Mục 5](CURRENT_REGRESSION_2026-09-16.md#5-notification-center-user-realtime-và-web-push) |
| Student peer review | 7 | 43 | 14 | 18 | 11 | [Mục 6](CURRENT_REGRESSION_2026-09-16.md#6-student-peer-review) |
| Sprint, Jira tasks, commits và evidence | 10 | 97 | 52 | 30 | 15 | [Mục 7](CURRENT_REGRESSION_2026-09-16.md#7-sprint-jira-tasks-commits-và-evidence) |
| Graph và Pipeline | 9 | 75 | 43 | 16 | 16 | [Mục 8](CURRENT_REGRESSION_2026-09-16.md#8-graph-và-pipeline) |
| Progress và student contribution | 2 | 26 | 13 | 6 | 7 | [Mục 9](CURRENT_REGRESSION_2026-09-16.md#9-progress-và-student-contribution) |
| **Tổng cộng** | **66** | **643** | **270** | **228** | **145** | |

`N` = Normal, `A` = Abnormal, `B` = Boundary. Custom reporter mặc định coi test không có nhãn loại là Normal.

## Snapshot lịch sử

Các file dưới đây được giữ để truy vết từng đợt nghiệm thu. Số liệu trong chúng không thay thế regression hiện hành:

1. [Regression 14/09/2026 — 39 files, 425 tests](CURRENT_REGRESSION_2026-09-14.md)
2. [01 — Auth](01_AUTH_UNIT_TEST_REPORT.md)
3. [02 — Admin academic](02_ADMIN_ACADEMIC_UNIT_TEST_REPORT.md)
4. [03 — Lecturer, course, team](03_LECTURER_COURSE_TEAM_UNIT_TEST_REPORT.md)
5. [04 — Student project & integrations](04_STUDENT_PROJECT_INTEGRATIONS_UNIT_TEST_REPORT.md)
6. [05 — Task evidence & work sessions](05_TASK_EVIDENCE_WORK_SESSIONS_UNIT_TEST_REPORT.md)

## Cách chạy và giới hạn coverage

```bash
npm test
npm run test:coverage
npm run lint
npx tsc --noEmit
```

- `npm test` là nguồn pass/fail và số lượng test trong báo cáo này.
- `npm run test:coverage` ngày 16/09/2026 cũng chạy thành công 66 files/643 tests và ghi nhận phạm vi được instrument như sau:

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

Giữ unit/component test colocated cạnh source là phù hợp với kiến trúc feature-based hiện tại:

```text
src/features/notification/api/
├── notification-service.ts
└── notification-service.spec.ts
```

Không nên di chuyển hàng loạt 66 file test sang một thư mục riêng vì sẽ làm mất tính đồng sở hữu giữa module và test mà không cải thiện khả năng chạy test. Chỉ tạo thư mục cấp cao riêng cho test xuyên module:

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
