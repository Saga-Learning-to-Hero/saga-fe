import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { validateTaskForm } from "@/features/student/sprint-progress/lib/task-form-validation";
import type { Sprint } from "@/features/student/sprint-progress/types/sprint-progress";

const activeSprint: Sprint = {
  id: "sprint-1",
  externalSprintId: "31",
  name: "Sprint 1",
  goal: "",
  status: "ACTIVE",
  startDate: "2026-09-01",
  endDate: "2026-09-14",
  totalStoryPoints: 0,
  completedStoryPoints: 0,
};

function validInput() {
  return {
    summary: "Xây dựng đăng nhập",
    description: "",
    storyPoints: "5",
    sprintId: activeSprint.id,
    startDate: "2026-09-02",
    dueDate: "2026-09-10",
    jiraIntegrationId: "jira-1",
    activeJiraSourceCount: 1,
    selectedSprint: activeSprint,
    isSprintAssignmentChanged: false,
    requireOwnJiraAccount: false,
    ownJiraAccountId: "account-1",
    issueTypeId: "10001",
    issueTypeLevel: "STANDARD" as const,
  };
}

describe("validateTaskForm", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Chap nhan Task co du lieu hop le nam trong lich Sprint",
    },
    () => {
      expect(validateTaskForm(validInput())).toEqual({ errors: {}, dateWarning: undefined });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "30/09/2026",
      description: "Chan ten Task rong va han hoan thanh truoc ngay bat dau",
    },
    () => {
      const result = validateTaskForm({
        ...validInput(),
        summary: "   ",
        startDate: "2026-09-10",
        dueDate: "2026-09-09",
      });
      expect(result.errors.summary).toBeDefined();
      expect(result.errors.dueDate).toBeDefined();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "30/09/2026",
      description: "Canh bao mem khi lich Task vuot khoi lich Sprint",
    },
    () => {
      const result = validateTaskForm({ ...validInput(), dueDate: "2026-09-20" });
      expect(result.errors).toEqual({});
      expect(result.dateWarning).toContain("Sprint 1");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "30/09/2026",
      description: "Task Backlog co the co lich rieng ma khong bi canh bao theo Sprint",
    },
    () => {
      const result = validateTaskForm({
        ...validInput(),
        sprintId: "backlog",
        selectedSprint: undefined,
        startDate: "2026-08-01",
        dueDate: "2026-10-01",
      });
      expect(result.errors).toEqual({});
      expect(result.dateWarning).toBeUndefined();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "30/09/2026",
      description: "Chan tao Task khi thieu lien ket ca nhan ma BE yeu cau",
    },
    () => {
      const result = validateTaskForm({
        ...validInput(),
        missingPersonalIntegrations: ["JIRA", "GITHUB"],
      });
      expect(result.errors.assigneeAccountId).toContain("Jira và GitHub");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "02/10/2026",
      description: "Subtask bat buoc parent; UNKNOWN khoa submit",
    },
    () => {
      const subtask = validateTaskForm({
        ...validInput(),
        issueTypeLevel: "SUBTASK",
        parentTaskId: "",
      });
      expect(subtask.errors.parent).toBeDefined();

      const unknown = validateTaskForm({
        ...validInput(),
        issueTypeLevel: "UNKNOWN",
      });
      expect(unknown.errors.issueTypeId).toContain("Chưa xác định cấp");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "02/10/2026",
      description: "Subtask chap nhan ty trong 1 va 10 khi con du phan tram",
    },
    () => {
      expect(
        validateTaskForm({
          ...validInput(),
          issueTypeLevel: "SUBTASK",
          parentTaskId: "parent-1",
          storyPoints: "1",
          siblingUsedPoints: 0,
        }).errors.storyPoints
      ).toBeUndefined();
      expect(
        validateTaskForm({
          ...validInput(),
          issueTypeLevel: "SUBTASK",
          parentTaskId: "parent-1",
          storyPoints: "10",
          siblingUsedPoints: 0,
        }).errors.storyPoints
      ).toBeUndefined();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "02/10/2026",
      description: "Chan Subtask 0, so thap phan, vuot 10 va vuot phan con lai",
    },
    () => {
      expect(
        validateTaskForm({
          ...validInput(),
          issueTypeLevel: "SUBTASK",
          parentTaskId: "parent-1",
          storyPoints: "0",
          siblingUsedPoints: 0,
        }).errors.storyPoints
      ).toBeDefined();
      expect(
        validateTaskForm({
          ...validInput(),
          issueTypeLevel: "SUBTASK",
          parentTaskId: "parent-1",
          storyPoints: "6.5",
          siblingUsedPoints: 0,
        }).errors.storyPoints
      ).toBeDefined();
      expect(
        validateTaskForm({
          ...validInput(),
          issueTypeLevel: "SUBTASK",
          parentTaskId: "parent-1",
          storyPoints: "5",
          siblingUsedPoints: 6,
        }).errors.storyPoints
      ).toContain("tối đa là 4");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "02/10/2026",
      description: "Tong 80% van luu duoc; 100% khoa them Subtask; STANDARD van 0-100",
    },
    () => {
      expect(
        validateTaskForm({
          ...validInput(),
          issueTypeLevel: "SUBTASK",
          parentTaskId: "parent-1",
          storyPoints: "2",
          siblingUsedPoints: 8,
        }).errors.storyPoints
      ).toBeUndefined();
      expect(
        validateTaskForm({
          ...validInput(),
          issueTypeLevel: "SUBTASK",
          parentTaskId: "parent-1",
          storyPoints: "1",
          siblingUsedPoints: 10,
        }).errors.storyPoints
      ).toContain("phân bổ hết 100%");
      expect(validateTaskForm({ ...validInput(), storyPoints: "0" }).errors.storyPoints).toBeUndefined();
      expect(validateTaskForm({ ...validInput(), storyPoints: "101" }).errors.storyPoints).toBeDefined();
    }
  );
});
