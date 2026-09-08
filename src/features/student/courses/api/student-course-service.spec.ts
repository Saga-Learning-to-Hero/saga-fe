import { describe, expect, vi, beforeEach } from "vitest";
import { StudentCourseService } from "./student-course-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("StudentCourseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourseId = "2bf1c497-71d4-43f2-a683-b74b7ad74327";

  const mockCourse = {
    courseId: mockCourseId,
    courseCode: "SWP391-SE1705-FA26",
    subjectCode: "SWP391",
    subjectName: "Software Development Project",
    classCode: "SE1705",
    semesterCode: "FA26",
    semesterName: "Fall 2026",
    enrollmentStatus: "ACTIVE",
    teamId: "43098af7-0f8c-4597-beb7-e09e70a5c7ad",
    teamNo: 1,
    teamName: "SAGA Team",
    projectId: null,
  };

  const mockTeam = {
    teamId: "43098af7-0f8c-4597-beb7-e09e70a5c7ad",
    teamNo: 1,
    teamName: "SAGA Team",
    myRole: "MEMBER",
    projectId: null,
    members: [
      { studentCode: "SE111111", fullName: "Alpha Leader", role: "LEADER" },
      { studentCode: "SE222222", fullName: "Beta Member", role: "MEMBER" },
    ],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "GET danh sach course ACTIVE cua sinh vien, khong gui userId hay filter",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockCourse] });

      const res = await StudentCourseService.getCourses();

      expect(getSpy).toHaveBeenCalledWith("/api/student/courses");
      expect(getSpy.mock.calls[0][1]).toBeUndefined();
      expect(res[0].courseId).toBe(mockCourseId);
      expect(res[0].teamId).toBe(mockCourse.teamId);
      expect(res[0].projectId).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "GET /api/student/courses/{courseId}/team tra dung team, myRole va members",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockTeam });

      const res = await StudentCourseService.getMyTeam(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(`/api/student/courses/${mockCourseId}/team`);
      expect(res.teamId).toBe(mockTeam.teamId);
      expect(res.myRole).toBe("MEMBER");
      expect(res.members).toHaveLength(2);
      expect(res.members[0]).not.toHaveProperty("email");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 401 INVALID_CREDENTIALS khi lay danh sach course",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(StudentCourseService.getCourses()).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 403 STUDENT_COURSE_FORBIDDEN khi xem team",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Không thuộc lớp này", "STUDENT_COURSE_FORBIDDEN", 403)
      );

      await expect(StudentCourseService.getMyTeam(mockCourseId)).rejects.toMatchObject({
        code: "STUDENT_COURSE_FORBIDDEN",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 404 TEAM_NOT_FOUND, service danh dau dung isTeamNotFound",
    },
    async () => {
      const error = apiError("Chưa được phân nhóm", "TEAM_NOT_FOUND", 404);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

      await expect(StudentCourseService.getMyTeam(mockCourseId)).rejects.toMatchObject({
        code: "TEAM_NOT_FOUND",
        status: 404,
      });
      expect(StudentCourseService.isTeamNotFound(error)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi courseId rong luc xem team",
    },
    async () => {
      await expect(StudentCourseService.getMyTeam("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "07/09/2026",
      description: "Danh sach course rong 200 [] la hop le khi khong co enrollment ACTIVE",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [] });

      const res = await StudentCourseService.getCourses();

      expect(res).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi courseId chi toan khoang trang",
    },
    async () => {
      await expect(StudentCourseService.getMyTeam("   ")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "07/09/2026",
      description: "Khong goi endpoint /my-team; chi dung /team theo contract",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockTeam });

      await StudentCourseService.getMyTeam(mockCourseId);

      expect(String(getSpy.mock.calls[0][0])).not.toContain("/my-team");
      expect(String(getSpy.mock.calls[0][0])).toBe(`/api/student/courses/${mockCourseId}/team`);
    }
  );
});
