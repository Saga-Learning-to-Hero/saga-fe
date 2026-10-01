import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  getTopLevelSprintIssues,
  groupSprintIssuesByParent,
  mergeProjectedAndLocalIssues,
} from "@/features/student/sprint-progress/lib/issue-collection";
import type { SprintIssue } from "@/features/student/sprint-progress/types/sprint-progress";

const issue = (
  id: string,
  key: string,
  type: SprintIssue["type"] = "TASK",
  extras: Partial<SprintIssue> = {}
): SprintIssue => ({
  id,
  key,
  summary: key,
  type,
  issueTypeLevel: type === "SUBTASK" ? "SUBTASK" : type === "EPIC" ? "EPIC" : "STANDARD",
  priority: "MEDIUM",
  status: "TODO",
  storyPoints: 0,
  assignee: { id: "student-1", name: "Student", avatar: "", studentCode: "SE0001" },
  sprintId: "sprint-1",
  createdAt: "2026-09-13T00:00:00.000Z",
  ...extras,
});

describe("issue-collection", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "13/09/2026",
      description: "Kanban chi dem work item cap cao va khong tinh subtask nhu mot card rieng",
    },
    () => {
      expect(getTopLevelSprintIssues([issue("task-1", "SAGA-49"), issue("subtask-1", "SAGA-50", "SUBTASK")]))
        .toEqual([issue("task-1", "SAGA-49")]);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "02/10/2026",
      description: "Group Subtask theo parent.taskId, orphan khi taskId null hoac parent khong co trong list",
    },
    () => {
      const parent = issue("task-1", "SAGA-49");
      const child = issue("subtask-1", "SAGA-50", "SUBTASK", {
        parent: {
          externalId: "10583",
          externalKey: "SAGA-49",
          taskId: "task-1",
          resolution: "RESOLVED",
          resolutionReason: null,
        },
      });
      const unresolved = issue("subtask-2", "SAGA-51", "SUBTASK", {
        parent: {
          externalId: "99999",
          externalKey: "SAGA-404",
          taskId: null,
          resolution: "UNRESOLVED",
          resolutionReason: "PARENT_NOT_SYNCED",
        },
      });
      const missingParent = issue("subtask-3", "SAGA-52", "SUBTASK", {
        parent: {
          externalId: "88888",
          externalKey: "SAGA-88",
          taskId: "task-missing",
          resolution: "RESOLVED",
          resolutionReason: null,
        },
      });

      const result = groupSprintIssuesByParent([parent, child, unresolved, missingParent]);

      expect(result.workItems).toEqual([parent]);
      expect(result.subtasksByParentId.get("task-1")).toEqual([child]);
      expect(result.orphanSubtasks).toEqual([unresolved, missingParent]);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "13/09/2026",
      description: "Du lieu Jira uu tien hon ban sao optimistic de React khong nhan key trung",
    },
    () => {
      const projected = issue("task-1", "SAGA-66");
      const localCopy = { ...projected, summary: "Bản cục bộ cũ" };
      const pendingCreate = issue("local-1", "SAGA-NEW");

      expect(mergeProjectedAndLocalIssues([projected], [localCopy, pendingCreate])).toEqual([
        projected,
        pendingCreate,
      ]);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "02/10/2026",
      description: "Khong nhom Subtask theo externalKey khi taskId khac id parent",
    },
    () => {
      const parent = issue("task-1", "SAGA-49");
      const child = issue("subtask-1", "SAGA-50", "SUBTASK", {
        parent: {
          externalId: "10583",
          externalKey: "SAGA-49",
          taskId: "other-id",
          resolution: "RESOLVED",
          resolutionReason: null,
        },
      });

      const result = groupSprintIssuesByParent([parent, child]);
      expect(result.subtasksByParentId.size).toBe(0);
      expect(result.orphanSubtasks).toEqual([child]);
    }
  );
});
