import { describe, expect, vi, beforeEach } from "vitest";
import { TeamContributionService } from "./team-contribution-service";
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
      id: "UTCID02",
      type: "N",
      executedDate: "09/09/2026",
      description: "POST contribution-override dung studentProfileId, khong dung teamMemberId",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          id: "override-1",
          studentProfileId: mockStudentProfileId,
          oldValue: 42,
          newValue: 35,
          reason: "Biên bản thỏa thuận nhóm",
        },
      });

      const payload = {
        studentProfileId: mockStudentProfileId,
        percentage: 35,
        reason: "Biên bản thỏa thuận nhóm",
      };
      const res = await TeamContributionService.overrideContribution(mockTeamId, payload);

      expect(postSpy).toHaveBeenCalledWith(
        `/api/teams/${mockTeamId}/contribution-override`,
        payload
      );
      expect(res.newValue).toBe(35);
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
      id: "UTCID04",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 403 khi giang vien khong duoc override",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("Không có quyền điều chỉnh", "LECTURER_COURSE_FORBIDDEN", 403)
      );

      await expect(
        TeamContributionService.overrideContribution(mockTeamId, {
          studentProfileId: mockStudentProfileId,
          percentage: 30,
          reason: "Lý do",
        })
      ).rejects.toMatchObject({
        code: "LECTURER_COURSE_FORBIDDEN",
        status: 403,
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
      id: "UTCID08",
      type: "A",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi studentProfileId rong luc override",
    },
    async () => {
      await expect(
        TeamContributionService.overrideContribution(mockTeamId, {
          studentProfileId: "",
          percentage: 20,
          reason: "Lý do",
        })
      ).rejects.toThrow("Throw ValidationException: Student profile ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi percentage khong phai so",
    },
    async () => {
      await expect(
        TeamContributionService.overrideContribution(mockTeamId, {
          studentProfileId: mockStudentProfileId,
          percentage: Number.NaN,
          reason: "Lý do",
        })
      ).rejects.toThrow("Throw ValidationException: Percentage is required");
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
      id: "UTCID11",
      type: "B",
      executedDate: "09/09/2026",
      description: "Override percentage = 0 la gia tri bien hop le",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          id: "override-0",
          studentProfileId: mockStudentProfileId,
          oldValue: 42,
          newValue: 0,
          reason: "Không tham gia",
        },
      });

      const res = await TeamContributionService.overrideContribution(mockTeamId, {
        studentProfileId: mockStudentProfileId,
        percentage: 0,
        reason: "Không tham gia",
      });

      expect(postSpy).toHaveBeenCalled();
      expect(res.newValue).toBe(0);
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
