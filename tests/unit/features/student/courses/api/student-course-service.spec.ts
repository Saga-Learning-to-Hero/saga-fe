import { describe, expect, vi, beforeEach } from "vitest";
import { StudentCourseService } from "@/features/student/courses/api/student-course-service";
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
      { studentCode: "SE111111", fullName: "Alpha Leader", role: "LEADER", avatarUrl: "https://cdn.example.com/alpha.png" },
      { studentCode: "SE222222", fullName: "Beta Member", role: "MEMBER", avatarUrl: null },
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
      expect(res.members[0].avatarUrl).toBe("https://cdn.example.com/alpha.png");
      expect(res.members[1].avatarUrl).toBeNull();
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

  const mockPaged = {
    items: [mockCourse],
    page: 0,
    size: 9,
    total: 1,
  };

  fptTest(
    {
      id: "UTCID10",
      type: "N",
      executedDate: "01/10/2026",
      description: "GET /api/student/courses/paged gui dung page, size, semesterId, search",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPaged });

      const res = await StudentCourseService.getCoursesPaged({
        page: 0,
        size: 9,
        semesterId: "b1c6e936-18cd-4b2b-a455-0d78f536dffe",
        search: "SWP",
      });

      expect(getSpy).toHaveBeenCalledWith("/api/student/courses/paged", {
        params: {
          page: 0,
          size: 9,
          semesterId: "b1c6e936-18cd-4b2b-a455-0d78f536dffe",
          search: "SWP",
        },
      });
      expect(res.items).toHaveLength(1);
      expect(res.page).toBe(0);
      expect(res.size).toBe(9);
      expect(res.total).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "01/10/2026",
      description: "GET paged chi gui page va size khi khong co semesterId/search",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPaged });

      await StudentCourseService.getCoursesPaged({ page: 2, size: 18 });

      expect(getSpy).toHaveBeenCalledWith("/api/student/courses/paged", {
        params: { page: 2, size: 18 },
      });
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "N",
      executedDate: "01/10/2026",
      description: "Item paged giu dung shape API cu, ke ca teamId/projectId null",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPaged });

      const res = await StudentCourseService.getCoursesPaged({ page: 1, size: 9 });

      expect(res.items[0].courseId).toBe(mockCourseId);
      expect(res.items[0].courseCode).toBe(mockCourse.courseCode);
      expect(res.items[0].teamId).toBe(mockCourse.teamId);
      expect(res.items[0].projectId).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "01/10/2026",
      description: "GET paged nhan dung page/size/total do server tra ve",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { items: [mockCourse], page: 3, size: 9, total: 21 },
      });

      const res = await StudentCourseService.getCoursesPaged({ page: 3, size: 9 });

      expect(res.page).toBe(3);
      expect(res.size).toBe(9);
      expect(res.total).toBe(21);
      expect(res.items).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "A",
      executedDate: "01/10/2026",
      description: "items null duoc chuan hoa thanh mang rong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { items: null, page: 1, size: 9, total: 4 },
      });

      const res = await StudentCourseService.getCoursesPaged({ page: 1, size: 9 });

      expect(res.items).toEqual([]);
      expect(res.total).toBe(4);
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "A",
      executedDate: "01/10/2026",
      description: "items khong phai mang duoc chuan hoa thanh mang rong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { items: { courseId: mockCourseId }, page: 1, size: 9, total: 1 },
      });

      const res = await StudentCourseService.getCoursesPaged({ page: 1, size: 9 });

      expect(res.items).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "A",
      executedDate: "01/10/2026",
      description: "total sai kieu duoc chuan hoa ve 0",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { items: [mockCourse], page: 1, size: 9, total: "10" },
      });

      const res = await StudentCourseService.getCoursesPaged({ page: 1, size: 9 });

      expect(res.total).toBe(0);
      expect(res.items).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "A",
      executedDate: "01/10/2026",
      description: "Khong nuot loi 400 khi GET paged",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Tham so phan trang khong hop le", "REQUEST_INVALID", 400)
      );

      await expect(
        StudentCourseService.getCoursesPaged({ page: 0, size: 9 })
      ).rejects.toMatchObject({
        code: "REQUEST_INVALID",
        status: 400,
      });
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "A",
      executedDate: "01/10/2026",
      description: "Khong nuot loi 401 INVALID_CREDENTIALS khi GET paged",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(
        StudentCourseService.getCoursesPaged({ page: 1, size: 9 })
      ).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "A",
      executedDate: "01/10/2026",
      description: "Khong nuot loi 403 STUDENT_COURSE_FORBIDDEN khi GET paged",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Không thuộc lớp này", "STUDENT_COURSE_FORBIDDEN", 403)
      );

      await expect(
        StudentCourseService.getCoursesPaged({ page: 1, size: 9 })
      ).rejects.toMatchObject({
        code: "STUDENT_COURSE_FORBIDDEN",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "A",
      executedDate: "01/10/2026",
      description: "Khong nuot loi 500 khi GET paged",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lỗi máy chủ", "INTERNAL_ERROR", 500)
      );

      await expect(
        StudentCourseService.getCoursesPaged({ page: 1, size: 9 })
      ).rejects.toMatchObject({
        code: "INTERNAL_ERROR",
        status: 500,
      });
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "A",
      executedDate: "01/10/2026",
      description: "Khong nuot loi mang khi GET paged",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        StudentCourseService.getCoursesPaged({ page: 1, size: 9 })
      ).rejects.toThrow("Network Error");
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "B",
      executedDate: "01/10/2026",
      description: "page bang 0 la trang dau, khong bi doi thanh 1",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPaged });

      await StudentCourseService.getCoursesPaged({ page: 0, size: 9 });

      expect(getSpy).toHaveBeenCalledWith("/api/student/courses/paged", {
        params: { page: 0, size: 9 },
      });
    }
  );

  fptTest(
    {
      id: "UTCID23",
      type: "B",
      executedDate: "01/10/2026",
      description: "size am/0 thanh 50, size >200 bi kep 200",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get")
        .mockResolvedValueOnce({ data: mockPaged })
        .mockResolvedValueOnce({ data: mockPaged });

      await StudentCourseService.getCoursesPaged({ page: 0, size: -5 });
      await StudentCourseService.getCoursesPaged({ page: 0, size: 201 });

      expect(getSpy).toHaveBeenNthCalledWith(1, "/api/student/courses/paged", {
        params: { page: 0, size: 50 },
      });
      expect(getSpy).toHaveBeenNthCalledWith(2, "/api/student/courses/paged", {
        params: { page: 0, size: 200 },
      });
    }
  );

  fptTest(
    {
      id: "UTCID24",
      type: "B",
      executedDate: "01/10/2026",
      description: "search chi gom khoang trang bi bo khoi query",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPaged });

      await StudentCourseService.getCoursesPaged({ page: 1, size: 9, search: "   " });

      expect(getSpy).toHaveBeenCalledWith("/api/student/courses/paged", {
        params: { page: 1, size: 9 },
      });
    }
  );

  fptTest(
    {
      id: "UTCID25",
      type: "B",
      executedDate: "01/10/2026",
      description: "semesterId rong bi bo khoi query",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPaged });

      await StudentCourseService.getCoursesPaged({ page: 1, size: 9, semesterId: "  " });

      expect(getSpy).toHaveBeenCalledWith("/api/student/courses/paged", {
        params: { page: 1, size: 9 },
      });
    }
  );

  fptTest(
    {
      id: "UTCID26",
      type: "B",
      executedDate: "01/10/2026",
      description: "total bang 0 va items rong la hop le",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { items: [], page: 1, size: 9, total: 0 },
      });

      const res = await StudentCourseService.getCoursesPaged({ page: 1, size: 9 });

      expect(res.items).toEqual([]);
      expect(res.total).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID27",
      type: "B",
      executedDate: "01/10/2026",
      description: "Trang cuoi 0-based: page=2 size=9 total=21 giu nguyen shape",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { items: [mockCourse], page: 2, size: 9, total: 21 },
      });

      const res = await StudentCourseService.getCoursesPaged({ page: 2, size: 9 });

      expect(res.page).toBe(2);
      expect(res.size).toBe(9);
      expect(res.total).toBe(21);
      expect(res.items).toHaveLength(1);
    }
  );
});
