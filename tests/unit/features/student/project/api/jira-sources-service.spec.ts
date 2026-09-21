import { describe, expect, vi, beforeEach } from "vitest";
import { JiraSourcesService } from "@/features/student/project/api/jira-sources-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("JiraSourcesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = "proj-123";
  const mockIntegrationId = "jira-int-456";
  const mockRunId = "run-789";
  const mockItemId = "item-101";

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "21/09/2026",
      description: "listJiraSources goi GET voi projectId hop le va tra ve danh sach sources",
    },
    async () => {
      const mockSources = [
        {
          integrationId: "jira-1",
          cloudId: "cloud-1",
          siteName: "Site 1",
          jiraProjectId: "jp-1",
          projectKey: "SAGA",
          boardId: "10",
          connectionStatus: "ACTIVE" as const,
          lastSuccessfulSyncAt: "2026-09-20T00:00:00Z",
          lastSyncedAt: "2026-09-20T00:00:00Z",
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSources });

      const result = await JiraSourcesService.listJiraSources(mockProjectId);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources"
      );
      expect(result).toEqual(mockSources);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "21/09/2026",
      description: "listJiraSources nem loi ValidationException khi projectId rong",
    },
    async () => {
      await expect(JiraSourcesService.listJiraSources("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "21/09/2026",
      description: "listJiraSources cat khoang trang trim o hai dau cua projectId",
    },
    async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await JiraSourcesService.listJiraSources("  proj-123  ");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources"
      );
      expect(result).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "21/09/2026",
      description: "connectJiraSource goi POST tao url ket noi moi",
    },
    async () => {
      const mockConnectResponse = {
        redirectUrl: "https://auth.atlassian.com/authorize",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockConnectResponse });

      const result = await JiraSourcesService.connectJiraSource(mockProjectId);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/connect",
        null,
        { params: undefined }
      );
      expect(result).toEqual(mockConnectResponse);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "21/09/2026",
      description: "connectJiraSource goi POST co returnPath params",
    },
    async () => {
      const mockConnectResponse = {
        redirectUrl: "https://auth.atlassian.com/authorize",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockConnectResponse });

      const result = await JiraSourcesService.connectJiraSource(
        mockProjectId,
        "/student/project-info"
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/connect",
        null,
        { params: { returnPath: "/student/project-info" } }
      );
      expect(result).toEqual(mockConnectResponse);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "21/09/2026",
      description: "connectJiraSource nem loi ValidationException khi projectId rong",
    },
    async () => {
      await expect(JiraSourcesService.connectJiraSource("   ")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "21/09/2026",
      description: "reconnectJiraSource goi POST voi integrationId hop le",
    },
    async () => {
      const mockConnectResponse = {
        redirectUrl: "https://auth.atlassian.com/authorize",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockConnectResponse });

      const result = await JiraSourcesService.reconnectJiraSource(
        mockProjectId,
        mockIntegrationId
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/reconnect",
        null,
        { params: undefined }
      );
      expect(result).toEqual(mockConnectResponse);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "21/09/2026",
      description: "reconnectJiraSource nem loi khi integrationId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.reconnectJiraSource(mockProjectId, "")
      ).rejects.toThrow("Throw ValidationException: Integration ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "21/09/2026",
      description: "saveJiraSourceSelection goi PUT cap nhat site va board",
    },
    async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: {} });

      const payload = {
        cloudId: "cloud-1",
        jiraProjectId: "jp-1",
        boardId: "10",
      };

      await JiraSourcesService.saveJiraSourceSelection(
        mockProjectId,
        mockIntegrationId,
        payload
      );

      expect(apiClient.put).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456",
        payload
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "21/09/2026",
      description: "saveJiraSourceSelection nem loi khi projectId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.saveJiraSourceSelection("", mockIntegrationId, {
          cloudId: "c",
          jiraProjectId: "jp",
          boardId: "1",
        })
      ).rejects.toThrow("Throw ValidationException: Project ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "21/09/2026",
      description: "disconnectJiraSource goi DELETE ngat ket noi mem thu hoi uy quyen",
    },
    async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

      await JiraSourcesService.disconnectJiraSource(mockProjectId, mockIntegrationId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456"
      );
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "21/09/2026",
      description: "disconnectJiraSource nem loi khi integrationId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.disconnectJiraSource(mockProjectId, "  ")
      ).rejects.toThrow("Throw ValidationException: Integration ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "21/09/2026",
      description: "syncJiraSource goi POST dong bo nguon Jira rieng biet tra ve queue status",
    },
    async () => {
      const mockSync = {
        jobId: "job-1",
        provider: "JIRA",
        status: "QUEUED",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockSync });

      const result = await JiraSourcesService.syncJiraSource(
        mockProjectId,
        mockIntegrationId
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/sync"
      );
      expect(result).toEqual(mockSync);
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "A",
      executedDate: "21/09/2026",
      description: "syncJiraSource nem loi khi projectId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.syncJiraSource("", mockIntegrationId)
      ).rejects.toThrow("Throw ValidationException: Project ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "21/09/2026",
      description: "getJiraSourceTaskOptions goi GET lay option issueTypes va assignableUsers theo source",
    },
    async () => {
      const mockOptions = {
        issueTypes: [{ id: "1", name: "Task" }],
        assignableUsers: [{ accountId: "acc-1", displayName: "Nguyen Van A" }],
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockOptions });

      const result = await JiraSourcesService.getJiraSourceTaskOptions(
        mockProjectId,
        mockIntegrationId
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/task-options"
      );
      expect(result).toEqual(mockOptions);
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "A",
      executedDate: "21/09/2026",
      description: "getJiraSourceTaskOptions nem loi khi integrationId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.getJiraSourceTaskOptions(mockProjectId, "")
      ).rejects.toThrow("Throw ValidationException: Integration ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "N",
      executedDate: "21/09/2026",
      description: "previewFailover goi POST preview danh sach task chuyen giao",
    },
    async () => {
      const mockPreview = {
        sourceIntegrationId: mockIntegrationId,
        targetIntegrationId: "target-int-789",
        targetProjectKey: "NEW",
        totalCandidateTasks: 2,
        eligibleTasks: [
          {
            taskId: "t1",
            externalKey: "SAGA-1",
            title: "Task 1",
            status: "TODO",
            storyPoint: 3,
            hasCommits: false,
            hasEvidence: false,
          },
        ],
        excludedTasks: [],
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockPreview });

      const result = await JiraSourcesService.previewFailover(
        mockProjectId,
        mockIntegrationId,
        { targetIntegrationId: "target-int-789" }
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/failover/preview",
        { targetIntegrationId: "target-int-789" }
      );
      expect(result).toEqual(mockPreview);
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "A",
      executedDate: "21/09/2026",
      description: "previewFailover nem loi khi targetIntegrationId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.previewFailover(mockProjectId, mockIntegrationId, {
          targetIntegrationId: "",
        })
      ).rejects.toThrow("Throw ValidationException: Target Integration ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "N",
      executedDate: "21/09/2026",
      description: "executeFailover goi POST thuc hien failover va nhan runId 202 Accepted",
    },
    async () => {
      const mockExecute = {
        runId: mockRunId,
        status: "RUNNING" as const,
        totalItems: 1,
        processedItems: 0,
        succeededItems: 0,
        failedItems: 0,
        unknownItems: 0,
        sourceIntegrationId: mockIntegrationId,
        targetIntegrationId: "target-int-789",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockExecute });

      const result = await JiraSourcesService.executeFailover(
        mockProjectId,
        mockIntegrationId,
        {
          targetIntegrationId: "target-int-789",
          revokeSource: true,
          sourceTaskIds: ["t1"],
        }
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/failover",
        {
          targetIntegrationId: "target-int-789",
          revokeSource: true,
          sourceTaskIds: ["t1"],
        }
      );
      expect(result).toEqual(mockExecute);
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "A",
      executedDate: "21/09/2026",
      description: "executeFailover nem loi khi sourceTaskIds rong",
    },
    async () => {
      await expect(
        JiraSourcesService.executeFailover(mockProjectId, mockIntegrationId, {
          targetIntegrationId: "target-int-789",
          revokeSource: true,
          sourceTaskIds: [],
        })
      ).rejects.toThrow("Throw ValidationException: sourceTaskIds must not be empty");
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "N",
      executedDate: "21/09/2026",
      description: "retryFailover goi POST retry lai tien trinh runId",
    },
    async () => {
      const mockRetry = {
        runId: mockRunId,
        status: "RUNNING" as const,
        totalItems: 1,
        processedItems: 0,
        succeededItems: 0,
        failedItems: 0,
        unknownItems: 0,
        sourceIntegrationId: mockIntegrationId,
        targetIntegrationId: "target-int-789",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRetry });

      const result = await JiraSourcesService.retryFailover(
        mockProjectId,
        mockIntegrationId,
        mockRunId
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/failover/runs/run-789/retry"
      );
      expect(result).toEqual(mockRetry);
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "A",
      executedDate: "21/09/2026",
      description: "retryFailover nem loi khi runId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.retryFailover(mockProjectId, mockIntegrationId, "  ")
      ).rejects.toThrow("Throw ValidationException: runId is required");
    }
  );

  fptTest(
    {
      id: "UTCID23",
      type: "N",
      executedDate: "21/09/2026",
      description: "reconcileFailoverItem goi POST verify va bind remoteIssueIdOrKey",
    },
    async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

      await JiraSourcesService.reconcileFailoverItem(
        mockProjectId,
        mockIntegrationId,
        mockRunId,
        mockItemId,
        { remoteIssueIdOrKey: "NEW-123" }
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/failover/runs/run-789/items/item-101/reconcile",
        { remoteIssueIdOrKey: "NEW-123" }
      );
    }
  );

  fptTest(
    {
      id: "UTCID24",
      type: "A",
      executedDate: "21/09/2026",
      description: "reconcileFailoverItem nem loi khi remoteIssueIdOrKey rong",
    },
    async () => {
      await expect(
        JiraSourcesService.reconcileFailoverItem(
          mockProjectId,
          mockIntegrationId,
          mockRunId,
          mockItemId,
          { remoteIssueIdOrKey: "" }
        )
      ).rejects.toThrow(
        "Throw ValidationException: remoteIssueIdOrKey is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID25",
      type: "N",
      executedDate: "21/09/2026",
      description: "getFailoverRun goi GET lay chi tiet tien trinh run kem phan trang item",
    },
    async () => {
      const mockRun = {
        runId: mockRunId,
        status: "SUCCEEDED" as const,
        sourceIntegrationId: mockIntegrationId,
        targetIntegrationId: "target-int-789",
        totalItems: 1,
        processedItems: 1,
        succeededItems: 1,
        failedItems: 0,
        unknownItems: 0,
        startedAt: "2026-09-21T00:00:00Z",
        completedAt: "2026-09-21T00:01:00Z",
        items: [],
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRun });

      const result = await JiraSourcesService.getFailoverRun(
        mockProjectId,
        mockIntegrationId,
        mockRunId,
        0,
        50
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/projects/proj-123/integrations/jira-sources/jira-int-456/failover/runs/run-789",
        { params: { page: 0, size: 50 } }
      );
      expect(result).toEqual(mockRun);
    }
  );

  fptTest(
    {
      id: "UTCID26",
      type: "A",
      executedDate: "21/09/2026",
      description: "getFailoverRun nem loi khi runId rong",
    },
    async () => {
      await expect(
        JiraSourcesService.getFailoverRun(mockProjectId, mockIntegrationId, "")
      ).rejects.toThrow("Throw ValidationException: runId is required");
    }
  );
});
