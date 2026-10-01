import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { mapProjectTaskToSprintIssue } from "@/features/student/sprint-progress/lib/task-mapper";
import type { ProjectTaskResponse } from "@/features/student/sprint-progress/types/jira-task-types";

const baseTask: ProjectTaskResponse = {
  id: "task-1",
  externalId: "1001",
  externalKey: "SAGA-66",
  title: "Dieu chinh giao dien task Jira",
  status: "IN_PROGRESS",
  jiraStatusId: "10002",
  jiraStatusName: "In Review",
  issueTypeName: "Task",
  issueTypeLevel: "UNKNOWN",
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
        issueTypeLevel: "SUBTASK",
        parent: {
          externalId: "10583",
          externalKey: "SAGA-49",
          taskId: "task-parent",
          resolution: "RESOLVED",
          resolutionReason: null,
        },
      });

      expect(result.type).toBe("SUBTASK");
      expect(result.issueTypeLevel).toBe("SUBTASK");
      expect(result.parent).toEqual({
        externalId: "10583",
        externalKey: "SAGA-49",
        taskId: "task-parent",
        resolution: "RESOLVED",
        resolutionReason: null,
      });
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

  fptTest(
    {
      id: "UTCID10",
      type: "N",
      executedDate: "30/09/2026",
      description: "Uu tien assignee.avatarUrl, fallback roster avatarUrl",
    },
    () => {
      const fromApi = mapProjectTaskToSprintIssue({
        ...baseTask,
        assignee: {
          accountId: "jira-1",
          displayName: "An",
          studentId: "stu-1",
          avatarUrl: "https://cdn.example.com/assignee.png",
        },
      });
      expect(fromApi.assignee.avatar).toBe("https://cdn.example.com/assignee.png");

      const fromRoster = mapProjectTaskToSprintIssue(
        {
          ...baseTask,
          assigneeStudentId: "stu-1",
          assignee: { accountId: "jira-1", displayName: "An", studentId: "stu-1", avatarUrl: null },
        },
        [{ id: "stu-1", name: "An", avatarUrl: "https://cdn.example.com/roster.png" }]
      );
      expect(fromRoster.assignee.avatar).toBe("https://cdn.example.com/roster.png");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "30/09/2026",
      description: "Khong gan avatar khi assignee va roster deu thieu URL hop le",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        assignee: { accountId: "jira-1", displayName: "An", avatarUrl: null },
      });
      expect(result.assignee.avatar).toBe("");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "N",
      executedDate: "02/10/2026",
      description: "Map 5 issueTypeLevel tu BE, khong doan cap tu ten Subtask",
    },
    () => {
      const levels = ["EPIC", "STANDARD", "SUBTASK", "ABOVE_EPIC", "UNKNOWN"] as const;
      for (const level of levels) {
        const result = mapProjectTaskToSprintIssue({
          ...baseTask,
          issueTypeName: "Subtask",
          issueTypeLevel: level,
        });
        expect(result.issueTypeLevel).toBe(level);
      }
      const unknown = mapProjectTaskToSprintIssue({
        ...baseTask,
        issueTypeName: "Subtask",
        issueTypeLevel: "UNKNOWN",
      });
      expect(unknown.issueTypeLevel).toBe("UNKNOWN");
      expect(unknown.type).toBe("TASK");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "02/10/2026",
      description: "STANDARD Story/Bug chi anh xa icon, khong doi issueTypeLevel",
    },
    () => {
      const story = mapProjectTaskToSprintIssue({
        ...baseTask,
        issueTypeName: "Story",
        issueTypeLevel: "STANDARD",
      });
      const bug = mapProjectTaskToSprintIssue({
        ...baseTask,
        issueTypeName: "Bug",
        issueTypeLevel: "STANDARD",
      });
      expect(story.issueTypeLevel).toBe("STANDARD");
      expect(story.type).toBe("STORY");
      expect(bug.issueTypeLevel).toBe("STANDARD");
      expect(bug.type).toBe("BUG");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "A",
      executedDate: "02/10/2026",
      description: "Parent UNRESOLVED giu externalKey va taskId null, khong bia RESOLVED",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        parent: {
          externalId: "10583",
          externalKey: "SAGA-49",
          taskId: null,
          resolution: "UNRESOLVED",
          resolutionReason: "PARENT_NOT_SYNCED",
        },
      });
      expect(result.parent?.taskId).toBeNull();
      expect(result.parent?.resolution).toBe("UNRESOLVED");
      expect(result.parent?.resolutionReason).toBe("PARENT_NOT_SYNCED");
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "B",
      executedDate: "02/10/2026",
      description: "Subtask storyPoint null giu null, khong bien thanh 0",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        issueTypeLevel: "SUBTASK",
        issueTypeName: "Subtask",
        storyPoint: null,
      });
      expect(result.storyPoints).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "N",
      executedDate: "02/10/2026",
      description: "Map evidenceCheck requiresCommit/requiresDocument tu BE, khong suy tu commit count",
    },
    () => {
      const result = mapProjectTaskToSprintIssue({
        ...baseTask,
        linkedCommitCount: 0,
        evidenceCheck: {
          status: "SATISFIED",
          requiresCommit: false,
          requiresDocument: false,
        },
      });
      expect(result.evidenceCheck).toEqual({
        status: "SATISFIED",
        requiresCommit: false,
        requiresDocument: false,
      });
      expect(result.githubCommitCount).toBe(0);
    }
  );
});
