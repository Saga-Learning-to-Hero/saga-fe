import { describe, expect, vi, beforeEach } from "vitest";
import { CourseAiService } from "@/features/ai/api/lecturer-ai-api";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("CourseAiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourseId = "c1111111-1111-1111-1111-111111111111";
  const mockAnalysisId = "a2222222-2222-2222-2222-222222222222";

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "24/09/2026",
      description: "getSettings tra ve dung cau hinh AI cua khoa hoc",
    },
    async () => {
      const mockSettings = { automationEnabled: true, allowPlatformFallback: false };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSettings });

      const result = await CourseAiService.getSettings(mockCourseId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai-settings`
      );
      expect(result).toEqual(mockSettings);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "24/09/2026",
      description: "updateSettings gui yeu cau patch va tra ve cau hinh da cap nhat",
    },
    async () => {
      const payload = { automationEnabled: false, allowPlatformFallback: true };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: payload });

      const result = await CourseAiService.updateSettings(mockCourseId, payload);
      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai-settings`,
        payload
      );
      expect(result).toEqual(payload);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "24/09/2026",
      description: "getCredential tra ve thong tin an toan cua API key ma khong lo secret",
    },
    async () => {
      const mockCred = {
        configured: true,
        provider: "openai",
        role: "PRIMARY",
        status: "ACTIVE",
        lastFour: "1234",
        updatedAt: "2026-09-24T10:00:00",
        lastSuccessfulUseAt: "2026-09-24T10:30:00",
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCred });

      const result = await CourseAiService.getCredential(mockCourseId, "PRIMARY");
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai-credentials/PRIMARY`
      );
      expect(result).toEqual(mockCred);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "24/09/2026",
      description: "putCredential cap nhat thanh cong API key cho Giang vien",
    },
    async () => {
      const payload = { provider: "openai", apiKey: "sk-test-key-12345" };
      const mockCred = {
        configured: true,
        provider: "openai",
        role: "PRIMARY",
        status: "ACTIVE",
        lastFour: "2345",
        updatedAt: "2026-09-24T11:00:00",
        lastSuccessfulUseAt: null,
      };
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockCred });

      const result = await CourseAiService.putCredential(mockCourseId, "PRIMARY", payload);
      expect(apiClient.put).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai-credentials/PRIMARY`,
        payload
      );
      expect(result).toEqual(mockCred);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "24/09/2026",
      description: "revokeCredential thu hoi thanh cong khoa API da cau hinh",
    },
    async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null });

      await CourseAiService.revokeCredential(mockCourseId, "PRIMARY");
      expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai-credentials/PRIMARY`
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "24/09/2026",
      description: "submitCourseProgress kich hoat phan tich tien do khoa hoc",
    },
    async () => {
      const mockRun = { id: mockAnalysisId, status: "RUNNING" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRun });

      const result = await CourseAiService.submitCourseProgress(mockCourseId);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai/progress-analyses`
      );
      expect(result).toEqual(mockRun);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "24/09/2026",
      description: "getLatestCourseProgress tra ve ban ghi moi nhat",
    },
    async () => {
      const mockLatest = { status: "FOUND", analysis: { id: mockAnalysisId, status: "COMPLETED" } };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockLatest });

      const result = await CourseAiService.getLatestCourseProgress(mockCourseId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai/progress-analyses/latest`
      );
      expect(result).toEqual(mockLatest);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "24/09/2026",
      description: "exportCourseProgressDocx tra ve blob stream file word",
    },
    async () => {
      const mockBlob = new Blob(["mock-docx-data"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBlob });

      const result = await CourseAiService.exportCourseProgressDocx(mockCourseId, mockAnalysisId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai/analyses/${mockAnalysisId}/export.docx`,
        { responseType: "blob" }
      );
      expect(result).toEqual(mockBlob);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "24/09/2026",
      description: "Throw error khi API getSettings tra ve loi 403 Forbidden",
    },
    async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Request failed with status code 403"));

      await expect(CourseAiService.getSettings(mockCourseId)).rejects.toThrow("403");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "24/09/2026",
      description: "Xu ly dung khi getLatestCourseProgress tra ve status NOT_ANALYZED",
    },
    async () => {
      const mockNotAnalyzed = { status: "NOT_ANALYZED", analysis: null };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNotAnalyzed });

      const result = await CourseAiService.getLatestCourseProgress(mockCourseId);
      expect(result.status).toBe("NOT_ANALYZED");
      expect(result.analysis).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "24/09/2026",
      description: "getCourseAcademicClassifications goi dung endpoint kem params va tra ve danh sach",
    },
    async () => {
      const mockPage = {
        items: [
          {
            classification: {
              id: "cls-1",
              artifactType: "TASK",
              artifactId: "task-1",
              artifactRevision: "rev-1",
              syllabusVersionId: "syl-1",
              targetType: "PHASE",
              targetId: "phase-1",
              targetCode: "P1",
              targetName: "Inception",
              confidence: 0.9,
              aiSummary: "Valid task",
              status: "PROPOSED",
              provenance: "AI",
              sourceClassificationId: null,
              reviewedAt: null,
              createdAt: "2026-09-24T12:00:00",
            },
            authoritative: false,
            projectId: "proj-1",
            projectName: "Alpha Project",
            teamId: "team-1",
            teamName: "Alpha",
            taskExternalKey: "SAGA-1",
            taskTitle: "Login screen",
            commitSha: null,
            commitMessage: null,
          },
        ],
        page: 0,
        size: 20,
        total: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage });

      const params = { artifactType: "TASK" as const, status: "PROPOSED" as const, page: 0, size: 20 };
      const result = await CourseAiService.getCourseAcademicClassifications(mockCourseId, params);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai/academic-classifications`,
        { params }
      );
      expect(result.total).toBe(1);
      expect(result.items[0].taskExternalKey).toBe("SAGA-1");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "24/09/2026",
      description: "getCourseAcademicClassifications tra ve trang rong khi khong co filter params",
    },
    async () => {
      const mockEmpty = { items: [], page: 0, size: 50, total: 0 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockEmpty });

      const result = await CourseAiService.getCourseAcademicClassifications(mockCourseId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/ai/academic-classifications`,
        { params: undefined }
      );
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    }
  );
});

