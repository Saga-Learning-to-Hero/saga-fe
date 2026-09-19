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
      const mockPageResponse = { items: [{ id: "c1", sha: "abc1234" }], page: 0, size: 50, total: 1 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPageResponse });

      const result = await ProjectProjectionService.getTaskCommits(mockProjectId, mockTaskId);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/tasks/task-456/commits",
        { params: { page: 0, size: 50 } }
      );
      expect(result).toEqual(mockPageResponse);
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
      const mockPageResponse = { items: [{ id: "c1", sha: "sha-1" }], page: 0, size: 50, total: 1 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPageResponse });

      const result = await ProjectProjectionService.getProjectCommits(mockProjectId);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/commits",
        { params: { page: 0, size: 50 } }
      );
      expect(result).toEqual(mockPageResponse);
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

  fptTest(
    {
      id: "UTCID16",
      type: "N",
      executedDate: "13/09/2026",
      description: "getRepositoryBranches goi GET voi projectId va repoId hop le",
    },
    async () => {
      const mockBranchResponse = {
        repoId: "repo-001",
        repositoryFullName: "Saga-Learning-to-Hero/saga-fe",
        branchCount: 3,
        branches: [
          { name: "main", isDefault: true },
          { name: "dev", isDefault: false },
          { name: "feat/SAGA-66", isDefault: false },
        ],
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBranchResponse });

      const result = await ProjectProjectionService.getRepositoryBranches(
        mockProjectId,
        "repo-001"
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/repos/repo-001/branches"
      );
      expect(result).toEqual(mockBranchResponse);
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "A",
      executedDate: "13/09/2026",
      description: "getRepositoryBranches nem loi khi projectId rong",
    },
    async () => {
      await expect(
        ProjectProjectionService.getRepositoryBranches("", "repo-001")
      ).rejects.toThrow("Throw ValidationException: Project ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "A",
      executedDate: "13/09/2026",
      description: "getRepositoryBranches nem loi khi repoId rong",
    },
    async () => {
      await expect(
        ProjectProjectionService.getRepositoryBranches(mockProjectId, "  ")
      ).rejects.toThrow("Throw ValidationException: Repo ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "B",
      executedDate: "13/09/2026",
      description: "getRepositoryBranches cat khoang trang o hai dau cua projectId va repoId",
    },
    async () => {
      const mockBranchResponse = {
        repoId: "repo-001",
        repositoryFullName: "Saga-Learning-to-Hero/saga-fe",
        branchCount: 1,
        branches: [{ name: "main", isDefault: true }],
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBranchResponse });

      const result = await ProjectProjectionService.getRepositoryBranches(
        "  proj-123  ",
        "  repo-001  "
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/repos/repo-001/branches"
      );
      expect(result).toEqual(mockBranchResponse);
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "N",
      executedDate: "15/09/2026",
      description: "getProjectTaskCommitLinks gui repoId UUID va branchName canonical",
    },
    async () => {
      const response = {
        projectId: mockProjectId,
        filter: {
          repoId: "repo-uuid",
          repositoryId: 123,
          repositoryFullName: "org/repo",
          branchName: "develop",
          branchResolution: "REACHABLE_AT_SYNC",
          resolvedAt: "2026-09-15T10:00:00",
        },
        links: [],
        page: 0,
        size: 200,
        total: 0,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: response });

      const result = await ProjectProjectionService.getProjectTaskCommitLinks(
        ` ${mockProjectId} `,
        { repoId: " repo-uuid ", branchName: " develop " }
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/task-commit-links",
        { params: { repoId: "repo-uuid", branchName: "develop", page: 0, size: 200 } }
      );
      expect(result).toEqual(response);
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "B",
      executedDate: "15/09/2026",
      description: "getProjectTaskCommitLinks gom het cac batch page ma khong query theo tung task",
    },
    async () => {
      const filter = {
        repoId: null,
        repositoryId: null,
        repositoryFullName: null,
        branchName: null,
        branchResolution: "REACHABLE_AT_SYNC",
        resolvedAt: null,
      };
      const firstLink = { taskId: "task-1", commitId: "commit-1" };
      const lastLink = { taskId: "task-2", commitId: "commit-201" };
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({
          data: {
            projectId: mockProjectId,
            filter,
            links: [firstLink],
            page: 0,
            size: 200,
            total: 201,
          },
        })
        .mockResolvedValueOnce({
          data: {
            projectId: mockProjectId,
            filter,
            links: [lastLink],
            page: 1,
            size: 200,
            total: 201,
          },
        });

      const result = await ProjectProjectionService.getProjectTaskCommitLinks(mockProjectId);

      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenNthCalledWith(
        2,
        "/api/projects/proj-123/task-commit-links",
        { params: { page: 1, size: 200 } }
      );
      expect(result.links).toEqual([firstLink, lastLink]);
      expect(result.total).toBe(201);
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "A",
      executedDate: "15/09/2026",
      description: "getProjectTaskCommitLinks khong cho gui branchName neu thieu repoId",
    },
    async () => {
      await expect(
        ProjectProjectionService.getProjectTaskCommitLinks(mockProjectId, {
          branchName: "develop",
        })
      ).rejects.toThrow("Repo ID is required when filtering by branch");
      expect(apiClient.get).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID23",
      type: "N",
      executedDate: "17/09/2026",
      description: "getProjectCommitDetail goi GET voi projectId va gitCommitId hop le",
    },
    async () => {
      const mockDetail = {
        gitCommitId: "commit-123",
        repoId: "repo-1",
        repositoryFullName: "owner/repo",
        sha: "abc1234567890",
        message: "feat: [FE][SAGA-79] commit test",
        authorName: "Hai Le",
        authorLogin: "haile",
        committedAt: "2026-09-17T02:00:00Z",
        htmlUrl: "https://github.com/owner/repo/commit/abc1234",
        stats: { total: 10, additions: 8, deletions: 2 },
        parents: [{ sha: "parent123" }],
        filesTruncated: false,
        files: [
          {
            filename: "src/App.tsx",
            previousFilename: null,
            status: "modified",
            additions: 8,
            deletions: 2,
            changes: 10,
            patch: "@@ -1,3 +1,5 @@",
          },
        ],
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDetail });

      const result = await ProjectProjectionService.getProjectCommitDetail(
        mockProjectId,
        "commit-123"
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/commits/commit-123"
      );
      expect(result).toEqual(mockDetail);
    }
  );

  fptTest(
    {
      id: "UTCID24",
      type: "A",
      executedDate: "17/09/2026",
      description: "getProjectCommitDetail nem loi khi projectId rong",
    },
    async () => {
      await expect(
        ProjectProjectionService.getProjectCommitDetail("", "commit-123")
      ).rejects.toThrow("Throw ValidationException: Project ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID25",
      type: "A",
      executedDate: "17/09/2026",
      description: "getProjectCommitDetail nem loi khi gitCommitId rong",
    },
    async () => {
      await expect(
        ProjectProjectionService.getProjectCommitDetail(mockProjectId, "  ")
      ).rejects.toThrow("Throw ValidationException: Git Commit ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID26",
      type: "B",
      executedDate: "17/09/2026",
      description: "getProjectCommitDetail cat khoang trang o hai dau",
    },
    async () => {
      const mockDetail = { gitCommitId: "commit-123" };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDetail });

      const result = await ProjectProjectionService.getProjectCommitDetail(
        "  proj-123  ",
        "  commit-123  "
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/commits/commit-123"
      );
      expect(result).toEqual(mockDetail);
    }
  );

  fptTest(
    {
      id: "UTCID27",
      type: "N",
      executedDate: "17/09/2026",
      description: "patchProject goi PATCH voi payload hop le",
    },
    async () => {
      const mockUpdated = {
        projectId: mockProjectId,
        name: "Du an moi",
        description: "Mo ta moi",
      };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockUpdated });

      const result = await ProjectProjectionService.patchProject(mockProjectId, {
        name: "Du an moi",
        description: "Mo ta moi",
      });

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/projects/proj-123",
        {
          name: "Du an moi",
          description: "Mo ta moi",
        }
      );
      expect(result).toEqual(mockUpdated);
    }
  );

  fptTest(
    {
      id: "UTCID28",
      type: "A",
      executedDate: "17/09/2026",
      description: "patchProject nem loi khi projectId rong",
    },
    async () => {
      await expect(
        ProjectProjectionService.patchProject("", {
          name: "Ten",
          description: "Mo ta",
        })
      ).rejects.toThrow("Throw ValidationException: Project ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID29",
      type: "A",
      executedDate: "17/09/2026",
      description: "patchProject nem loi khi name rong",
    },
    async () => {
      await expect(
        ProjectProjectionService.patchProject(mockProjectId, {
          name: "  ",
          description: "Mo ta",
        })
      ).rejects.toThrow("Throw ValidationException: Project name is required");
    }
  );

  fptTest(
    {
      id: "UTCID30",
      type: "B",
      executedDate: "17/09/2026",
      description: "patchProject cat khoang trang o name va description",
    },
    async () => {
      const mockUpdated = { projectId: mockProjectId };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockUpdated });

      await ProjectProjectionService.patchProject("  proj-123  ", {
        name: "  Du an chuan  ",
        description: "  Mo ta chuan  ",
      });

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/projects/proj-123",
        {
          name: "Du an chuan",
          description: "Mo ta chuan",
        }
      );
    }
  );
});
