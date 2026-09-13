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
});
