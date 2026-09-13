import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { extractReposAndBranches, mapProjectCommitToCommitItem } from "./commit-mapper";

const commit = {
  id: "commit-1",
  repoId: "repo-1",
  repositoryFullName: "saga-learning/saga-fe",
  sha: "0123456789abcdef",
  message: "feat: [SAGA-66] Hien thi nhanh dung",
  authorExternalId: "octocat",
  authorStudentId: null,
  committedAt: "2026-09-13T09:00:00Z",
  createdAt: "2026-09-13T09:00:01Z",
};

describe("commit-mapper", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "13/09/2026",
      description: "mapProjectCommitToCommitItem map headRef thanh nhanh commit thuc te",
    },
    () => {
      const result = mapProjectCommitToCommitItem({ ...commit, headRef: "feature/saga-66" });

      expect(result.branchName).toBe("feature/saga-66");
      expect(result.additions).toBeNull();
      expect(result.deletions).toBeNull();
      expect(result.filesChanged).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "13/09/2026",
      description: "mapProjectCommitToCommitItem hien thi nhanh khong xac dinh khi backend khong gui headRef",
    },
    () => {
      const result = mapProjectCommitToCommitItem(commit);

      expect(result.branchName).toBe("Không xác định");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "13/09/2026",
      description: "extractReposAndBranches gom dung commit cua tung nhanh trong mot repository",
    },
    () => {
      const result = extractReposAndBranches([
        { ...commit, headRef: "main" },
        { ...commit, id: "commit-2", headRef: "feature/saga-66" },
        { ...commit, id: "commit-3", headRef: "feature/saga-66" },
      ]);

      expect(result.branches["saga-fe"]).toEqual([
        expect.objectContaining({ name: "main", commitCount: 1, isDefault: true }),
        expect.objectContaining({ name: "feature/saga-66", commitCount: 2, isDefault: false }),
      ]);
      expect(result.repositories[0]).toMatchObject({
        activeBranchesCount: 2,
        defaultBranch: "main",
      });
    }
  );
});
