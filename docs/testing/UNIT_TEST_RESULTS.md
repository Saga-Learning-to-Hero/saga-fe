# Báo cáo kiểm thử đơn vị — SAGA Frontend

## Kết quả regression hiện hành

| Thuộc tính | Giá trị |
| --- | --- |
| Lần chạy gần nhất | 14/09/2026 |
| Lệnh thực thi | `npm test` |
| Framework | Vitest 4.1.11 + jsdom |
| Test files | **39 passed / 39** |
| Test cases | **425 passed / 425** |
| Failed | **0** |
| Normal / Abnormal / Boundary | **161 / 165 / 99** |

Kết quả này là nguồn số liệu nghiệm thu hiện hành. Không dùng các con số `240/240` hoặc `17 test files` của các báo cáo lịch sử làm kết quả regression mới nhất.

## Phạm vi regression

| Nhóm kiểm thử | Files | Tests | N | A | B | Báo cáo chi tiết |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Xác thực, lỗi API và hồ sơ | 4 | 51 | 14 | 26 | 11 | [Current regression](CURRENT_REGRESSION_2026-09-14.md#1-xác-thực-lỗi-api-và-hồ-sơ) |
| Quản trị học thuật | 6 | 84 | 33 | 35 | 16 | [Current regression](CURRENT_REGRESSION_2026-09-14.md#2-quản-trị-học-thuật) |
| Giảng viên, môn học, nhóm và contribution | 10 | 119 | 32 | 50 | 37 | [Current regression](CURRENT_REGRESSION_2026-09-14.md#3-giảng-viên-môn-học-nhóm-và-contribution) |
| Project, integrations và realtime | 5 | 46 | 21 | 14 | 11 | [Current regression](CURRENT_REGRESSION_2026-09-14.md#4-project-integrations-và-realtime) |
| Minh chứng và work sessions | 1 | 30 | 10 | 16 | 4 | [Current regression](CURRENT_REGRESSION_2026-09-14.md#5-minh-chứng-và-work-sessions) |
| Sprint, Jira tasks và commits | 6 | 39 | 23 | 9 | 7 | [Current regression](CURRENT_REGRESSION_2026-09-14.md#6-sprint-jira-tasks-và-commits) |
| Graph/Pipeline, dashboard và student contribution | 7 | 56 | 28 | 15 | 13 | [Current regression](CURRENT_REGRESSION_2026-09-14.md#7-graphpipeline-dashboard-và-student-contribution) |
| **Tổng cộng** | **39** | **425** | **161** | **165** | **99** | |

`N` = Normal, `A` = Abnormal, `B` = Boundary.

## Các báo cáo lịch sử

Các file bên dưới ghi nhận từng đợt nghiệm thu trước ngày 14/09/2026. Chúng vẫn được giữ để truy vết lỗi và tiến trình sửa lỗi, nhưng số test trong chúng là snapshot lịch sử, không phải tổng hiện hành.

1. [01 — Auth](01_AUTH_UNIT_TEST_REPORT.md)
2. [02 — Admin academic](02_ADMIN_ACADEMIC_UNIT_TEST_REPORT.md)
3. [03 — Lecturer, course, team](03_LECTURER_COURSE_TEAM_UNIT_TEST_REPORT.md)
4. [04 — Student project & integrations](04_STUDENT_PROJECT_INTEGRATIONS_UNIT_TEST_REPORT.md)
5. [05 — Task evidence & work sessions](05_TASK_EVIDENCE_WORK_SESSIONS_UNIT_TEST_REPORT.md)

## Cách chạy và giới hạn coverage

```bash
npm test
npm run test:coverage
npm run lint
npx tsc --noEmit
```

- `npm test` là kết quả regression được báo cáo ở trên.
- `test:coverage` hiện chỉ đo các file `src/**/api/*.ts` và `src/lib/*.ts`; component và hook chưa nằm trong coverage denominator.
- Vì vậy **425/425 passed không đồng nghĩa code coverage 100%**. Đây là pass rate của test suite, không phải tỷ lệ dòng lệnh đã được bao phủ.

## Quy tắc cập nhật báo cáo

Khi thêm, xóa hoặc đổi test:

1. Chạy lại `npm test` từ root `saga-fe`.
2. Cập nhật [current regression](CURRENT_REGRESSION_2026-09-14.md) với file test, số case và phân loại N/A/B.
3. Cập nhật bảng tổng hợp trong file này.
4. Nếu test thuộc một báo cáo lịch sử, tạo một mục regression mới thay vì sửa số liệu của lần chạy lịch sử.
