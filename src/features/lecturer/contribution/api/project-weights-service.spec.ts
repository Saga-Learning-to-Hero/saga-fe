import { describe, expect, vi, beforeEach } from "vitest";
import { ProjectWeightsService } from "./project-weights-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("ProjectWeightsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = "11111111-1111-1111-1111-111111111111";
  const mockTeamId = "43098af7-0f8c-4597-beb7-e09e70a5c7ad";
  const groupWeights = {
    projectId: mockProjectId,
    teamId: mockTeamId,
    codeWeight: 30,
    testWeight: 30,
    documentWeight: 20,
    researchWeight: 20,
    note: "Thỏa thuận nhóm",
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "09/09/2026",
      description: "GET /api/projects/{projectId}/group-weights tra bo trong so du an nhom",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: groupWeights });

      const res = await ProjectWeightsService.getGroupWeights(mockProjectId);

      expect(getSpy).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/group-weights`);
      expect(res.teamId).toBe(mockTeamId);
      expect(res.note).toBe("Thỏa thuận nhóm");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "09/09/2026",
      description: "PUT group-weights gui bon trong so kem teamId va note",
    },
    async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce({ data: groupWeights });
      const payload = {
        teamId: mockTeamId,
        codeWeight: 30,
        testWeight: 30,
        documentWeight: 20,
        researchWeight: 20,
        note: "Thỏa thuận nhóm",
      };

      const res = await ProjectWeightsService.updateGroupWeights(mockProjectId, payload);

      expect(putSpy).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/group-weights`, payload);
      expect(res.codeWeight).toBe(30);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 401 INVALID_CREDENTIALS khi doc group-weights",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(ProjectWeightsService.getGroupWeights(mockProjectId)).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 403 khi giang vien khong duoc PUT group-weights",
    },
    async () => {
      vi.spyOn(apiClient, "put").mockRejectedValueOnce(
        apiError("Chỉ trưởng nhóm được cập nhật trọng số dự án", "NOT_TEAM_LEADER", 403)
      );

      await expect(
        ProjectWeightsService.updateGroupWeights(mockProjectId, {
          codeWeight: 25,
          testWeight: 25,
          documentWeight: 25,
          researchWeight: 25,
        })
      ).rejects.toMatchObject({
        code: "NOT_TEAM_LEADER",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 404 PROJECT_NOT_FOUND khi doc group-weights",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Dự án không tồn tại", "PROJECT_NOT_FOUND", 404)
      );

      await expect(ProjectWeightsService.getGroupWeights(mockProjectId)).rejects.toMatchObject({
        code: "PROJECT_NOT_FOUND",
        status: 404,
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi mang khi GET group-weights",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Network Error"));

      await expect(ProjectWeightsService.getGroupWeights(mockProjectId)).rejects.toThrow(
        "Network Error"
      );
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi projectId rong",
    },
    async () => {
      await expect(ProjectWeightsService.getGroupWeights("")).rejects.toThrow(
        "Throw ValidationException: Project ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "09/09/2026",
      description: "PUT chi bon trong so bat buoc khi khong co teamId va note",
    },
    async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce({
        data: { ...groupWeights, note: "" },
      });
      const payload = {
        codeWeight: 25,
        testWeight: 25,
        documentWeight: 25,
        researchWeight: 25,
      };

      await ProjectWeightsService.updateGroupWeights(mockProjectId, payload);

      expect(putSpy).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/group-weights`, payload);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi projectId chi toan khoang trang",
    },
    async () => {
      await expect(
        ProjectWeightsService.updateGroupWeights("   ", {
          codeWeight: 25,
          testWeight: 25,
          documentWeight: 25,
          researchWeight: 25,
        })
      ).rejects.toThrow("Throw ValidationException: Project ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "09/09/2026",
      description: "Response thieu note van chuan hoa thanh chuoi rong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          projectId: mockProjectId,
          teamId: mockTeamId,
          codeWeight: 0,
          testWeight: 0,
          documentWeight: 0,
          researchWeight: 0,
        },
      });

      const res = await ProjectWeightsService.getGroupWeights(mockProjectId);

      expect(res.note).toBe("");
      expect(res.codeWeight).toBe(0);
    }
  );
});
