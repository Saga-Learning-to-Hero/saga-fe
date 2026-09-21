import { describe, expect, vi, beforeEach } from "vitest";
import { TeamContributionService } from "@/features/lecturer/contribution/api/team-contribution-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("TeamContributionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTeamId = "43098af7-0f8c-4597-beb7-e09e70a5c7ad";
  const mockStudentProfileId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";
  const evaluation = {
    teamId: mockTeamId,
    projectId: "11111111-1111-1111-1111-111111111111",
    courseId: "2bf1c497-71d4-43f2-a683-b74b7ad74327",
    configMode: "COURSE",
    sliceWeights: {
      codeWeight: 40,
      testWeight: 20,
      documentWeight: 20,
      researchWeight: 20,
    },
    members: [
      {
        studentProfileId: mockStudentProfileId,
        fullName: "Alpha Leader",
        studentCode: "SE111111",
        roleInTeam: "LEADER",
        sliceScore: 12,
        sliceContributionPercentage: 40,
        finalContributionPercentage: 42,
        peerReviewScore: 4.5,
        codeContributionPercentage: 50,
        testContributionPercentage: 20,
        documentContributionPercentage: 15,
        researchContributionPercentage: 15,
        taskContributionPercentage: 40,
        sprintBreakdowns: [],
        warnings: ["Thiếu minh chứng kiểm thử"],
      },
    ],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "09/09/2026",
      description: "GET contribution-evaluation tra mode, trong so va bang thanh vien tu BE",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: evaluation });

      const res = await TeamContributionService.getEvaluation(mockTeamId);

      expect(getSpy).toHaveBeenCalledWith(`/api/teams/${mockTeamId}/contribution-evaluation`);
      expect(res.configMode).toBe("COURSE");
      expect(res.members[0].studentProfileId).toBe(mockStudentProfileId);
      expect(res.members[0].finalContributionPercentage).toBe(42);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 401 INVALID_CREDENTIALS khi doc danh gia",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(TeamContributionService.getEvaluation(mockTeamId)).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 404 TEAM_NOT_FOUND khi doc danh gia",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Nhóm không tồn tại", "TEAM_NOT_FOUND", 404)
      );

      await expect(TeamContributionService.getEvaluation(mockTeamId)).rejects.toMatchObject({
        code: "TEAM_NOT_FOUND",
        status: 404,
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi mang khi GET contribution-evaluation",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Network Error"));

      await expect(TeamContributionService.getEvaluation(mockTeamId)).rejects.toThrow(
        "Network Error"
      );
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi teamId rong",
    },
    async () => {
      await expect(TeamContributionService.getEvaluation("")).rejects.toThrow(
        "Throw ValidationException: Team ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "09/09/2026",
      description: "Danh sach thanh vien rong van hop le, khong tu tinh ty le o FE",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { ...evaluation, members: [] },
      });

      const res = await TeamContributionService.getEvaluation(mockTeamId);

      expect(res.members).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi teamId chi toan khoang trang",
    },
    async () => {
      await expect(TeamContributionService.getEvaluation("   ")).rejects.toThrow(
        "Throw ValidationException: Team ID is required"
      );
    }
  );
});
