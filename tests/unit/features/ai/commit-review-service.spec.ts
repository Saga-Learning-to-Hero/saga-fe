import { describe, expect, vi, beforeEach } from "vitest";
import { CommitReviewService } from "@/features/ai/api/commit-review-api";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("CommitReviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const projectId = "p1111111-1111-1111-1111-111111111111";
  const commitId = "c3333333-3333-3333-3333-333333333333";
  const taskId = "t2222222-2222-2222-2222-222222222222";

  fptTest(
    { id: "UTCID01", type: "N", executedDate: "04/10/2026", description: "getReview doc chi tiet danh gia AI cua commit" },
    async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { status: "PASS" } });
      const result = await CommitReviewService.getReview(projectId, commitId);
      expect(apiClient.get).toHaveBeenCalledWith(`/api/projects/${projectId}/commits/${commitId}/ai-review`);
      expect(result.status).toBe("PASS");
    }
  );

  fptTest(
    { id: "UTCID02", type: "N", executedDate: "04/10/2026", description: "requestReview gui yeu cau danh gia lai" },
    async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { status: "PENDING" } });
      await CommitReviewService.requestReview(projectId, commitId);
      expect(apiClient.post).toHaveBeenCalledWith(`/api/projects/${projectId}/commits/${commitId}/ai-review`, undefined, {
        timeout: 60_000,
      });
    }
  );

  fptTest(
    { id: "UTCID03", type: "N", executedDate: "04/10/2026", description: "backfill dung route rieng, khong nham voi commitId" },
    async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { queued: 3, skipped: 1, failed: 0 } });
      const result = await CommitReviewService.backfill(projectId, 20);
      expect(apiClient.post).toHaveBeenCalledWith(`/api/projects/${projectId}/commits/ai-review/backfill`, undefined, {
        params: { limit: 20 },
      });
      expect(result.queued).toBe(3);
    }
  );

  fptTest(
    { id: "UTCID04", type: "N", executedDate: "04/10/2026", description: "linkTask/unlinkTask gan va go task thu cong" },
    async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });
      await CommitReviewService.linkTask(projectId, commitId, taskId);
      await CommitReviewService.unlinkTask(projectId, commitId, taskId);
      expect(apiClient.post).toHaveBeenCalledWith(`/api/projects/${projectId}/commits/${commitId}/manual-task-links`, { taskId });
      expect(apiClient.delete).toHaveBeenCalledWith(`/api/projects/${projectId}/commits/${commitId}/manual-task-links/${taskId}`);
    }
  );

  fptTest(
    { id: "UTCID05", type: "N", executedDate: "04/10/2026", description: "team key: doc, luu, xoa dung endpoint" },
    async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { configured: false } });
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { configured: true } });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { configured: false } });
      await CommitReviewService.getTeamKey(projectId);
      await CommitReviewService.saveTeamKey(projectId, { provider: "GEMINI", modelId: "gemini-3.6-flash", apiKey: "k" });
      await CommitReviewService.removeTeamKey(projectId);
      expect(apiClient.get).toHaveBeenCalledWith(`/api/projects/${projectId}/ai-team-key`);
      expect(apiClient.put).toHaveBeenCalledWith(`/api/projects/${projectId}/ai-team-key`, {
        provider: "GEMINI",
        modelId: "gemini-3.6-flash",
        apiKey: "k",
      });
      expect(apiClient.delete).toHaveBeenCalledWith(`/api/projects/${projectId}/ai-team-key`);
    }
  );

  fptTest(
    { id: "UTCID06", type: "A", executedDate: "04/10/2026", description: "loi API duoc nem ra cho caller hien thong bao" },
    async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("422"));
      await expect(CommitReviewService.requestReview(projectId, commitId)).rejects.toThrow();
    }
  );

  fptTest(
    { id: "UTCID07", type: "N", executedDate: "04/10/2026", description: "Giang vien doc va chon nhom duoc dung key cua lop" },
    async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { courseKeyConfigured: true, automationEnabled: true, teams: [] } });
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { courseKeyConfigured: true, automationEnabled: true, teams: [] } });
      const courseId = "course-1";
      await CommitReviewService.getTeamAccess(courseId);
      await CommitReviewService.setTeamAccess(courseId, projectId, true);
      expect(apiClient.get).toHaveBeenCalledWith(`/api/lecturer/courses/${courseId}/ai/team-access`);
      expect(apiClient.put).toHaveBeenCalledWith(`/api/lecturer/courses/${courseId}/ai/team-access/${projectId}`, { allowed: true });
    }
  );
});
