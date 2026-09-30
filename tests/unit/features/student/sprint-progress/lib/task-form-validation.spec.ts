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
});
