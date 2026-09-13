import { describe, expect, vi, beforeEach } from "vitest";
import { LecturerCourseService } from "./lecturer-course-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("LecturerCourseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourseId = "2bf1c497-71d4-43f2-a683-b74b7ad74327";

  const mockCourse = {
    id: mockCourseId,
    courseCode: "SWP391-SE1705-FA26",
    name: "SWP391 · SE1705",
    subjectId: "94ced810-3c75-4bfb-b188-c48c2f29651b",
    subjectCode: "SWP391",
    subjectName: "Software Development Project",
    academicClassId: "63ae5684-036b-41bb-a205-2ae39f642c1b",
    classCode: "SE1705",
    semesterId: "b1c6e936-18cd-4b2b-a455-0d78f536dffe",
    semesterCode: "FA26",
    semesterName: "Fall 2026",
    syllabusVersionId: "799bceba-46dc-4713-8161-0192d01275d2",
    lecturerId: "lec-profile-uuid-1",
    createdAt: "2026-09-01T00:00:00",
  };

  const mockRoster = {
    courseId: mockCourseId,
    classCode: "SE1705",
    enrolledCount: 2,
    entries: [
      {
        courseEnrollmentId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        studentProfileId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        studentCode: "SE111111",
        fullName: "Alpha Leader",
        email: "alpha@gmail.com",
        classCode: "SE1705",
      },
    ],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "07/09/2026",
      description: "GET danh sach lop giang vien tra dung CourseResponse, id dung lam courseId",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockCourse] });

      const res = await LecturerCourseService.getCourses();

      expect(getSpy).toHaveBeenCalledWith("/api/lecturer/courses");
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe(mockCourseId);
      expect(res[0].courseCode).toBe("SWP391-SE1705-FA26");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "07/09/2026",
      description: "GET chi tiet lop theo courseId thanh cong",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockCourse });

      const res = await LecturerCourseService.getCourseById(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(`/api/lecturer/courses/${mockCourseId}`);
      expect(res.id).toBe(mockCourseId);
      expect(res.subjectName).toBe("Software Development Project");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "07/09/2026",
      description: "GET roster ACTIVE tra dung entries va enrolledCount",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockRoster });

      const res = await LecturerCourseService.getRoster(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(`/api/lecturer/courses/${mockCourseId}/roster`);
      expect(res.enrolledCount).toBe(2);
      expect(res.entries[0].courseEnrollmentId).toBe("dddddddd-dddd-dddd-dddd-dddddddddddd");
      expect(res.entries[0].studentProfileId).toBe("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");
      expect(res.entries[0].studentCode).toBe("SE111111");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 401 INVALID_CREDENTIALS khi lay danh sach lop",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(LecturerCourseService.getCourses()).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 403 LECTURER_COURSE_FORBIDDEN khi doc chi tiet lop",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Không có quyền truy cập lớp", "LECTURER_COURSE_FORBIDDEN", 403)
      );

      await expect(LecturerCourseService.getCourseById(mockCourseId)).rejects.toMatchObject({
        code: "LECTURER_COURSE_FORBIDDEN",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "07/09/2026",
      description: "Khong nuot loi 404 COURSE_NOT_FOUND khi doc roster",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lớp không tồn tại", "COURSE_NOT_FOUND", 404)
      );

      await expect(LecturerCourseService.getRoster(mockCourseId)).rejects.toMatchObject({
        code: "COURSE_NOT_FOUND",
        status: 404,
      });
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi courseId rong luc lay chi tiet lop",
    },
    async () => {
      await expect(LecturerCourseService.getCourseById("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "07/09/2026",
      description: "Danh sach lop rong 200 [] la hop le khi giang vien chua duoc phan cong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [] });

      const res = await LecturerCourseService.getCourses();

      expect(res).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "07/09/2026",
      description: "Roster rong van hop le, enrolledCount = 0",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { courseId: mockCourseId, classCode: "SE1705", enrolledCount: 0, entries: [] },
      });

      const res = await LecturerCourseService.getRoster(mockCourseId);

      expect(res.entries).toEqual([]);
      expect(res.enrolledCount).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "07/09/2026",
      description: "Throw ValidationException khi courseId chi toan khoang trang",
    },
    async () => {
      await expect(LecturerCourseService.getRoster("   ")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "13/09/2026",
      description: "GET course progress tra ve dung tien do cac nhom",
    },
    async () => {
      const mockProgress = {
        courseId: mockCourseId,
        teams: [
          {
            teamId: "team-uuid-1",
            teamNo: 1,
            teamName: "SAGA Team",
            projectId: "proj-uuid-1",
            totalTasks: 15,
            completedTasks: 10,
            taskCompletionPercent: 66.67,
            currentSprintName: "Sprint 1",
            lastActivityAt: "2026-09-13T10:00:00",
          },
        ],
      };
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockProgress });

      const res = await LecturerCourseService.getCourseProgress(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(`/api/lecturer/courses/${mockCourseId}/progress`);
      expect(res.courseId).toBe(mockCourseId);
      expect(res.teams).toHaveLength(1);
      expect(res.teams[0].completedTasks).toBe(10);
      expect(res.teams[0].taskCompletionPercent).toBe(66.67);
      expect(res.teams[0].currentSprintName).toBe("Sprint 1");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "13/09/2026",
      description: "Throw ValidationException khi courseId rong luc lay tien do lop",
    },
    async () => {
      await expect(LecturerCourseService.getCourseProgress("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "13/09/2026",
      description: "Khong nuot loi khi server tra ve HTTP 500 khi doc tien do",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lỗi hệ thống", "INTERNAL_SERVER_ERROR", 500)
      );

      await expect(LecturerCourseService.getCourseProgress(mockCourseId)).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
        status: 500,
      });
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "13/09/2026",
      description: "Xử lý biên an toàn khi backend trả về teams null hoặc mảng rỗng",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { courseId: mockCourseId, teams: null },
      });

      const res = await LecturerCourseService.getCourseProgress(mockCourseId);

      expect(res.courseId).toBe(mockCourseId);
      expect(res.teams).toEqual([]);
    }
  );
});
