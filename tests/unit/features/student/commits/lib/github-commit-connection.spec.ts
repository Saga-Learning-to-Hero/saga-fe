import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  formatSyncEnqueueLabel,
  isGitHubRepoActive,
  resolveGitHubConnectionStatus,
  resolveGitHubSyncBadgeKind,
} from "@/features/student/commits/lib/github-commit-connection";
import type { ProjectIntegrationsResponse } from "@/features/student/project/types/student-project";

const activeIntegrations: Pick<ProjectIntegrationsResponse, "github"> = {
  github: {
    status: "ACTIVE",
    repositories: [{ id: "repo-1", repositoryId: 1, fullName: "org/saga-fe", status: "ACTIVE" }],
  },
};

const revokedIntegrations: Pick<ProjectIntegrationsResponse, "github"> = {
  github: {
    status: "REVOKED",
    repositories: [{ id: "repo-1", repositoryId: 1, fullName: "org/saga-fe", status: "REVOKED" }],
  },
};

describe("github-commit-connection", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "ACTIVE va job SUCCEEDED hien Da dong bo",
    },
    () => {
      expect(
        resolveGitHubConnectionStatus({ connectionStatus: "ACTIVE" }, activeIntegrations)
      ).toBe("ACTIVE");
      expect(
        resolveGitHubSyncBadgeKind({ connectionStatus: "ACTIVE", jobStatus: "SUCCEEDED" })
      ).toBe("synced");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "29/09/2026",
      description: "REVOKED ke ca job SUCCEEDED cu van la ngat ket noi",
    },
    () => {
      expect(
        resolveGitHubConnectionStatus({ connectionStatus: "REVOKED" }, activeIntegrations)
      ).toBe("REVOKED");
      expect(
        resolveGitHubSyncBadgeKind({ connectionStatus: "REVOKED", jobStatus: "SUCCEEDED" })
      ).toBe("revoked");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "29/09/2026",
      description: "NOT_CONNECTED khi khong co GitHub",
    },
    () => {
      expect(resolveGitHubConnectionStatus(null, { github: null })).toBe("NOT_CONNECTED");
      expect(resolveGitHubSyncBadgeKind({ connectionStatus: "NOT_CONNECTED" })).toBe("not_connected");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "29/09/2026",
      description: "Repo lich su khong ACTIVE thi khong goi branches",
    },
    () => {
      expect(isGitHubRepoActive({ id: "repo-old", fullPath: "org/old" }, revokedIntegrations)).toBe(false);
      expect(isGitHubRepoActive({ id: "repo-1", fullPath: "org/saga-fe" }, activeIntegrations)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "29/09/2026",
      description: "Thieu connectionStatus suy tu integrations; SKIPPED_* dich tieng Viet",
    },
    () => {
      expect(resolveGitHubConnectionStatus(undefined, revokedIntegrations)).toBe("REVOKED");
      expect(resolveGitHubConnectionStatus(undefined, activeIntegrations)).toBe("ACTIVE");
      expect(resolveGitHubConnectionStatus(undefined, { github: null })).toBe("NOT_CONNECTED");
      expect(formatSyncEnqueueLabel("SKIPPED_NOT_ACTIVE")).toBe(
        "GitHub đã bị ngắt kết nối, không thể đồng bộ."
      );
      expect(formatSyncEnqueueLabel("SKIPPED_NOT_CONFIGURED")).toBe("Dự án chưa kết nối GitHub.");
      expect(formatSyncEnqueueLabel("SKIPPED_ALREADY_RUNNING")).toBe("Đang có một lượt đồng bộ chạy.");
      expect(formatSyncEnqueueLabel("SKIPPED_NO_CREDENTIAL")).toBe(
        "Thiếu quyền truy cập, cần kết nối lại."
      );
      expect(formatSyncEnqueueLabel("QUEUED")).toBe("Đã đưa vào hàng đợi");
    }
  );
});
