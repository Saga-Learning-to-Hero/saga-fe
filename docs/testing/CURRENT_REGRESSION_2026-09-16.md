# Current regression — 16/09/2026

> Canonical test inventory cho nhánh `feat/SAGA-76-notification-center-and-firebase-web-push`. Số liệu được xác minh bằng một lần chạy `npm test` thành công ngày 16/09/2026.

```text
Test Files  66 passed (66)
Tests       643 passed (643)
Failed      0
Duration    14.24s
```

## 1. Xác thực, lỗi API và hồ sơ

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/lib/api-error.spec.ts` | API error/session handling | 6 | 2 | 2 | 2 |
| `src/features/auth/api/auth-service.spec.ts` | Auth service và CSRF lifecycle | 39 | 10 | 21 | 8 |
| `src/features/auth/components/step-up-auth-dialog.spec.tsx` | Step-up password và retry một lần | 6 | 2 | 3 | 1 |
| `src/features/auth/lib/logout-orchestrator.spec.ts` | Logout orchestration | 4 | 1 | 2 | 1 |
| `src/features/auth/lib/role-routes.spec.ts` | Role routes | 3 | 1 | 1 | 1 |
| `src/features/auth/store/useAuthStore.spec.ts` | Auth store isolation | 2 | 1 | 1 | 0 |
| `src/features/profile/api/user-profile-service.spec.ts` | User profile service | 10 | 3 | 5 | 2 |
| **Subtotal** |  | **70** | **20** | **35** | **15** |

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

## 3. Giảng viên, course, team, contribution và peer review

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/lecturer/courses/api/lecturer-course-service.spec.ts` | Lecturer course service | 14 | 4 | 6 | 4 |
| `src/features/lecturer/courses/lib/course-routes.spec.ts` | Lecturer course routes | 9 | 5 | 2 | 2 |
| `src/features/lecturer/courses/lib/format-query-updated-at.spec.ts` | Query timestamp formatting | 3 | 1 | 1 | 1 |
| `src/features/lecturer/teams/api/lecturer-team-service.spec.ts` | Lecturer team service | 31 | 7 | 14 | 10 |
| `src/features/lecturer/teams/components/move-team-member-dialog.spec.tsx` | Move member dialog | 3 | 1 | 1 | 1 |
| `src/features/lecturer/contribution/api/lecturer-weights-service.spec.ts` | Lecturer weights service | 12 | 4 | 5 | 3 |
| `src/features/lecturer/contribution/api/project-weights-service.spec.ts` | Project weights service | 11 | 2 | 5 | 4 |
| `src/features/lecturer/contribution/api/team-contribution-service.spec.ts` | Team contribution service | 12 | 2 | 7 | 3 |
| `src/features/lecturer/contribution/lib/contribution-utils.spec.ts` | Contribution utilities | 17 | 6 | 5 | 6 |
| `src/features/lecturer/peer-review/api/lecturer-peer-review-service.spec.ts` | Lecturer peer-review service | 8 | 2 | 4 | 2 |
| `src/features/lecturer/peer-review/components/lecturer-peer-review-page.spec.tsx` | Lecturer peer-review page | 12 | 5 | 3 | 4 |
| `src/features/lecturer/peer-review/hooks/use-lecturer-peer-review.spec.ts` | Lecturer peer-review hooks | 3 | 1 | 1 | 1 |
| `src/features/lecturer/peer-review/lib/lecturer-peer-review.spec.ts` | Lecturer peer-review mapping | 8 | 3 | 2 | 3 |
| **Subtotal** |  | **143** | **43** | **56** | **44** |

