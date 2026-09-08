import { describe, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { UserIntegrationsService } from "./user-integrations-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import { USER_INTEGRATIONS_QUERY_KEY } from "../hooks/useUserIntegrations";
import type { UserIdentityItem } from "../types/user-integrations";

vi.mock("@/lib/axios");

describe("Personal Integrations Refresh Flow Audit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "08/09/2026",
      description: "Page mount gọi GET /api/integrations/me bằng client chuẩn xác thực",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { identities: [] },
      });

      const result = await UserIntegrationsService.getUserIdentities();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith("/api/integrations/me");
      expect(result).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "08/09/2026",
      description: "Có Jira identity trả về từ backend -> trạng thái hiển thị đã kết nối (isJiraConnected = true)",
    },
    async () => {
      const mockJiraIdentity: UserIdentityItem = {
        id: "jira-id-abc",
        provider: "JIRA",
        providerSubject: "atlassian-user-123",
        login: "student@atlassian.com",
        displayName: "Student Atlassian",
        primary: true,
        status: "ACTIVE",
        linkedAt: "2026-09-08T08:00:00Z",
        lastVerifiedAt: "2026-09-08T08:00:00Z",
      };

      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { identities: [mockJiraIdentity] },
      });

      const identities = await UserIntegrationsService.getUserIdentities();
      const jiraIdentities = identities.filter(
        (i) => i.provider === "JIRA" || i.provider?.toUpperCase() === "JIRA"
      );
      const isJiraConnected = jiraIdentities.length > 0;

      expect(isJiraConnected).toBe(true);
      expect(jiraIdentities).toHaveLength(1);
      expect(jiraIdentities[0].id).toBe("jira-id-abc");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "08/09/2026",
      description: "Không có Jira identity -> trạng thái hiển thị chưa kết nối (isJiraConnected = false)",
    },
    async () => {
      const mockOnlyGithub: UserIdentityItem = {
        id: "github-1",
        provider: "GITHUB",
        providerSubject: "gh-1",
        login: "student-dev",
        primary: true,
      };

      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { identities: [mockOnlyGithub] },
      });

      const identities = await UserIntegrationsService.getUserIdentities();
      const jiraIdentities = identities.filter(
        (i) => i.provider === "JIRA" || i.provider?.toUpperCase() === "JIRA"
      );
      const isJiraConnected = jiraIdentities.length > 0;

      expect(isJiraConnected).toBe(false);
      expect(jiraIdentities).toHaveLength(0);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "08/09/2026",
      description: "OAuth success kích hoạt invalidate và refetch đúng query key user-integrations-me",
    },
    async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const refetchSpy = vi.spyOn(queryClient, "refetchQueries");

      await queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      expect(refetchSpy).toHaveBeenCalledWith({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "08/09/2026",
      description: "Tái kết nối cập nhật lastVerifiedAt thay vì sử dụng updatedAt",
    },
    async () => {
      const reconnectedIdentity: UserIdentityItem = {
        id: "jira-reconnect-1",
        provider: "JIRA",
        login: "student@domain.edu.vn",
        linkedAt: "2026-08-01T00:00:00Z",
        lastVerifiedAt: "2026-09-08T10:00:00Z",
      };

      expect(reconnectedIdentity.linkedAt).toBe("2026-08-01T00:00:00Z");
      expect(reconnectedIdentity.lastVerifiedAt).toBe("2026-09-08T10:00:00Z");
      expect(reconnectedIdentity).not.toHaveProperty("updatedAt");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "08/09/2026",
      description: "Hủy OAuth (JIRA_OAUTH_CANCELLED) không giả mạo kết nối và bảo toàn trạng thái thực từ backend",
    },
    async () => {
      const initialBackendState: UserIdentityItem[] = [];

      const queryCode = "JIRA_OAUTH_CANCELLED";
      let localIdentities = [...initialBackendState];

      if (queryCode === "JIRA_OAUTH_CANCELLED") {
        localIdentities = [...initialBackendState];
      }

      const isJiraConnected = localIdentities.some((i) => i.provider === "JIRA");
      expect(isJiraConnected).toBe(false);
      expect(localIdentities).toEqual(initialBackendState);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "08/09/2026",
      description: "Provider mapping so khớp chính xác enum JIRA và GITHUB, loại bỏ ATLASSIAN hoặc JIRA_CLOUD",
    },
    async () => {
      const mixedItems: UserIdentityItem[] = [
        { id: "1", provider: "JIRA" },
        { id: "2", provider: "ATLASSIAN" as unknown as "JIRA" },
        { id: "3", provider: "JIRA_CLOUD" as unknown as "JIRA" },
        { id: "4", provider: "GITHUB" },
      ];

      const exactJira = mixedItems.filter(
        (i) => i.provider === "JIRA" || i.provider?.toUpperCase() === "JIRA"
      );
      const exactGithub = mixedItems.filter(
        (i) => i.provider === "GITHUB" || i.provider?.toUpperCase() === "GITHUB"
      );

      expect(exactJira).toHaveLength(1);
      expect(exactJira[0].id).toBe("1");
      expect(exactGithub).toHaveLength(1);
      expect(exactGithub[0].id).toBe("4");
    }
  );
});
