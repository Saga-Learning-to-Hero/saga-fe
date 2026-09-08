import { describe, expect, vi, beforeEach } from "vitest";
import { UserIntegrationsService } from "./user-integrations-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("UserIntegrationsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockIdentities = [
    {
      id: "jira-id-1",
      provider: "JIRA",
      providerSubject: "jira-acc-1",
      login: "student.jira@example.com",
      displayName: "Student Jira",
      primary: true,
      status: "ACTIVE",
      linkedAt: "2026-09-08T00:00:00Z",
    },
    {
      id: "jira-id-2",
      provider: "JIRA",
      providerSubject: "jira-acc-2",
      login: "student.secondary@example.com",
      displayName: "Secondary Jira",
      primary: false,
      status: "ACTIVE",
      linkedAt: "2026-09-08T01:00:00Z",
    },
    {
      id: "github-id-1",
      provider: "GITHUB",
      providerSubject: "123456",
      login: "student-octocat",
      displayName: "Student GitHub",
      primary: true,
      status: "ACTIVE",
      linkedAt: "2026-09-08T00:00:00Z",
    },
  ];

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "08/09/2026",
      description: "Lấy danh sách identities thành công khi có nhiều tài khoản liên kết",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { identities: mockIdentities },
      });

      const res = await UserIntegrationsService.getUserIdentities();

      expect(res).toHaveLength(3);
      expect(res[0].id).toBe("jira-id-1");
      expect(res[0].primary).toBe(true);
      expect(res[1].id).toBe("jira-id-2");
      expect(res[1].primary).toBe(false);
      expect(res[2].provider).toBe("GITHUB");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "08/09/2026",
      description: "Trả về mảng rỗng [] khi API trả về data identities rỗng",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { identities: [] },
      });

      const res = await UserIntegrationsService.getUserIdentities();

      expect(res).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "08/09/2026",
      description: "Trả về mảng rỗng [] khi response data không có thuộc tính identities",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: null,
      });

      const res = await UserIntegrationsService.getUserIdentities();

      expect(res).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "08/09/2026",
      description: "Ném ngoại lệ khi Backend trả về HTTP 500",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        new Error("Internal Server Error")
      );

      await expect(UserIntegrationsService.getUserIdentities()).rejects.toThrow(
        "Internal Server Error"
      );
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "08/09/2026",
      description: "Ném ngoại lệ khi Backend trả về HTTP 401 Unauthorized",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      await expect(UserIntegrationsService.getUserIdentities()).rejects.toThrow(
        "Unauthorized"
      );
    }
  );
});
