import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { extractReposAndBranches, isMergeCommit, mapProjectCommitToCommitItem } from "@/features/student/commits/lib/commit-mapper";

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
  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "19/09/2026",
      description: "mapProjectCommitToCommitItem nhan dien commit merge khi message bat dau bang Merge pull request du isMerge null",
    },
    () => {
      const result = mapProjectCommitToCommitItem({
        ...commit,
        isMerge: null,
        parentCount: null,
        message: "Merge pull request #39 from Saga-Learning-to-Hero/feat/SAGA-84-lecturer-grade-and-review-ui",
      });

      expect(result.isMerge).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "19/09/2026",
      description: "mapProjectCommitToCommitItem nhan dien commit merge khi message bat dau bang Merge branch du isMerge null",
    },
    () => {
      const result = mapProjectCommitToCommitItem({
        ...commit,
        isMerge: null,
        parentCount: null,
        message: "Merge branch 'dev' of https://github.com/Saga-Learning-to-Hero/saga-fe into feat/SAGA-77",
      });

      expect(result.isMerge).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "19/09/2026",
      description: "mapProjectCommitToCommitItem giu nguyen isMerge false cho commit thong thuong",
    },
    () => {
      const result = mapProjectCommitToCommitItem({
        ...commit,
        isMerge: null,
        parentCount: null,
        message: "feat: [FE][SAGA-86] Tich hop API Burndown Chart",
      });

      expect(result.isMerge).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "30/09/2026",
      description: "Uu tien authorAvatarUrl hon avatar roster",
    },
    () => {
      const result = mapProjectCommitToCommitItem(
        { ...commit, authorAvatarUrl: "https://cdn.example.com/author.png", authorStudentId: "stu-1" },
        [{ id: "stu-1", fullName: "An", avatar: "https://cdn.example.com/roster.png" }]
      );
      expect(result.author.avatar).toBe("https://cdn.example.com/author.png");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "30/09/2026",
      description: "authorAvatarUrl null fallback roster, khong dung URL gia",
    },
    () => {
      const result = mapProjectCommitToCommitItem(
        { ...commit, authorAvatarUrl: null, authorStudentId: "stu-1" },
        [{ id: "stu-1", fullName: "An", avatarUrl: "not-a-url", avatar: "https://cdn.example.com/roster.png" }]
      );
      expect(result.author.avatar).toBe("https://cdn.example.com/roster.png");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "05/10/2026",
      description: "Badge khoa task lay tu nhanh khi message chi co tag ngan nhu SG-06",
    },
    () => {
      const result = mapProjectCommitToCommitItem({
        ...commit,
        message: "feat: [FE][SG-06] refine graph evidence filters",
        headRef: "feat/SAGA-102-Refine-flows-UI/UX-FE",
      });
      expect(result.jiraKey).toBe("SAGA-102");
    }
  );

  fptTest(
    {
      id: "UTCID90",
      type: "N",
      executedDate: "05/10/2026",
      description: "isMergeCommit khop quy tac backend: parentCount quyet dinh, chua biet thi xet message merge cua Git/GitHub",
    },
    () => {
      const base = { isMerge: null, aiReview: null };
      expect(isMergeCommit({ ...base, parentCount: 2, message: "x" })).toBe(true);
      expect(isMergeCommit({ ...base, parentCount: 1, message: "Merge pull request #5 from a/b" })).toBe(false);
      expect(isMergeCommit({ ...base, parentCount: null, message: "Merge pull request #70 from Saga/dev" })).toBe(true);
      expect(isMergeCommit({ ...base, parentCount: null, message: "Merge branch 'main' of https://github.com/x" })).toBe(true);
      expect(isMergeCommit({ ...base, parentCount: null, message: "merge conflicts resolved in Login" })).toBe(false);
      expect(isMergeCommit({ ...base, parentCount: null, message: "fix: merge sort bug" })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID91",
      type: "N",
      executedDate: "05/10/2026",
      description: "Backend bao SKIPPED_MERGE thi luon la merge, khong hien danh gia AI",
    },
    () => {
      expect(
        isMergeCommit({
          isMerge: null,
          parentCount: null,
          message: "Sync with upstream",
          aiReview: { status: "SKIPPED_MERGE", label: "Merge", reasons: [], taskLinked: false },
        })
      ).toBe(true);
    }
  );

  fptTest(
    { id: "UTCID92", type: "N", executedDate: "05/10/2026", description: "Tac gia ngoai nhom hien ten GitHub thay vi ID so va gan nhan ngoai du an" },
    () => {
      const outsider = mapProjectCommitToCommitItem({ ...commit, authorStudentId: null, authorExternalId: "139128461", authorLogin: "trungne08" }, []);
      expect(outsider.author.name).toBe("trungne08");
      expect(outsider.author.username).toBe("trungne08");
      expect(outsider.author.outsideTeam).toBe(true);
      expect(outsider.author.studentCode).toBe("");

      const member = mapProjectCommitToCommitItem(
        { ...commit, authorStudentId: "sp-1", authorExternalId: "139128461", authorLogin: "trungne08" },
        [{ id: "sp-1", studentCode: "SE170001", fullName: "Nguyễn Văn A" }]
      );
      expect(member.author.name).toBe("Nguyễn Văn A");
      expect(member.author.outsideTeam).toBe(false);
    }
  );
});
