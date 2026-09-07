import { describe, expect, vi, beforeEach } from "vitest";
import { LecturerTeamService } from "./lecturer-team-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import { canConfirmTeamImport, type TeamPreviewResponse } from "../types/lecturer-team";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("LecturerTeamService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourseId = "2bf1c497-71d4-43f2-a683-b74b7ad74327";
  const mockToken = "opaque-preview-token-xyz";

  const mockPreview: TeamPreviewResponse = {
    previewToken: mockToken,
    courseId: mockCourseId,
    classCode: "SE1705",
    hasBlockingErrors: false,
    blockingErrors: [],
    summary: {
      totalRows: 2,
      validRows: 2,
      invalidRows: 0,
      readyCreate: 1,
      readyAssign: 1,
      readyReassign: 0,
      alreadyAssigned: 0,
      blockingErrorCount: 0,
    },
    rows: [
      {
        rowNumber: 2,
        courseEnrollmentId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        classCode: "SE1705",
        fullName: "Alpha Leader",
        studentCode: "SE111111",
        email: "alpha@gmail.com",
        teamNo: 1,
        teamName: "SAGA Team",
        teamRole: "Leader",
        action: "READY_CREATE",
        errors: [],
        warnings: [],
      },
    ],
  };

  const mockTeams = {
    courseId: mockCourseId,
    teams: [
      {
        teamId: "43098af7-0f8c-4597-beb7-e09e70a5c7ad",
        teamNo: 1,
        teamName: "SAGA Team",
        projectId: null,
        members: [],
      },
    ],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "GET template Excel team tra ve Blob thanh cong",
    },
    async () => {
      const mockBlob = new Blob(["fake-xlsx"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockBlob });

      const res = await LecturerTeamService.getTemplate(mockCourseId);

      expect(res).toBeInstanceOf(Blob);
      expect(getSpy).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/teams/template`,
        expect.objectContaining({ responseType: "blob" })
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "Preview import gui FormData dung key file va nhan previewToken",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockPreview });
      const fakeFile = new File(["xlsx"], "Team_Assignment.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const res = await LecturerTeamService.previewImport(mockCourseId, fakeFile);

      expect(res.previewToken).toBe(mockToken);
      expect(postSpy).toHaveBeenCalledTimes(1);
      const [url, body] = postSpy.mock.calls[0];
      expect(url).toBe(`/api/lecturer/courses/${mockCourseId}/teams/import/preview`);
      expect(body).toBeInstanceOf(FormData);
      expect((body as FormData).get("file")).toBe(fakeFile);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "07/09/2026",
      description: "Confirm import gui dung JSON { previewToken }",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          courseId: mockCourseId,
          createdTeams: 1,
          updatedTeams: 0,
          assignedMembers: 2,
          reassignedMembers: 0,
          updatedRoles: 0,
          unchanged: 0,
          emailsEnqueued: 2,
          confirmedAt: "2026-09-01T00:00:00",
        },
      });

      const res = await LecturerTeamService.confirmImport(mockCourseId, {
        previewToken: mockToken,
      });

      expect(postSpy).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/teams/import/confirm`,
        { previewToken: mockToken }
      );
      expect(res.createdTeams).toBe(1);
      expect(res.assignedMembers).toBe(2);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "07/09/2026",
      description: "GET danh sach team thanh cong, projectId null van hop le",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockTeams });

      const res = await LecturerTeamService.getTeams(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(`/api/lecturer/courses/${mockCourseId}/teams`);
      expect(res.teams).toHaveLength(1);
      expect(res.teams[0].projectId).toBeNull();
      expect(res.teams[0].teamId).toBe("43098af7-0f8c-4597-beb7-e09e70a5c7ad");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 401 khi tai template",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(LecturerTeamService.getTemplate(mockCourseId)).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 403 LECTURER_COURSE_FORBIDDEN khi preview",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("Không có quyền", "LECTURER_COURSE_FORBIDDEN", 403)
      );
      const fakeFile = new File(["xlsx"], "Team_Assignment.xlsx");

      await expect(LecturerTeamService.previewImport(mockCourseId, fakeFile)).rejects.toMatchObject({
        code: "LECTURER_COURSE_FORBIDDEN",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 404 COURSE_NOT_FOUND khi lay danh sach team",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lớp không tồn tại", "COURSE_NOT_FOUND", 404)
      );

      await expect(LecturerTeamService.getTeams(mockCourseId)).rejects.toMatchObject({
        code: "COURSE_NOT_FOUND",
        status: 404,
      });
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi TEAM_FILE_INVALID khi file Excel khong hop le",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("File Excel không hợp lệ", "TEAM_FILE_INVALID", 400)
      );
      const fakeFile = new File(["bad"], "bad.xlsx");

      await expect(LecturerTeamService.previewImport(mockCourseId, fakeFile)).rejects.toMatchObject({
        code: "TEAM_FILE_INVALID",
        status: 400,
      });
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi TEAM_FILE_TOO_LARGE khi file vuot 2MB",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("File quá lớn", "TEAM_FILE_TOO_LARGE", 400)
      );
      const fakeFile = new File(["huge"], "Team_Assignment.xlsx");

      await expect(LecturerTeamService.previewImport(mockCourseId, fakeFile)).rejects.toMatchObject({
        code: "TEAM_FILE_TOO_LARGE",
        status: 400,
      });
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi TEAM_PREVIEW_EXPIRED khi token het han",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("Token hết hạn", "TEAM_PREVIEW_EXPIRED", 400)
      );

      await expect(
        LecturerTeamService.confirmImport(mockCourseId, { previewToken: mockToken })
      ).rejects.toMatchObject({
        code: "TEAM_PREVIEW_EXPIRED",
        status: 400,
      });
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi TEAM_PREVIEW_MISMATCH khi token sai course/user",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("Token không khớp", "TEAM_PREVIEW_MISMATCH", 403)
      );

      await expect(
        LecturerTeamService.confirmImport(mockCourseId, { previewToken: mockToken })
      ).rejects.toMatchObject({
        code: "TEAM_PREVIEW_MISMATCH",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi TEAM_CONFIRM_BLOCKED khi preview con loi chan",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(
        apiError("Confirm bị chặn", "TEAM_CONFIRM_BLOCKED", 400)
      );

      await expect(
        LecturerTeamService.confirmImport(mockCourseId, { previewToken: mockToken })
      ).rejects.toMatchObject({
        code: "TEAM_CONFIRM_BLOCKED",
        status: 400,
      });
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi confirm thieu previewToken",
    },
    async () => {
      await expect(
        LecturerTeamService.confirmImport(mockCourseId, { previewToken: "" })
      ).rejects.toThrow("Throw ValidationException: Preview token is required");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi preview thieu file",
    },
    async () => {
      await expect(
        LecturerTeamService.previewImport(mockCourseId, null as unknown as File)
      ).rejects.toThrow("Throw ValidationException: Excel file is required");
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "B",
      executedDate: "07/09/2026",
      description: "Danh sach team rong [] van hop le",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { courseId: mockCourseId, teams: [] },
      });

      const res = await LecturerTeamService.getTeams(mockCourseId);

      expect(res.teams).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "B",
      executedDate: "07/09/2026",
      description: "Preview toan bo ALREADY_ASSIGNED van hop le va khong chan confirm",
    },
    async () => {
      const alreadyAssignedPreview: TeamPreviewResponse = {
        ...mockPreview,
        hasBlockingErrors: false,
        summary: {
          ...mockPreview.summary,
          readyCreate: 0,
          readyAssign: 0,
          alreadyAssigned: 2,
        },
        rows: mockPreview.rows.map((row) => ({ ...row, action: "ALREADY_ASSIGNED" })),
      };
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: alreadyAssignedPreview });
      const fakeFile = new File(["xlsx"], "Team_Assignment.xlsx");

      const res = await LecturerTeamService.previewImport(mockCourseId, fakeFile);

      expect(res.summary.alreadyAssigned).toBe(2);
      expect(canConfirmTeamImport(res)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "B",
      executedDate: "07/09/2026",
      description: "Khong cho phep confirm khi hasBlockingErrors = true",
    },
    async () => {
      const blocked: TeamPreviewResponse = {
        ...mockPreview,
        hasBlockingErrors: true,
        summary: { ...mockPreview.summary, blockingErrorCount: 1, invalidRows: 1 },
      };

      expect(canConfirmTeamImport(blocked)).toBe(false);
      expect(canConfirmTeamImport(null)).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi courseId rong truoc khi goi API team",
    },
    async () => {
      await expect(LecturerTeamService.getTeams("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );
});
