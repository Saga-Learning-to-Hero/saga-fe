import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  getTopLevelSprintIssues,
  groupSprintIssuesByParent,
  mergeProjectedAndLocalIssues,
} from "./issue-collection";
import type { SprintIssue } from "../types/sprint-progress";

const issue = (id: string, key: string, type: SprintIssue["type"] = "TASK"): SprintIssue => ({
  id,
  key,
  summary: key,
  type,
  priority: "MEDIUM",
  status: "TODO",
  storyPoints: 0,
  assignee: { id: "student-1", name: "Student", avatar: "", studentCode: "SE0001" },
  sprintId: "sprint-1",
  createdAt: "2026-09-13T00:00:00.000Z",
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
      executedDate: "13/09/2026",
      description: "Group Subtask theo parentExternalKey va giu lai subtask khong tim thay task cha",
    },
    () => {
      const parent = issue("task-1", "SAGA-49");
      const child = {
        ...issue("subtask-1", "SAGA-50", "SUBTASK"),
        parent: { externalId: "10583", externalKey: "SAGA-49" },
      };
      const orphan = {
        ...issue("subtask-2", "SAGA-51", "SUBTASK"),
        parent: { externalId: "99999", externalKey: "SAGA-404" },
      };

      const result = groupSprintIssuesByParent([parent, child, orphan]);

      expect(result.workItems).toEqual([parent]);
      expect(result.subtasksByParentKey.get("SAGA-49")).toEqual([child]);
      expect(result.orphanSubtasks).toEqual([orphan]);
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
});
