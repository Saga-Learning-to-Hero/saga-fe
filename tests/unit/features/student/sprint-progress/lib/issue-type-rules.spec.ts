import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  canChangeIssueType,
  canDragIssueSprint,
  getIssueTypeUiRules,
  hydratedParentTaskId,
  parentActionTypeForSelection,
  parentFieldsForCreate,
  parentFieldsForPatch,
  pickStandardIssueType,
  resolveParentAction,
  shouldPreserveParentOnIssueTypeChange,
} from "@/features/student/sprint-progress/lib/issue-type-rules";
import type { ProjectTaskOptionItem } from "@/features/student/sprint-progress/types/jira-task-types";

describe("issue-type-rules", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "02/10/2026",
      description: "Ma tran EPIC an parent va sprint, STANDARD cho chon Epic tuy chon",
    },
    () => {
      const epic = getIssueTypeUiRules("EPIC", false);
      const standard = getIssueTypeUiRules("STANDARD", false);
      expect(epic.showParent).toBe(false);
      expect(epic.showSprint).toBe(false);
      expect(standard.showParent).toBe(true);
      expect(standard.parentRequired).toBe(false);
      expect(standard.parentLabel).toBe("Epic cha");
      expect(standard.showSprint).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "02/10/2026",
      description: "SUBTASK bat buoc parent STANDARD, khoa parent khi sua, an sprint",
    },
    () => {
      const createRules = getIssueTypeUiRules("SUBTASK", false);
      const editRules = getIssueTypeUiRules("SUBTASK", true);
      expect(createRules.parentRequired).toBe(true);
      expect(createRules.canSelectParent).toBe(true);
      expect(createRules.parentLabel).toBe("Task cha");
      expect(createRules.showSprint).toBe(false);
      expect(editRules.canSelectParent).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "02/10/2026",
      description: "UNKNOWN khoa submit va hien huong dan dong bo lai Jira",
    },
    () => {
      const rules = getIssueTypeUiRules("UNKNOWN", false);
      expect(rules.canSubmit).toBe(false);
      expect(rules.unknownMessage).toContain("Chưa xác định cấp");
      expect(getIssueTypeUiRules("ABOVE_EPIC", false).canSubmit).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "02/10/2026",
      description: "Create Epic/Standard/Subtask payload parent: khong gui sprint field o day",
    },
    () => {
      expect(parentFieldsForCreate({ type: "UNCHANGED" })).toEqual({});
      expect(parentFieldsForCreate({ type: "SET", taskId: "epic-1" })).toEqual({
        jiraParentTaskId: "epic-1",
      });
      expect(parentFieldsForCreate({ type: "CLEAR" })).toEqual({});
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "02/10/2026",
      description: "ParentAction UNCHANGED/SET/CLEAR; UNRESOLVED khong thanh CLEAR",
    },
    () => {
      expect(
        resolveParentAction({
          isEditing: true,
          selectedParentTaskId: "",
          originalParentTaskId: "epic-1",
        })
      ).toEqual({ type: "CLEAR" });
      expect(
        resolveParentAction({
          isEditing: true,
          selectedParentTaskId: "epic-2",
          originalParentTaskId: "epic-1",
        })
      ).toEqual({ type: "SET", taskId: "epic-2" });
      expect(
        resolveParentAction({
          isEditing: true,
          selectedParentTaskId: "",
          originalParentTaskId: "",
          parentResolution: "UNRESOLVED",
        })
      ).toEqual({ type: "UNCHANGED" });
      expect(
        resolveParentAction({
          isEditing: true,
          selectedParentTaskId: "",
          originalParentTaskId: "",
          parentResolution: "UNRESOLVED",
          requestedAction: "CLEAR",
        })
      ).toEqual({ type: "CLEAR" });
      expect(
        resolveParentAction({
          isEditing: true,
          selectedParentTaskId: "",
          originalParentTaskId: "epic-1",
          requestedAction: "UNCHANGED",
        })
      ).toEqual({ type: "UNCHANGED" });
      expect(parentFieldsForPatch({ type: "UNCHANGED" })).toEqual({});
      expect(parentFieldsForPatch({ type: "CLEAR" })).toEqual({ clearJiraParent: true });
      expect(parentFieldsForPatch({ type: "SET", taskId: "epic-2" })).toEqual({
        jiraParentTaskId: "epic-2",
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "02/10/2026",
      description: "Chi STANDARD doi sang STANDARD; Task sang Feature van duoc phep",
    },
    () => {
      expect(canChangeIssueType("STANDARD", "STANDARD")).toBe(true);
      expect(canChangeIssueType("EPIC", "STANDARD")).toBe(false);
      expect(canChangeIssueType("SUBTASK", "STANDARD")).toBe(false);
      expect(canChangeIssueType("UNKNOWN", "STANDARD")).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "02/10/2026",
      description: "Quick Create chon issue type STANDARD that; khong co thi null",
    },
    () => {
      const types: ProjectTaskOptionItem[] = [
        { id: "1", name: "Epic", level: "EPIC" },
        { id: "2", name: "Story", level: "STANDARD" },
        { id: "3", name: "Subtask", level: "SUBTASK" },
      ];
      expect(pickStandardIssueType(types)?.id).toBe("2");
      expect(pickStandardIssueType([{ id: "1", name: "Subtask", level: "SUBTASK" }])).toBeNull();
      expect(pickStandardIssueType([{ id: "1", name: "Task", level: "UNKNOWN" }])).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "02/10/2026",
      description: "Chi STANDARD duoc keo doi Sprint",
    },
    () => {
      expect(canDragIssueSprint("STANDARD")).toBe(true);
      expect(canDragIssueSprint("EPIC")).toBe(false);
      expect(canDragIssueSprint("SUBTASK")).toBe(false);
      expect(canDragIssueSprint("UNKNOWN")).toBe(false);
      expect(canDragIssueSprint("ABOVE_EPIC")).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "02/10/2026",
      description: "Doi Task sang Feature khi sua giu nguyen Epic cha",
    },
    () => {
      expect(
        shouldPreserveParentOnIssueTypeChange({
          isEditing: true,
          currentLevel: "STANDARD",
          nextLevel: "STANDARD",
        })
      ).toBe(true);
      expect(
        shouldPreserveParentOnIssueTypeChange({
          isEditing: false,
          currentLevel: "STANDARD",
          nextLevel: "SUBTASK",
        })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "N",
      executedDate: "02/10/2026",
      description: "Hydrate parent null va phan biet UNCHANGED SET CLEAR tren form sua",
    },
    () => {
      expect(hydratedParentTaskId(null)).toBe("");
      expect(
        hydratedParentTaskId({
          externalId: "10020",
          externalKey: "SAGA-10",
          taskId: "parent-1",
          resolution: "RESOLVED",
          resolutionReason: null,
        })
      ).toBe("parent-1");
      expect(
        parentActionTypeForSelection({
          isEditing: true,
          selectedParentTaskId: "parent-1",
          originalParentTaskId: "parent-1",
        })
      ).toBe("UNCHANGED");
      expect(
        parentActionTypeForSelection({
          isEditing: true,
          selectedParentTaskId: "parent-2",
          originalParentTaskId: "parent-1",
        })
      ).toBe("SET");
      expect(
        parentActionTypeForSelection({
          isEditing: true,
          selectedParentTaskId: "",
          originalParentTaskId: "",
        })
      ).toBe("CLEAR");
    }
  );
});