## 4. Student course, project, integrations và realtime

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/student/courses/api/student-course-service.spec.ts` | Student course service | 9 | 2 | 4 | 3 |
| `src/features/student/courses/hooks/use-student-course-context.spec.ts` | Account/course context reset | 3 | 3 | 0 | 0 |
| `src/features/integrations/api/user-integrations-service.spec.ts` | User integrations service | 5 | 1 | 2 | 2 |
| `src/features/integrations/api/user-integrations-refresh-flow.spec.ts` | OAuth refresh flow | 7 | 4 | 1 | 2 |
| `src/features/student/project/api/project-projection-service.spec.ts` | Project projection/sync service | 22 | 9 | 10 | 3 |
| `src/features/student/project/components/project-realtime-badge.spec.tsx` | Project realtime badge | 4 | 3 | 0 | 1 |
| `src/features/student/project/hooks/use-project-realtime.spec.ts` | Project SSE invalidation | 13 | 7 | 2 | 4 |
| **Subtotal** |  | **63** | **29** | **19** | **15** |

## 5. Notification Center, user realtime và Web Push

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/notification/api/notification-service.spec.ts` | Inbox, push installations và composer requests | 19 | 11 | 6 | 2 |
| `src/features/notification/components/notification-center.spec.tsx` | Bell, badge và notification center | 4 | 2 | 1 | 1 |
| `src/features/notification/hooks/use-notifications.spec.tsx` | Notification queries/mutations | 4 | 4 | 0 | 0 |
| `src/features/notification/lib/notification-utils.spec.ts` | Action URL, visual type và time formatting | 11 | 4 | 5 | 2 |
| `src/features/notification/providers/user-realtime-provider.spec.tsx` | User-scoped SSE | 4 | 2 | 1 | 1 |
| **Subtotal** |  | **42** | **23** | **13** | **6** |

## 6. Student peer review

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/student/assessment/api/peer-review-service.spec.ts` | Peer-review service | 12 | 3 | 6 | 3 |
| `src/features/student/assessment/components/peer-assessment-view.spec.tsx` | Assessment view | 6 | 1 | 3 | 2 |
| `src/features/student/assessment/components/peer-review-modal.spec.tsx` | Review modal | 3 | 1 | 1 | 1 |
| `src/features/student/assessment/hooks/use-peer-review.spec.ts` | Peer-review hooks | 7 | 3 | 3 | 1 |
| `src/features/student/assessment/lib/peer-assessment-state.spec.ts` | Assessment state | 4 | 1 | 2 | 1 |
| `src/features/student/assessment/lib/peer-review-payload.spec.ts` | Submit payload | 4 | 2 | 1 | 1 |
| `src/features/student/assessment/lib/peer-review-window.spec.ts` | Review window rules | 7 | 3 | 2 | 2 |
| **Subtotal** |  | **43** | **14** | **18** | **11** |

## 7. Sprint, Jira tasks, commits và evidence

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/student/sprint-progress/api/project-sprint-service.spec.ts` | Project sprint service | 11 | 6 | 3 | 2 |
| `src/features/student/sprint-progress/api/project-task-service.spec.ts` | Project task service | 14 | 10 | 3 | 1 |
| `src/features/student/sprint-progress/api/task-evidence-service.spec.ts` | Evidence, confirmations và work sessions | 33 | 11 | 17 | 5 |
| `src/features/student/sprint-progress/components/quick-create-task.spec.tsx` | Quick create task | 11 | 6 | 4 | 1 |
| `src/features/student/sprint-progress/components/task-work-session-control.spec.tsx` | Resume/stop timer UI | 5 | 4 | 0 | 1 |
| `src/features/student/sprint-progress/lib/issue-collection.spec.ts` | Jira issue/subtask hierarchy | 3 | 3 | 0 | 0 |
| `src/features/student/sprint-progress/lib/optimistic-sprint-state.spec.ts` | Optimistic sprint state | 3 | 1 | 1 | 1 |
| `src/features/student/sprint-progress/lib/task-due-date.spec.ts` | Due-date presentation rules | 5 | 5 | 0 | 0 |
| `src/features/student/sprint-progress/lib/task-mapper.spec.ts` | Task mapper | 9 | 5 | 1 | 3 |
| `src/features/student/commits/lib/commit-mapper.spec.ts` | Commit mapper | 3 | 1 | 1 | 1 |
| **Subtotal** |  | **97** | **52** | **30** | **15** |

