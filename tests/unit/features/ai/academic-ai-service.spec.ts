import { describe, expect, vi, beforeEach } from "vitest";
import { AcademicAiService } from "@/features/ai/api/academic-ai-api";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("AcademicAiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = "p1111111-1111-1111-1111-111111111111";
  const mockTaskId = "t2222222-2222-2222-2222-222222222222";
  const mockCommitId = "c3333333-3333-3333-3333-333333333333";
  const mockClassificationId = "cl444444-4444-4444-4444-444444444444";

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "24/09/2026",
      description: "submitTaskAcademic gui yeu cau phan loai task thanh cong",
    },
    async () => {
      const mockRun = { id: "run-uuid", status: "ACCEPTED" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRun });

      const result = await AcademicAiService.submitTaskAcademic(mockProjectId, mockTaskId);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/tasks/${mockTaskId}/academic-analyses`
      );
      expect(result).toEqual(mockRun);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "24/09/2026",
      description: "getTaskAcademicClassifications tra ve danh sach de xuat",
    },
    async () => {
      const mockList = [
        {
          id: mockClassificationId,
          targetName: "Sprint 1 Architecture",
          targetType: "PHASE",
          confidence: 0.95,
          status: "PROPOSED",
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockList });

      const result = await AcademicAiService.getTaskAcademicClassifications(mockProjectId, mockTaskId);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/tasks/${mockTaskId}/academic-classifications`
      );
      expect(result).toEqual(mockList);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "24/09/2026",
      description: "reviewAcademicClassification gui yeu cau CONFIRM thanh cong",
    },
    async () => {
      const payload = { action: "CONFIRM" as const, reason: "Dong y voi de xuat" };
      const mockUpdated = { id: mockClassificationId, status: "CONFIRMED" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockUpdated });

      const result = await AcademicAiService.reviewAcademicClassification(
        mockProjectId,
        mockClassificationId,
        payload
      );
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/academic-classifications/${mockClassificationId}/review`,
        payload
      );
      expect(result).toEqual(mockUpdated);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "24/09/2026",
      description: "reviewAcademicClassification gui yeu cau CORRECT voi target moi",
    },
    async () => {
      const payload = {
        action: "CORRECT" as const,
        reason: "Chuyen sang Deliverable",
        correctedTargetType: "EXPECTED_DELIVERABLE" as const,
        correctedTargetId: "d5555555-5555-5555-5555-555555555555",
      };
      const mockUpdated = { id: mockClassificationId, status: "CORRECTED" };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockUpdated });

      const result = await AcademicAiService.reviewAcademicClassification(
        mockProjectId,
        mockClassificationId,
        payload
      );
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/ai/academic-classifications/${mockClassificationId}/review`,
        payload
      );
      expect(result).toEqual(mockUpdated);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "24/09/2026",
      description: "Throw error khi review bi conflict hoac khong tim thay proposal",
    },
    async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("409 Conflict"));

      await expect(
        AcademicAiService.reviewAcademicClassification(mockProjectId, mockClassificationId, {
          action: "CONFIRM",
        })
      ).rejects.toThrow("409");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "24/09/2026",
      description: "Xu ly dung khi danh sach phan loai rong",
    },
    async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await AcademicAiService.getCommitAcademicClassifications(mockProjectId, mockCommitId);
      expect(result).toEqual([]);
    }
  );
});
