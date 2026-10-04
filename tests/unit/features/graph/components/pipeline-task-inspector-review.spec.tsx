import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { matrixReview } from "@/features/graph/components/pipeline-task-inspector";
import { mapPipelineCommits } from "@/features/graph/lib/pipeline-mapper";
import type { CommitAiReviewSummary } from "@/features/ai/types/ai-commit-review";
import type { TaskLinkedCommitItem } from "@/features/student/project/types/student-project";

const review = (status: string) => ({ status, label: status, reasons: [], taskLinked: true }) as unknown as CommitAiReviewSummary;

describe("AI review in the reconciliation matrix", () => {
  fptTest(
    { id: "UTCID01", type: "N", executedDate: "05/10/2026", description: "Ma tran chi hien Dat va Canh bao" },
    () => {
      expect(matrixReview(review("PASS"))?.status).toBe("PASS");
      expect(matrixReview(review("WARNING"))?.status).toBe("WARNING");
    }
  );

  fptTest(
    { id: "UTCID02", type: "A", executedDate: "05/10/2026", description: "Loi, dang danh gia, chua danh gia, merge, chua co key thi khong hien" },
    () => {
      for (const status of ["FAILED", "PENDING", "NOT_REVIEWED", "SKIPPED_MERGE", "NO_KEY", "INSUFFICIENT_DATA"]) {
        expect(matrixReview(review(status))).toBeNull();
      }
      expect(matrixReview(null)).toBeNull();
      expect(matrixReview(undefined)).toBeNull();
    }
  );

  fptTest(
    { id: "UTCID03", type: "N", executedDate: "05/10/2026", description: "Commit cua task mang theo danh gia AI" },
    () => {
      const [commit] = mapPipelineCommits(
        [{ id: "c1", sha: "abcdef1234", message: "feat: SAGA-1 x", committedAt: "2026-10-05T00:00:00Z", repositoryFullName: "org/repo", aiReview: review("WARNING") } as unknown as TaskLinkedCommitItem],
        []
      );
      expect(commit.aiReview?.status).toBe("WARNING");
    }
  );
});
