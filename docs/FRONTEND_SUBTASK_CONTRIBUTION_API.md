# Frontend Subtask Contribution API (Epic B)

Contract FE cho **chia tỷ trọng Subtask**. FE chỉ nhập tỷ trọng và hiển thị preview. **Contribution cuối do Backend sở hữu** qua `GET /api/teams/{teamId}/contribution-evaluation`.

Không tạo field `contributionWeight`. Không đăng ký SSE `CONTRIBUTION_CHANGED`.

## Ý nghĩa `storyPoint` / `storyPoints`

| Cấp | Ý nghĩa |
| --- | --- |
| STANDARD không có Subtask | Story point thực |
| STANDARD có Subtask | Trần điểm được chia |
| SUBTASK | Tỷ trọng nguyên 1–10, tương ứng 10%–100% |
| EPIC / ABOVE_EPIC | Không tham gia contribution |

Subtask `storyPoint = null` là legacy: không chiếm tỷ trọng, UI hiện “Chưa được phân bổ tỷ trọng”, bắt buộc 1–10 khi sửa và lưu.

## Công thức preview (chỉ hiển thị)

```text
subtaskPercent = subtask.storyPoint × 10
allocatedPoint = parent.storyPoint × subtaskPercent / 100
             = (parent.storyPoint ?? 1) × subtask.storyPoint / 10
```

Ví dụ cha 10 SP: Subtask A nhập 6 → 60% → tối đa 6 SP; B nhập 4 → 40% → tối đa 4 SP.

## Nguồn tỷ trọng sibling

Chỉ dùng `GET /api/projects/{projectId}/tasks`.

Sibling = `issueTypeLevel === "SUBTASK"` AND `parent.taskId === selectedParentId`.

```text
usedPoints = tổng storyPoint 1–10 của sibling (null không chiếm)
remainingPoints = 10 − usedPoints
remainingPercent = remainingPoints × 10
```

Khi sửa: loại chính Subtask đang sửa khỏi `usedPoints` rồi mới cộng giá trị mới.

**Không** dùng `taskDetail.subtasks[]` để tính tỷ trọng (contract hiện không bảo đảm `storyPoint`).

## Tạo Subtask

`POST /api/projects/{projectId}/tasks`

```json
{
  "summary": "Viết API login",
  "issueTypeId": "<subtask-issue-type-id>",
  "jiraParentTaskId": "<parent-task-uuid>",
  "storyPoints": 6,
  "assigneeAccountId": "<jira-account-id>"
}
```

- Bắt buộc cha STANDARD, gửi `jiraParentTaskId`.
- Không gửi Sprint; Subtask theo Sprint của cha.
- `storyPoints` là tỷ trọng 1–10, không đổi tên field.
- Tổng sibling không vượt 10. Tổng nhỏ hơn 10 vẫn hợp lệ; phần chưa phân bổ không thuộc về ai.

## Sửa tỷ trọng

`PATCH /api/projects/{projectId}/tasks/{taskId}` với `{ "storyPoints": 4 }`.

Parent khóa. Max động = `10 − usedBySiblings`.

## Lỗi authoritative

`TASK_SUBTASK_PERCENT_INVALID` — giữ form, hiện lỗi dưới input, refetch `GET /tasks`, tính lại phần còn lại.

Nếu response có `usedPercent` / `requestedPercent` / `maxPercent` hoặc `minPoints` / `maxPoints`, dùng trong thông báo.

Hai người tạo cùng lúc làm tổng vượt 100%: BE từ chối request sau; FE không đóng form.

## Planning UI

- STANDARD: hiện `10 SP`.
- SUBTASK: hiện `60%`, không hiện `6 SP`.
- Subtask null: `Chưa phân bổ`.
- Tổng Sprint/Backlog chỉ cộng STANDARD. Cha 10 + hai Subtask 6–4 = **10**, không 20.
- Không cộng Epic/Above-Epic. STANDARD chưa ước lượng không biến thành 1.

## Ghi nhận contribution

Điểm Subtask chỉ được ghi nhận khi **cả cha và Subtask đều Done**. Sibling chưa Done không chuyển phần của mình cho người khác. Assignee cha không nhận trần điểm nếu task có Subtask.

FE **không** tự áp dụng bảng này vào evaluation. Chỉ hiển thị `GET /api/teams/{teamId}/contribution-evaluation`.

## Label và evidence

- Mỗi STANDARD hoặc SUBTASK chọn tối đa một label đóng góp riêng: `saga:code` / `saga:test` / `saga:document` / `saga:research`.
- Subtask không kế thừa label từ task cha. Form chỉ cho chọn bốn label SAGA; label Jira tự do đã có chỉ hiển thị đọc và được giữ nguyên khi lưu.
- `saga:doc` / `saga:docs` cũ được đọc như `saga:document`; lần người dùng chọn lại sẽ gửi giá trị canonical.
- `evidenceCheck` từ BE:

```ts
interface TaskEvidenceCheck {
  status: EvidenceCheckStatus;
  requiresCommit: boolean;
  requiresDocument: boolean;
}
```

Không suy luận evidence bằng `linkedCommitCount`, `evidenceCount` hoặc label riêng của Subtask.

## Cache / SSE

Invalidate `contributionEvaluation` sau tạo/sửa tỷ trọng, đổi assignee, đổi trạng thái, đổi evidence, xóa Subtask.

`TASKS_CHANGED` (và `TASK_EVIDENCE_CHANGED` / `TASK_LINKS_CHANGED`) refresh task list/detail, tỷ trọng sibling, evidence và contribution evaluation.

Không thêm `CONTRIBUTION_CHANGED`.
