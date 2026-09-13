import { describe, expect, vi, beforeEach } from "vitest";
import { ProjectProjectionService } from "./project-projection-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("ProjectProjectionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = "proj-123";
  const mockTaskId = "task-456";
  const mockStudentId = "stu-789";

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "12/09/2026",
      description: "syncProject goi POST voi projectId hop le va tra ve ket qua",
    },
    async () => {
      const mockResponse = { data: { jira: "QUEUED", github: "QUEUED" } };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await ProjectProjectionService.syncProject(mockProjectId);

      expect(apiClient.post).toHaveBeenCalledWith("/api/projects/proj-123/sync");
      expect(result).toEqual({ jira: "QUEUED", github: "QUEUED" });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "12/09/2026",
      description: "syncProject nem loi ValidationException khi projectId rong",
    },
    async () => {
      await expect(ProjectProjectionService.syncProject("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "12/09/2026",
      description: "syncProject cat khoang trang o hai dau cua projectId",
    },
    async () => {
      const mockResponse = { data: { jira: "SKIPPED", github: "QUEUED" } };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await ProjectProjectionService.syncProject("  proj-123  ");

      expect(apiClient.post).toHaveBeenCalledWith("/api/projects/proj-123/sync");
      expect(result).toEqual({ jira: "SKIPPED", github: "QUEUED" });
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "12/09/2026",
      description: "getProjectTasks goi GET voi projectId hop le va tra ve danh sach task",
    },
    async () => {
      const mockTasks = [{ id: "t1", title: "Task 1" }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockTasks });

      const result = await ProjectProjectionService.getProjectTasks(mockProjectId);

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/proj-123/tasks");
      expect(result).toEqual(mockTasks);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "12/09/2026",
      description: "getProjectTasks nem loi ValidationException khi projectId null hoac rong",
    },
    async () => {
      await expect(ProjectProjectionService.getProjectTasks("   ")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "12/09/2026",
      description: "getProjectSyncStatus goi GET va tra ve trang thai dong bo",
    },
    async () => {
      const mockStatuses = [{ projectId: mockProjectId, provider: "JIRA", status: "SUCCEEDED" }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatuses });

      const result = await ProjectProjectionService.getProjectSyncStatus(mockProjectId);

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/proj-123/sync-status");
      expect(result).toEqual(mockStatuses);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "12/09/2026",
      description: "getProjectSyncStatus nem loi khi projectId rong",
    },
    async () => {
      await expect(ProjectProjectionService.getProjectSyncStatus("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "12/09/2026",
      description: "getTaskCommits goi GET voi projectId va taskId hop le",
    },
    async () => {
      const mockCommits = [{ id: "c1", sha: "abc1234" }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCommits });

      const result = await ProjectProjectionService.getTaskCommits(mockProjectId, mockTaskId);

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/proj-123/tasks/task-456/commits");
      expect(result).toEqual(mockCommits);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "12/09/2026",
      description: "getTaskCommits nem loi khi taskId rong",
    },
    async () => {
      await expect(ProjectProjectionService.getTaskCommits(mockProjectId, "  ")).rejects.toThrow(
        "Throw ValidationException: Task ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "N",
      executedDate: "12/09/2026",
      description: "getProjectCommits goi GET voi projectId hop le",
    },
    async () => {
      const mockCommits = [{ id: "c1", sha: "sha-1" }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCommits });

      const result = await ProjectProjectionService.getProjectCommits(mockProjectId);

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/proj-123/commits");
      expect(result).toEqual(mockCommits);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "12/09/2026",
      description: "getProjectCommits nem loi khi projectId rong",
    },
    async () => {
      await expect(ProjectProjectionService.getProjectCommits("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "N",
      executedDate: "12/09/2026",
      description: "getProjectProgress goi GET voi projectId hop le",
    },
    async () => {
      const mockProgress = { projectId: mockProjectId, teamNo: 1, teamName: "Team 1" };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProgress });

      const result = await ProjectProjectionService.getProjectProgress(mockProjectId);

      expect(apiClient.get).toHaveBeenCalledWith("/api/projects/proj-123/progress");
      expect(result).toEqual(mockProgress);
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "12/09/2026",
      description: "getProjectProgress nem loi khi projectId rong",
    },
    async () => {
      await expect(ProjectProjectionService.getProjectProgress("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "N",
      executedDate: "12/09/2026",
      description: "getMemberProgress goi GET voi projectId va studentId hop le",
    },
    async () => {
      const mockMemberProgress = { studentId: mockStudentId, fullName: "Nguyen Van A" };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockMemberProgress });

      const result = await ProjectProjectionService.getMemberProgress(mockProjectId, mockStudentId);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/progress/members/stu-789"
      );
      expect(result).toEqual(mockMemberProgress);
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "A",
      executedDate: "12/09/2026",
      description: "getMemberProgress nem loi khi studentId rong",
    },
    async () => {
      await expect(
        ProjectProjectionService.getMemberProgress(mockProjectId, "")
      ).rejects.toThrow("Throw ValidationException: Student ID is required");
    }
  );
});
