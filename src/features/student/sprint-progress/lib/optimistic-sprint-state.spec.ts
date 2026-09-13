import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  moveLocalIssueToSprint,
  restoreLocalSprintOverride,
  setLocalSprintOverride,
} from "./optimistic-sprint-state";
import type { SprintIssue } from "../types/sprint-progress";

const issue = { id: "task-1", sprintId: "sprint-1" } as SprintIssue;

describe("optimistic-sprint-state", () => {
  fptTest(
    { id: "UTCID01", type: "N", executedDate: "13/09/2026", description: "moveLocalIssueToSprint cap nhat task duoc keo sang Sprint moi" },
    () => {
      expect(moveLocalIssueToSprint([issue], "task-1", "sprint-2")[0].sprintId).toBe("sprint-2");
    }
  );

  fptTest(
    { id: "UTCID02", type: "A", executedDate: "13/09/2026", description: "moveLocalIssueToSprint khong sua task khong trung ID" },
    () => {
      expect(moveLocalIssueToSprint([issue], "missing", "sprint-2")[0].sprintId).toBe("sprint-1");
    }
  );

  fptTest(
    { id: "UTCID03", type: "B", executedDate: "13/09/2026", description: "restoreLocalSprintOverride phuc hoi override truoc do khi mutation that bai" },
    () => {
      const original = { "task-1": { sprintId: "sprint-1" } };
      const pending = setLocalSprintOverride(original, "task-1", "sprint-2");

      expect(restoreLocalSprintOverride(pending, "task-1", original["task-1"])["task-1"].sprintId).toBe("sprint-1");
    }
  );
});
