import { describe, expect, vi, beforeEach } from "vitest";
import { ProjectTaskService } from "./project-task-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("ProjectTaskService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = "proj-123";
  const mockTaskId = "task-789";

  const mockTask = {
    id: mockTaskId,
    externalId: "jira-1001",
    externalKey: "SAGA-15",
    title: "Triển khai xác thực Google OAuth",
    description: "Tích hợp đăng nhập bằng tài khoản trường",
    status: "TODO" as const,
    jiraStatusId: "1",
    jiraStatusName: "To Do",
    issueTypeName: "Story",
    assigneeExternalId: "acc-user-1",
    assigneeDisplayName: "Le Hoang Hai",
    assigneeStudentId: "stu-1",
    assignee: {
      accountId: "acc-user-1",
      displayName: "Le Hoang Hai",
      studentId: "stu-1",
    },
    priority: "High",
    priorityDetail: { id: null, name: "High" },
    storyPoint: 5,
    sprint: {
      id: "sprint-1",
      externalSprintId: "101",
      name: "Sprint 1",
      state: "active",
    },
    linkedCommitCount: 2,
    externalUpdatedAt: "2026-09-12T00:00:00Z",
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-12T00:00:00Z",
  };

  const mockOptions = {
    issueTypes: [{ id: "10001", name: "Story", description: "Tính năng người dùng" }],
    priorities: [{ id: "2", name: "High" }],
    assignableUsers: [{ accountId: "acc-user-1", displayName: "Le Hoang Hai" }],
    estimation: { supported: true, fieldId: "customfield_10016", fieldName: "Story Points" },
    sprints: [{ id: "sprint-1", name: "Sprint 1", state: "active" }],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "12/09/2026",
      description: "Lay danh sach Task du an thanh cong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockTask] });

      const res = await ProjectTaskService.getTasks(mockProjectId);

      expect(res).toHaveLength(1);
      expect(res[0].externalKey).toBe("SAGA-15");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "12/09/2026",
      description: "Lay chi tiet mot Task thanh cong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockTask });

      const res = await ProjectTaskService.getTask(mockProjectId, mockTaskId);

      expect(res.id).toBe(mockTaskId);
      expect(res.storyPoint).toBe(5);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "12/09/2026",
      description: "Tao Task moi dong bo Jira thanh cong",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockTask });

      const res = await ProjectTaskService.createTask(mockProjectId, {
        summary: "Triển khai xác thực Google OAuth",
        issueTypeId: "10001",
        storyPoints: 5,
      });

      expect(res.externalKey).toBe("SAGA-15");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "12/09/2026",
      description: "Cap nhat Task mot phan qua PATCH thanh cong",
    },
    async () => {
      const updated = { ...mockTask, title: "Tieu de moi" };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: updated });

      const res = await ProjectTaskService.patchTask(mockProjectId, mockTaskId, {
        summary: "Tieu de moi",
      });

      expect(res.title).toBe("Tieu de moi");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "12/09/2026",
      description: "Xoa Task thanh cong",
    },
    async () => {
      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: null });

      await ProjectTaskService.deleteTask(mockProjectId, mockTaskId);

      expect(deleteSpy).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/${mockTaskId}`
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "12/09/2026",
      description: "Lay options dong dung form tao/sua Task thanh cong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockOptions });

      const res = await ProjectTaskService.getTaskOptions(mockProjectId);

      expect(res.issueTypes).toHaveLength(1);
      expect(res.estimation.supported).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "12/09/2026",
      description: "Lay danh sach transitions hop le theo Jira workflow thanh cong",
    },
    async () => {
      const transitions = [
        { id: "21", name: "Start Progress", toStatusId: "3", toStatusName: "In Progress" },
      ];
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: transitions });

      const res = await ProjectTaskService.getTaskTransitions(mockProjectId, mockTaskId);

      expect(res).toHaveLength(1);
      expect(res[0].toStatusName).toBe("In Progress");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "12/09/2026",
      description: "Doi trang thai Task qua transition thanh cong",
    },
    async () => {
      const progressedTask = {
        ...mockTask,
        status: "IN_PROGRESS" as const,
        jiraStatusName: "In Progress",
      };
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: progressedTask });

      const res = await ProjectTaskService.transitionTask(mockProjectId, mockTaskId, {
        transitionId: "21",
      });

      expect(res.status).toBe("IN_PROGRESS");
      expect(res.jiraStatusName).toBe("In Progress");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem loi 409 TASK_DELETE_BLOCKED_BY_EVIDENCE khi xoa task da co minh chung",
    },
    async () => {
      vi.spyOn(apiClient, "delete").mockRejectedValueOnce(
        new Error("TASK_DELETE_BLOCKED_BY_EVIDENCE")
      );

      await expect(
        ProjectTaskService.deleteTask(mockProjectId, mockTaskId)
      ).rejects.toThrow("TASK_DELETE_BLOCKED_BY_EVIDENCE");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem ValidationException khi projectId hoac taskId bi rong",
    },
    async () => {
      await expect(ProjectTaskService.getTasks("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );

      await expect(ProjectTaskService.getTask(mockProjectId, "")).rejects.toThrow(
        "Throw ValidationException: Task ID is required"
      );

      await expect(
        ProjectTaskService.createTask(mockProjectId, { summary: "" })
      ).rejects.toThrow("Throw ValidationException: Task summary is required");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "12/09/2026",
      description: "Nem ValidationException khi transitionTask thieu ca transitionId va targetStatusId",
    },
    async () => {
      await expect(
        ProjectTaskService.transitionTask(mockProjectId, mockTaskId, {})
      ).rejects.toThrow(
        "Throw ValidationException: Either transitionId or targetStatusId is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "12/09/2026",
      description: "Trim khoang trang o projectId, taskId va summary truoc khi goi API",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockTask });

      await ProjectTaskService.createTask(`  ${mockProjectId}  `, {
        summary: "   Tiêu đề task mới   ",
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks`,
        {
          summary: "Tiêu đề task mới",
        }
      );
    }
  );
});
