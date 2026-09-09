import { describe, expect, vi, beforeEach } from "vitest";
import { LecturerWeightsService } from "./lecturer-weights-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("LecturerWeightsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourseId = "2bf1c497-71d4-43f2-a683-b74b7ad74327";
  const sliceWeights = {
    mode: "COURSE",
    codeWeight: 40,
    testWeight: 20,
    documentWeight: 20,
    researchWeight: 20,
  };
  const payload = {
    codeWeight: 40,
    testWeight: 20,
    documentWeight: 20,
    researchWeight: 20,
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "09/09/2026",
      description: "GET contribution-slice-weights tra mode va bon trong so cap lop",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: sliceWeights });

      const res = await LecturerWeightsService.getSliceWeights(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/contribution-slice-weights`
      );
      expect(res.mode).toBe("COURSE");
      expect(res.codeWeight).toBe(40);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "09/09/2026",
      description: "PUT contribution-slice-weights chi gui bon trong so, khong gui mode",
    },
    async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce({ data: sliceWeights });

      const res = await LecturerWeightsService.updateSliceWeights(mockCourseId, payload);

      expect(putSpy).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/contribution-slice-weights`,
        payload
      );
      expect(putSpy.mock.calls[0]?.[1]).not.toHaveProperty("mode");
      expect(res.mode).toBe("COURSE");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "09/09/2026",
      description: "PUT contribution-config-mode chuyen sang PROJECT_GROUP thanh cong",
    },
    async () => {
      const putSpy = vi.spyOn(apiClient, "put").mockResolvedValueOnce({
        data: { ...sliceWeights, mode: "PROJECT_GROUP" },
      });

      const res = await LecturerWeightsService.updateConfigMode(mockCourseId, {
        mode: "PROJECT_GROUP",
      });

      expect(putSpy).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/contribution-config-mode`,
        { mode: "PROJECT_GROUP" }
      );
      expect(res.mode).toBe("PROJECT_GROUP");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "09/09/2026",
      description: "GET contribution-team-weights tra danh sach teamId, projectId, configured",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          courseId: mockCourseId,
          mode: "PROJECT_GROUP",
          teams: [
            {
              teamId: "43098af7-0f8c-4597-beb7-e09e70a5c7ad",
              projectId: "11111111-1111-1111-1111-111111111111",
              teamName: "SAGA Team",
              teamNo: 1,
              configured: true,
            },
          ],
        },
      });

      const res = await LecturerWeightsService.getTeamWeights(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(
        `/api/lecturer/courses/${mockCourseId}/contribution-team-weights`
      );
      expect(res.teams[0].teamId).toBe("43098af7-0f8c-4597-beb7-e09e70a5c7ad");
      expect(res.teams[0].configured).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 401 INVALID_CREDENTIALS khi doc trong so lop",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(LecturerWeightsService.getSliceWeights(mockCourseId)).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 403 LECTURER_COURSE_FORBIDDEN khi doi mode",
    },
    async () => {
      vi.spyOn(apiClient, "put").mockRejectedValueOnce(
        apiError("Không có quyền truy cập lớp", "LECTURER_COURSE_FORBIDDEN", 403)
      );

      await expect(
        LecturerWeightsService.updateConfigMode(mockCourseId, { mode: "COURSE" })
      ).rejects.toMatchObject({
        code: "LECTURER_COURSE_FORBIDDEN",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi 404 COURSE_NOT_FOUND khi doc team weights",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lớp không tồn tại", "COURSE_NOT_FOUND", 404)
      );

      await expect(LecturerWeightsService.getTeamWeights(mockCourseId)).rejects.toMatchObject({
        code: "COURSE_NOT_FOUND",
        status: 404,
      });
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "09/09/2026",
      description: "Khong nuot loi mang khi PUT trong so lop",
    },
    async () => {
      vi.spyOn(apiClient, "put").mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        LecturerWeightsService.updateSliceWeights(mockCourseId, payload)
      ).rejects.toThrow("Network Error");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi courseId rong luc lay trong so",
    },
    async () => {
      await expect(LecturerWeightsService.getSliceWeights("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "09/09/2026",
      description: "Danh sach nhom rong teams=[] van hop le khi chua phan nhom",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { courseId: mockCourseId, mode: "COURSE", teams: [] },
      });

      const res = await LecturerWeightsService.getTeamWeights(mockCourseId);

      expect(res.teams).toEqual([]);
      expect(res.mode).toBe("COURSE");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "09/09/2026",
      description: "Throw ValidationException khi courseId chi toan khoang trang",
    },
    async () => {
      await expect(LecturerWeightsService.updateConfigMode("   ", { mode: "COURSE" })).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "09/09/2026",
      description: "Nhom chua co projectId duoc chuan hoa thanh null, khong dung mock ID",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          courseId: mockCourseId,
          mode: "PROJECT_GROUP",
          teams: [
            {
              teamId: "43098af7-0f8c-4597-beb7-e09e70a5c7ad",
              projectId: "",
              teamName: "Team 2",
              teamNo: 2,
              configured: false,
            },
          ],
        },
      });

      const res = await LecturerWeightsService.getTeamWeights(mockCourseId);

      expect(res.teams[0].projectId).toBeNull();
      expect(res.teams[0].configured).toBe(false);
    }
  );
});
