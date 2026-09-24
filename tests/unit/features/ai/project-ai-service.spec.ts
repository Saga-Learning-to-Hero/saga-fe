import { describe, expect, vi, beforeEach } from "vitest";
import { ProjectAiService } from "@/features/ai/api/project-ai-api";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("ProjectAiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = "p1111111-1111-1111-1111-111111111111";
  const mockTaskId = "t2222222-2222-2222-2222-222222222222";
  const mockCommitId = "c3333333-3333-3333-3333-333333333333";
  const mockStudentId = "s4444444-4444-4444-4444-444444444444";
  const mockAnalysisId = "a5555555-5555-5555-5555-555555555555";

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "24/09/2026",
      description: "submitCommitAnalysis kich hoat cham diem commit",
    },
    async () => {
      const mockRun = { id: mockAnalysisId, status: "RUNNING" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRun });

      const result = await ProjectAiService.submitCommitAnalysis(mockProjectId, mockCommitId);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/commits/${mockCommitId}/analyses`
      );
      expect(result).toEqual(mockRun);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "24/09/2026",
      description: "getCommitAnalysesHistory tra ve lich su phan tich commit",
    },
    async () => {
      const mockHistory = { content: [{ id: mockAnalysisId }], totalElements: 1, totalPages: 1 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHistory });

      const result = await ProjectAiService.getCommitAnalysesHistory(mockProjectId, mockCommitId, 0, 10);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/commits/${mockCommitId}/analyses`,
        { params: { page: 0, size: 10 } }
      );
      expect(result).toEqual(mockHistory);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "24/09/2026",
      description: "submitTaskIntelligence gui yeu cau danh gia task thanh cong",
    },
    async () => {
      const mockRun = { id: mockAnalysisId, status: "ACCEPTED" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRun });

      const result = await ProjectAiService.submitTaskIntelligence(mockProjectId, mockTaskId);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/tasks/${mockTaskId}/intelligence-analyses`
      );
      expect(result).toEqual(mockRun);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "24/09/2026",
      description: "getLatestTaskIntelligence lay ket qua danh gia task moi nhat",
    },
    async () => {
      const mockLatest = { status: "FOUND", analysis: { id: mockAnalysisId } };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockLatest });

      const result = await ProjectAiService.getLatestTaskIntelligence(mockProjectId, mockTaskId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/tasks/${mockTaskId}/intelligence-analyses/latest`
      );
      expect(result).toEqual(mockLatest);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "24/09/2026",
      description: "submitTeamRisk va getLatestTeamRisk xu ly dung endpoint",
    },
    async () => {
      const mockRun = { id: mockAnalysisId, status: "ACCEPTED" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRun });

      const submitResult = await ProjectAiService.submitTeamRisk(mockProjectId);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/team/risk-analyses`
      );
      expect(submitResult).toEqual(mockRun);

      const mockLatest = { status: "FOUND", analysis: mockRun };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockLatest });

      const latestResult = await ProjectAiService.getLatestTeamRisk(mockProjectId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/team/risk-analyses/latest`
      );
      expect(latestResult).toEqual(mockLatest);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "24/09/2026",
      description: "submitTeamProgress va exportProjectProgressDocx",
    },
    async () => {
      const mockRun = { id: mockAnalysisId, status: "ACCEPTED" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRun });

      const submitResult = await ProjectAiService.submitTeamProgress(mockProjectId);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/team/progress-analyses`
      );
      expect(submitResult).toEqual(mockRun);

      const mockBlob = new Blob(["mock-docx"]);
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBlob });

      const blobResult = await ProjectAiService.exportProjectProgressDocx(mockProjectId, mockAnalysisId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/analyses/${mockAnalysisId}/export.docx`,
        { responseType: "blob" }
      );
      expect(blobResult).toEqual(mockBlob);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "24/09/2026",
      description: "Throw error khi Backend tra ve 500 Internal Server Error",
    },
    async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("500 Internal Server Error"));

      await expect(ProjectAiService.submitTeamProgress(mockProjectId)).rejects.toThrow("500");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "24/09/2026",
      description: "getAdjudication tra ve dung ket qua hoi chan mo hinh",
    },
    async () => {
      const mockAdj = {
        outcome: "AGREED",
        disagreementDetailsJson: null,
        humanReviewRequired: false,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockAdj });

      const result = await ProjectAiService.getAdjudication(mockProjectId, mockAnalysisId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/analyses/${mockAnalysisId}/adjudication`
      );
      expect(result).toEqual(mockAdj);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "24/09/2026",
      description: "submitStudentRisk va getLatestStudentProgress xu ly dung endpoint cho sinh vien",
    },
    async () => {
      const mockRun = { id: mockAnalysisId, status: "ACCEPTED" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRun });

      const submitResult = await ProjectAiService.submitStudentRisk(mockProjectId, mockStudentId);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/students/${mockStudentId}/risk-analyses`
      );
      expect(submitResult).toEqual(mockRun);

      const mockLatest = { status: "FOUND", analysis: mockRun };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockLatest });

      const progressResult = await ProjectAiService.getLatestStudentProgress(mockProjectId, mockStudentId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/students/${mockStudentId}/progress-analyses/latest`
      );
      expect(progressResult).toEqual(mockLatest);
    }
  );
});
