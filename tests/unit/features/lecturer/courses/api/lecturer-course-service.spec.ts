import { describe, expect, vi, beforeEach } from "vitest";
import { LecturerCourseService } from "@/features/lecturer/courses/api/lecturer-course-service";
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

  const mockDashboard = {
    courseId: mockCourseId,
    courseCode: "SE123",
    subjectCode: "SEP490",
    subjectName: "Capstone Project",
    classCode: "SE1741",
    semesterCode: "SP26",
    scope: "CURRENT_SPRINT",
    generatedAt: "2026-09-21T12:00:00Z",
    riskPolicy: {
      inactivityWarningDays: 3,
      inactivityCriticalDays: 5,
      scheduleLagWarningPercentagePoints: 20,
      scheduleLagCriticalPercentagePoints: 35,
      peerReviewWarningElapsedPercent: 80,
    },
    summary: {
      enrolledStudents: 24,
      unassignedStudents: 2,
      totalTeams: 1,
      healthyTeams: 0,
      warningTeams: 1,
      criticalTeams: 0,
      unknownTeams: 0,
      teamsWithoutProject: 0,
      teamsWithoutActiveSprint: 0,
      teamsWithSyncFailure: 0,
    },
    taskStatusTotals: {
      total: 10,
      todo: 2,
      inProgress: 3,
      inReview: 1,
      done: 3,
      blocked: 1,
      overdue: 1,
      completionPercent: 30,
    },
    teams: [
      {
        teamId: "11111111-1111-1111-1111-111111111111",
        teamNo: 1,
        teamName: "Team Alpha",
        projectId: "22222222-2222-2222-2222-222222222222",
        projectName: "SAGA",
        memberCount: 4,
        currentSprint: {
          sprintId: "33333333-3333-3333-3333-333333333333",
          sprintName: "Sprint 4",
          state: "ACTIVE",
          startDate: "2026-09-10",
          endDate: "2026-09-24",
          elapsedPercent: 50,
        },
        progress: {
          totalTasks: 10,
          todo: 2,
          inProgress: 3,
          inReview: 1,
          done: 3,
          blocked: 1,
          overdue: 1,
          completionPercent: 30,
          scheduleGapPercentagePoints: 20,
        },
        activity: {
          lastActivityAt: "2026-09-20T08:15:00Z",
          inactiveDays: 1,
          totalActivities: 12,
          series: [],
        },
        traceability: {
          completedTasks: 3,
          completedTasksWithCommit: 2,
          completedTasksWithoutCommit: 1,
          linkedCommits: 5,
          unlinkedCommits: 1,
          taskCommitLinkRate: 66.67,
        },
        peerReview: {
          expectedReviews: 12,
          submittedReviews: 8,
          completionRate: 66.67,
          pendingStudentCount: 2,
          pendingStudentProfileIds: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"],
          deadlineAt: "2026-09-24T00:00:00Z",
        },
        sync: {
          jiraStatus: "ACTIVE",
          jiraSyncStatus: "SUCCEEDED",
          jiraLastSuccessfulSyncAt: "2026-09-21T10:00:00Z",
          githubStatus: "ACTIVE",
          githubSyncStatus: "SUCCEEDED",
          githubLastSuccessfulSyncAt: "2026-09-21T10:05:00Z",
        },
        configuration: {
          contributionMode: "COURSE",
          contributionWeightsConfigured: true,
        },
        previousSprintComparison: null,
        risk: {
          level: "WARNING",
          reasons: [
            {
              code: "SCHEDULE_LAG",
              severity: "WARNING",
              actualValue: 20,
              thresholdValue: 20,
              unit: "PERCENTAGE_POINT",
              affectedStudentProfileIds: [],
            },
          ],
        },
        reminder: null,
      },
    ],
  };

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "22/09/2026",
      description: "GET dashboard lop khong gui scope, tra dung summary va risk backend",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockDashboard });

      const res = await LecturerCourseService.getCourseDashboard(mockCourseId);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`/api/lecturer/courses/${mockCourseId}/dashboard`);
      expect(getSpy.mock.calls[0][1]).toBeUndefined();
      expect(res.summary.warningTeams).toBe(1);
      expect(res.teams[0].risk.level).toBe("WARNING");
      expect(res.teams[0].risk.reasons[0].code).toBe("SCHEDULE_LAG");
      expect(res.teams[0].reminder).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "N",
      executedDate: "22/09/2026",
      description: "GET dashboard giu percent va studentProfileId pending peer dung contract",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockDashboard });

      const res = await LecturerCourseService.getCourseDashboard(mockCourseId);

      expect(res.taskStatusTotals.completionPercent).toBe(30);
      expect(res.teams[0].peerReview?.pendingStudentProfileIds[0]).toBe(
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      );
      expect(res.teams[0].sync?.jiraStatus).toBe("ACTIVE");
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "A",
      executedDate: "22/09/2026",
      description: "Throw ValidationException khi courseId rong luc lay dashboard",
    },
    async () => {
      await expect(LecturerCourseService.getCourseDashboard("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "A",
      executedDate: "22/09/2026",
      description: "Khong nuot loi 403 LECTURER_COURSE_FORBIDDEN khi doc dashboard",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Không có quyền truy cập lớp", "LECTURER_COURSE_FORBIDDEN", 403)
      );

      await expect(LecturerCourseService.getCourseDashboard(mockCourseId)).rejects.toMatchObject({
        code: "LECTURER_COURSE_FORBIDDEN",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "A",
      executedDate: "22/09/2026",
      description: "Khong nuot loi 404 COURSE_NOT_FOUND khi doc dashboard",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lớp không tồn tại", "COURSE_NOT_FOUND", 404)
      );

      await expect(LecturerCourseService.getCourseDashboard(mockCourseId)).rejects.toMatchObject({
        code: "COURSE_NOT_FOUND",
        status: 404,
      });
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "A",
      executedDate: "22/09/2026",
      description: "Khong nuot loi 401 khi het phien luc doc dashboard",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phiên đăng nhập đã hết hạn", "INVALID_CREDENTIALS", 401)
      );

      await expect(LecturerCourseService.getCourseDashboard(mockCourseId)).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "A",
      executedDate: "22/09/2026",
      description: "Khong nuot loi 400 INVALID_DASHBOARD_SCOPE neu backend tra ve",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Phạm vi dashboard không hợp lệ", "INVALID_DASHBOARD_SCOPE", 400)
      );

      await expect(LecturerCourseService.getCourseDashboard(mockCourseId)).rejects.toMatchObject({
        code: "INVALID_DASHBOARD_SCOPE",
        status: 400,
      });
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "A",
      executedDate: "22/09/2026",
      description: "Khong nuot loi HTTP 500 khi doc dashboard",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lỗi hệ thống", "INTERNAL_SERVER_ERROR", 500)
      );

      await expect(LecturerCourseService.getCourseDashboard(mockCourseId)).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
        status: 500,
      });
    }
  );

  fptTest(
    {
      id: "UTCID23",
      type: "B",
      executedDate: "22/09/2026",
      description: "Dashboard 200 voi teams rong van hop le, khong chuyen thanh loi",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { ...mockDashboard, summary: { ...mockDashboard.summary, totalTeams: 0 }, teams: [] },
      });

      const res = await LecturerCourseService.getCourseDashboard(mockCourseId);

      expect(res.teams).toEqual([]);
      expect(res.summary.totalTeams).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID24",
      type: "B",
      executedDate: "22/09/2026",
      description: "Dashboard teams null duoc chuan hoa thanh mang rong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { ...mockDashboard, teams: null },
      });

      const res = await LecturerCourseService.getCourseDashboard(mockCourseId);

      expect(res.courseId).toBe(mockCourseId);
      expect(res.teams).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID25",
      type: "B",
      executedDate: "22/09/2026",
      description: "completionPercent null khong bi doi thanh 0",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          ...mockDashboard,
          taskStatusTotals: { ...mockDashboard.taskStatusTotals, total: 0, completionPercent: null },
        },
      });

      const res = await LecturerCourseService.getCourseDashboard(mockCourseId);

      expect(res.taskStatusTotals.completionPercent).toBeNull();
      expect(res.taskStatusTotals.total).toBe(0);
    }
  );
});
