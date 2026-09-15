import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { mapProjectTaskToSprintIssue } from "./task-mapper";
import type { ProjectTaskResponse } from "../types/jira-task-types";

const baseTask: ProjectTaskResponse = {
  id: "task-1",
  externalId: "1001",
  externalKey: "SAGA-66",
  title: "Dieu chinh giao dien task Jira",
  status: "IN_PROGRESS",
  jiraStatusId: "10002",
  jiraStatusName: "In Review",
  issueTypeName: "Task",
  linkedCommitCount: 0,
  createdAt: "2026-09-13T09:00:00Z",
  updatedAt: "2026-09-13T09:00:01Z",
};

describe("task-mapper", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "13/09/2026",
      description: "Map task co jiraStatusName In Review thanh IN_REVIEW cho cot Dang kiem thu",
    },
    () => {
      const result = mapProjectTaskToSprintIssue(baseTask);
      expect(result.status).toBe("IN_REVIEW");
      expect(result.key).toBe("SAGA-66");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "13/09/2026",
      description: "Map task co jiraStatusName Done va In Progress thanh DONE va IN_PROGRESS",
    },
    () => {
      const doneResult = mapProjectTaskToSprintIssue({
        ...baseTask,
        jiraStatusName: "Done",
        status: "DONE",
      });
      const inProgressResult = mapProjectTaskToSprintIssue({
        ...baseTask,
        jiraStatusName: "In Progress",
        status: "IN_PROGRESS",
      });

      expect(doneResult.status).toBe("DONE");
      expect(inProgressResult.status).toBe("IN_PROGRESS");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "13/09/2026",
      description: "Map task khi thieu jiraStatusName thi fallback theo status backend",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        jiraStatusName: null,
        status: "IN_PROGRESS",
      });
      expect(result.status).toBe("IN_PROGRESS");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "13/09/2026",
      description: "Map task khi ca jiraStatusName va status deu rong thi tra ve TODO mac dinh",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        jiraStatusName: undefined,
        status: "",
      });
      expect(result.status).toBe("TODO");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "13/09/2026",
      description: "Map quan he Jira parent de Subtask duoc long dung duoi task cha",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        externalKey: "SAGA-50",
        issueTypeName: "Subtask",
        parent: { externalId: "10583", externalKey: "SAGA-49" },
      });

      expect(result.type).toBe("SUBTASK");
      expect(result.parent).toEqual({ externalId: "10583", externalKey: "SAGA-49" });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "14/09/2026",
      description: "Map task gan voi member qua accountId va anh xa dung mang labels",
    },
    () => {
      const members = [
        {
          id: "SE170504",
          studentCode: "SE170504",
          fullName: "Le Hoang Hai",
          avatar: "",
          accountId: "acc-user-1",
        },
      ];
      const taskWithAssigneeAndLabels = {
        ...baseTask,
        assigneeExternalId: "acc-user-1",
        assigneeDisplayName: "Le Hoang Hai",
        labels: ["saga:code", "frontend"],
      };

      const result = mapProjectTaskToSprintIssue(taskWithAssigneeAndLabels, members);
      expect(result.assignee.id).toBe("SE170504");
      expect(result.assignee.studentCode).toBe("SE170504");
      expect(result.assignee.name).toBe("Le Hoang Hai");
      expect(result.labels).toEqual(["saga:code", "frontend"]);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "14/09/2026",
      description: "Map task khi khong co labels va khong khop thanh vien tra ve unassigned va labels rong",
    },
    () => {
      const result = mapProjectTaskToSprintIssue(baseTask, []);
      expect(result.assignee.id).toBe("unassigned");
      expect(result.labels).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "14/09/2026",
      description: "Map task chua startDate va dueDate chinh xac sang SprintIssue",
    },
    () => {
      const taskWithDates: ProjectTaskResponse = {
        ...baseTask,
        startDate: "2026-09-15",
        dueDate: "2026-09-22",
      };
      const result = mapProjectTaskToSprintIssue(taskWithDates);
      expect(result.startDate).toBe("2026-09-15");
      expect(result.dueDate).toBe("2026-09-22");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "15/09/2026",
      description: "Khong suy doan ngay task tu createdAt updatedAt hoac ngay Sprint khi API tra null",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        startDate: null,
        dueDate: null,
      });

      expect(result.startDate).toBeUndefined();
      expect(result.dueDate).toBeUndefined();
    }
  );
});
