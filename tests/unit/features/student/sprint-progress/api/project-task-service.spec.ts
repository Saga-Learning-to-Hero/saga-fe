import { describe, expect, vi, beforeEach } from "vitest";
import { ProjectTaskService } from "@/features/student/sprint-progress/api/project-task-service";
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

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "15/09/2026",
      description: "Create Task giu nguyen startDate va dueDate ISO date trong payload",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockTask });

      await ProjectTaskService.createTask(mockProjectId, {
        summary: "Task có kế hoạch ngày",
        startDate: "2026-09-15",
        dueDate: "2026-09-22",
      });

      expect(postSpy).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/tasks`, {
        summary: "Task có kế hoạch ngày",
        startDate: "2026-09-15",
        dueDate: "2026-09-22",
      });
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "N",
      executedDate: "15/09/2026",
      description: "Patch mot ngay va clear ngay con lai ma khong gui gia tri suy doan",
    },
    async () => {
      const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: mockTask });

      await ProjectTaskService.patchTask(mockProjectId, mockTaskId, {
        startDate: "2026-09-16",
        clearDueDate: true,
      });

      expect(patchSpy).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/${mockTaskId}`,
        {
          startDate: "2026-09-16",
          clearDueDate: true,
        }
      );
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "19/09/2026",
      description: "Lay danh sach TaskParentOptionItem cho projectId thanh cong",
    },
    async () => {
      const mockParentOptions = {
        items: [
          {
            id: "task-p-1",
            title: "Parent Feature Task",
            status: "IN_PROGRESS",
            externalKey: "SAGA-10",
            parentTaskId: null,
          },
        ],
        page: 0,
        size: 50,
        total: 1,
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockParentOptions });

      const res = await ProjectTaskService.getParentOptions(mockProjectId, {
        excludeTaskId: mockTaskId,
      });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].title).toBe("Parent Feature Task");
      expect(res.items[0].externalKey).toBe("SAGA-10");
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/parent-options`,
        {
          params: { page: 0, size: 50, excludeTaskId: mockTaskId },
        }
      );
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "A",
      executedDate: "19/09/2026",
      description: "Nem ValidationException khi projectId rong khi goi getParentOptions",
    },
    async () => {
      await expect(ProjectTaskService.getParentOptions("   ")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "N",
      executedDate: "19/09/2026",
      description: "Lay du lieu TaskEvidence thanh cong",
    },
    async () => {
      const mockEvidence = {
        taskId: mockTaskId,
        taskKey: "SAGA-15",
        summary: "Task Evidence Test",
        commits: [],
        pullRequests: [],
        jiraIssues: [],
        totalItems: 0,
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockEvidence });

      const res = await ProjectTaskService.getTaskEvidence(mockProjectId, mockTaskId);

      expect(res).toBeDefined();
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/${mockTaskId}/evidence`,
        { params: undefined }
      );
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "A",
      executedDate: "19/09/2026",
      description: "Nem ValidationException khi projectId hoac taskId rong khi goi getTaskEvidence",
    },
    async () => {
      await expect(ProjectTaskService.getTaskEvidence("", mockTaskId)).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
      await expect(ProjectTaskService.getTaskEvidence(mockProjectId, "")).rejects.toThrow(
        "Throw ValidationException: Task ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "N",
      executedDate: "21/09/2026",
      description: "Lay dong thoi gian phien lam viec va commit cua Task thanh cong",
    },
    async () => {
      const mockTimeline = {
        task: {
          id: mockTaskId,
          externalKey: "SAGA-96",
          title: "Tich hop Dong thoi gian Phien lam viec",
        },
        workSessions: {
          sessionCount: 3,
          totalElapsedSeconds: 7200,
          openSessions: [],
          sessions: [],
          page: 0,
          size: 20,
          totalElements: 3,
          totalPages: 1,
        },
        commits: {
          items: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockTimeline });

      const res = await ProjectTaskService.getTaskWorkSessionTimeline(mockProjectId, mockTaskId);

      expect(res).toBeDefined();
      expect(res.task.id).toBe(mockTaskId);
      expect(res.task.externalKey).toBe("SAGA-96");
      expect(res.workSessions.sessionCount).toBe(3);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/${mockTaskId}/work-session-timeline`,
        { params: undefined }
      );
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "A",
      executedDate: "21/09/2026",
      description: "Nem ValidationException khi projectId hoac taskId rong khi goi getTaskWorkSessionTimeline",
    },
    async () => {
      await expect(ProjectTaskService.getTaskWorkSessionTimeline("", mockTaskId)).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
      await expect(ProjectTaskService.getTaskWorkSessionTimeline("   ", mockTaskId)).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
      await expect(ProjectTaskService.getTaskWorkSessionTimeline(mockProjectId, "")).rejects.toThrow(
        "Throw ValidationException: Task ID is required"
      );
      await expect(ProjectTaskService.getTaskWorkSessionTimeline(mockProjectId, "   ")).rejects.toThrow(
        "Throw ValidationException: Task ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "B",
      executedDate: "21/09/2026",
      description: "Goi getTaskWorkSessionTimeline voi params phan trang va loai tru",
    },
    async () => {
      const mockTimeline = {
        task: {
          id: mockTaskId,
          externalKey: "SAGA-96",
          title: "Tich hop Dong thoi gian Phien lam viec",
        },
        workSessions: {
          sessionCount: 0,
          totalElapsedSeconds: 0,
          openSessions: [],
          sessions: [],
          page: 1,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
        commits: {
          items: [],
          page: 1,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockTimeline });

      const params = {
        sessionPage: 1,
        sessionSize: 10,
        commitPage: 1,
        commitSize: 10,
        excludeCommits: true,
      };

      const res = await ProjectTaskService.getTaskWorkSessionTimeline(mockProjectId, mockTaskId, params);

      expect(res).toBeDefined();
      expect(res.task.id).toBe(mockTaskId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/tasks/${mockTaskId}/work-session-timeline`,
        { params }
      );
    }
  );
});
