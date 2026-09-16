# Historical regression snapshot — 14/09/2026

> Snapshot lịch sử được tạo từ lần chạy `npm test` thành công ngày 14/09/2026. Không dùng số liệu trong file này làm kết quả regression hiện hành. Xem [CURRENT_REGRESSION_2026-09-16.md](CURRENT_REGRESSION_2026-09-16.md) để lấy inventory canonical mới nhất.

```text
Test Files  39 passed (39)
Tests       425 passed (425)
Failed      0
```

## 1. Xác thực, lỗi API và hồ sơ

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/lib/api-error.spec.ts` | API error/session handling | 3 | 1 | 1 | 1 |
| `src/features/auth/api/auth-service.spec.ts` | Auth service | 35 | 9 | 19 | 7 |
| `src/features/auth/lib/role-routes.spec.ts` | Role routes | 3 | 1 | 1 | 1 |
| `src/features/profile/api/user-profile-service.spec.ts` | User profile service | 10 | 3 | 5 | 2 |
| **Subtotal** |  | **51** | **14** | **26** | **11** |

## 2. Quản trị học thuật

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/admin/academic/api/academic-service.spec.ts` | Academic service | 22 | 9 | 9 | 4 |
| `src/features/admin/academic/api/admin-lecturer-service.spec.ts` | Admin lecturer service | 5 | 2 | 2 | 1 |
| `src/features/admin/academic/api/course-service.spec.ts` | Course service | 11 | 4 | 5 | 2 |
| `src/features/admin/academic/api/roster-service.spec.ts` | Roster service | 20 | 7 | 9 | 4 |
| `src/features/admin/subjects/api/subject-service.spec.ts` | Subject service | 12 | 4 | 5 | 3 |
| `src/features/admin/subjects/api/syllabus-service.spec.ts` | Syllabus service | 14 | 7 | 5 | 2 |
| **Subtotal** |  | **84** | **33** | **35** | **16** |

## 3. Giảng viên, môn học, nhóm và contribution

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/lecturer/courses/api/lecturer-course-service.spec.ts` | Lecturer course service | 14 | 4 | 6 | 4 |
| `src/features/lecturer/courses/lib/course-routes.spec.ts` | Lecturer course routes | 7 | 3 | 2 | 2 |
| `src/features/lecturer/courses/lib/format-query-updated-at.spec.ts` | Query timestamp formatting | 3 | 1 | 1 | 1 |
| `src/features/lecturer/teams/api/lecturer-team-service.spec.ts` | Lecturer team service | 31 | 7 | 14 | 10 |
| `src/features/lecturer/teams/components/move-team-member-dialog.spec.tsx` | Move member dialog | 3 | 1 | 1 | 1 |
| `src/features/student/courses/api/student-course-service.spec.ts` | Student course service | 9 | 2 | 4 | 3 |
| `src/features/lecturer/contribution/api/lecturer-weights-service.spec.ts` | Lecturer weights service | 12 | 4 | 5 | 3 |
| `src/features/lecturer/contribution/api/project-weights-service.spec.ts` | Project weights service | 11 | 2 | 5 | 4 |
| `src/features/lecturer/contribution/api/team-contribution-service.spec.ts` | Team contribution service | 12 | 2 | 7 | 3 |
| `src/features/lecturer/contribution/lib/contribution-utils.spec.ts` | Contribution utility functions | 17 | 6 | 5 | 6 |
| **Subtotal** |  | **119** | **32** | **50** | **37** |

## 4. Project, integrations và realtime

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/integrations/api/user-integrations-service.spec.ts` | User integrations service | 5 | 1 | 2 | 2 |
| `src/features/integrations/api/user-integrations-refresh-flow.spec.ts` | OAuth refresh flow | 7 | 4 | 1 | 2 |
| `src/features/student/project/api/project-projection-service.spec.ts` | Project projection/sync service | 19 | 8 | 9 | 2 |
| `src/features/student/project/components/project-realtime-badge.spec.tsx` | Project realtime badge | 4 | 3 | 0 | 1 |
| `src/features/student/project/hooks/use-project-realtime.spec.ts` | SSE realtime hook | 11 | 5 | 2 | 4 |
| **Subtotal** |  | **46** | **21** | **14** | **11** |

## 5. Minh chứng và work sessions

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/student/sprint-progress/api/task-evidence-service.spec.ts` | Work sessions, web links, files and contribution confirmation | 30 | 10 | 16 | 4 |
| **Subtotal** |  | **30** | **10** | **16** | **4** |

## 6. Sprint, Jira tasks và commits

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/student/sprint-progress/api/project-sprint-service.spec.ts` | Project sprint service | 11 | 6 | 3 | 2 |
| `src/features/student/sprint-progress/api/project-task-service.spec.ts` | Project task service | 12 | 8 | 3 | 1 |
| `src/features/student/sprint-progress/lib/issue-collection.spec.ts` | Jira issue/subtask hierarchy | 3 | 3 | 0 | 0 |
| `src/features/student/sprint-progress/lib/optimistic-sprint-state.spec.ts` | Optimistic sprint state | 3 | 1 | 1 | 1 |
| `src/features/student/sprint-progress/lib/task-mapper.spec.ts` | Task mapper | 7 | 4 | 1 | 2 |
| `src/features/student/commits/lib/commit-mapper.spec.ts` | Commit mapper | 3 | 1 | 1 | 1 |
| **Subtotal** |  | **39** | **23** | **9** | **7** |

## 7. Graph/Pipeline, dashboard và student contribution

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/graph/components/pipeline-flow-view.spec.tsx` | Pipeline flow UI | 9 | 5 | 3 | 1 |
| `src/features/graph/components/traceability-graph-view.spec.ts` | Traceability graph defaults | 1 | 1 | 0 | 0 |
| `src/features/graph/hooks/use-pipeline-graph-data.spec.ts` | Pipeline graph data hook | 4 | 3 | 0 | 1 |
| `src/features/graph/lib/pipeline-mapper.spec.ts` | Pipeline mapper | 13 | 5 | 5 | 3 |
| `src/features/progress/lib/progress-format.spec.ts` | Dashboard/progress formatting | 17 | 8 | 5 | 4 |
| `src/features/student/contribution/lib/contribution-view-utils.spec.ts` | Student contribution view utilities | 9 | 5 | 1 | 3 |
| `src/features/student/assessment/lib/peer-assessment-state.spec.ts` | Peer assessment state | 3 | 1 | 1 | 1 |
| **Subtotal** |  | **56** | **28** | **15** | **13** |

## Tổng hợp

| Test files | Tests | Passed | Failed | N | A | B |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **39** | **425** | **425** | **0** | **161** | **165** | **99** |

## Những phạm vi chưa được chứng minh bởi test suite này

- Không có E2E/browser test chạy với Jira, GitHub hoặc Railway thật.
- Không có assertion coverage threshold. Coverage config chỉ tính `api` và `lib`, không tính component/hook.
- `StudentProjectService` được nhắc trong báo cáo lịch sử nhưng chưa có file `student-project-service.spec.ts` trong source hiện tại.
- Step-up re-authentication cho contribution confirmation chưa có test service/UI riêng trong suite hiện tại.