## 8. Graph và Pipeline

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/graph/api/project-graph-service.spec.ts` | Năm canonical Graph APIs và subgraph filters | 15 | 9 | 4 | 2 |
| `src/features/graph/components/cytoscape-graph-canvas.spec.tsx` | Cytoscape canvas | 6 | 4 | 0 | 2 |
| `src/features/graph/components/graph-filter-bar.spec.tsx` | Graph/Pipeline filter bar | 3 | 3 | 0 | 0 |
| `src/features/graph/components/lecturer-graph-view.spec.tsx` | Lecturer graph view | 10 | 6 | 1 | 3 |
| `src/features/graph/components/pipeline-flow-view.spec.tsx` | Pipeline flow UI | 9 | 5 | 3 | 1 |
| `src/features/graph/components/traceability-graph-view.spec.tsx` | Student traceability graph | 5 | 3 | 0 | 2 |
| `src/features/graph/hooks/use-pipeline-graph-data.spec.ts` | Pipeline graph data | 4 | 3 | 0 | 1 |
| `src/features/graph/hooks/use-project-graph.spec.ts` | Lazy Graph query selection | 9 | 4 | 3 | 2 |
| `src/features/graph/lib/pipeline-mapper.spec.ts` | Pipeline mapper | 14 | 6 | 5 | 3 |
| **Subtotal** |  | **75** | **43** | **16** | **16** |

## 9. Progress và student contribution

| Test file | Module | Tests | N | A | B |
| --- | --- | ---: | ---: | ---: | ---: |
| `src/features/progress/lib/progress-format.spec.ts` | Dashboard/progress formatting | 17 | 8 | 5 | 4 |
| `src/features/student/contribution/lib/contribution-view-utils.spec.ts` | Student contribution utilities | 9 | 5 | 1 | 3 |
| **Subtotal** |  | **26** | **13** | **6** | **7** |

## Tổng hợp

| Test files | Tests | Passed | Failed | N | A | B |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **66** | **643** | **643** | **0** | **270** | **228** | **145** |

`N` = Normal, `A` = Abnormal, `B` = Boundary. Test không ghi nhãn được custom reporter hiện hành phân loại mặc định là Normal.

## Phạm vi chưa được chứng minh bởi suite này

- Chưa có E2E/browser test chạy với Jira, GitHub, Firebase hoặc Railway thật.
- Chưa có integration test xuyên suốt giữa REST inbox, user-scoped SSE và FCM background push.
- Chưa có assertion coverage threshold. Coverage config hiện chỉ tính `src/**/api/*.ts` và `src/lib/*.ts`, không đại diện toàn bộ component/hook/page.
- `643/643 passed` là pass rate, không phải code coverage 100% và không tự chứng minh authorization phía Backend.
- Các composer Admin/Lecturer có service test, nhưng chưa có component test riêng cho toàn bộ scope selection, confirm dialog, timeout retry cùng Idempotency-Key và lỗi `409 NOTIFICATION_SEND_CONFLICT`.

## Coverage snapshot

`npm run test:coverage` chạy thành công ngày 16/09/2026 trên đúng 66 files/643 tests:

| Metric | Covered / Total | Tỷ lệ |
| --- | ---: | ---: |
| Statements | 842 / 1145 | 73.53% |
| Branches | 774 / 1193 | 64.87% |
| Functions | 174 / 198 | 87.87% |
| Lines | 835 / 1109 | 75.29% |

Đây chỉ là coverage của glob `src/**/api/*.ts` và `src/lib/*.ts` trong `vitest.config.mts`, không phải coverage toàn bộ ứng dụng.

## Quy ước bố trí test

Unit/component test tiếp tục đặt cạnh source (`*.spec.ts`/`*.spec.tsx`). Cách colocate này giúp test đi cùng module khi refactor, import ngắn và dễ phát hiện module chưa có test. Không di chuyển hàng loạt sang một thư mục `tests/unit` riêng.

Chỉ tách riêng các loại sau khi chúng xuất hiện:

- `tests/e2e/`: Playwright/browser flows xuyên nhiều trang hoặc hệ thống ngoài.
- `tests/integration/`: integration test nhiều feature/module và contract server giả lập.
- `src/testing/fixtures/`: fixture/factory dùng chung; fixture riêng vẫn đặt cạnh feature.
- `src/testing/`: setup, custom reporter và test utilities dùng chung.
