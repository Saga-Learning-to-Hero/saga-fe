import { describe, expect, vi, beforeEach } from "vitest";
import { StudentDashboardService } from "@/features/student/dashboard/api/student-dashboard-service";
import type { StudentDashboardResponse } from "@/features/student/dashboard/types/student-dashboard-types";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

describe("StudentDashboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCourseId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

  const mockDashboardResponse: StudentDashboardResponse = {
    student: {
      studentId: "std_01",
      userId: "usr_01",
      studentCode: "HE170504",
      fullName: "Lê Hồng Phúc",
      avatarUrl: "https://avatar.example/phuc.png",
      teamRole: "MEMBER",
    },
    course: {
      courseId: mockCourseId,
      courseCode: "SWP391_FA26_SE1705",
      subjectCode: "SWP391",
      subjectName: "Software Development Project",
      semesterCode: "FA26",
    },
    team: {
      teamId: "team_01",
      teamNo: 1,
      teamName: "SAGA Platform",
      projectId: "proj_01",
      projectName: "SAGA AI Matrix",
      membersCount: 5,
    },
    integrations: {
      jira: {
        connected: true,
        projectKey: "SAGA",
        status: "ACTIVE",
        lastSyncedAt: "2026-09-20T13:39:50.962Z",
      },
      github: {
        connected: true,
        repositoryCount: 2,
        status: "ACTIVE",
        lastSyncedAt: "2026-09-20T13:39:50.962Z",
      },
    },
    currentSprint: {
      id: "sprint_01",
      externalSprintId: "10024",
      name: "Sprint 3: Core Dashboard",
      state: "ACTIVE",
      startDate: "2026-09-10T08:00:00.000Z",
      endDate: "2026-09-24T23:59:59.000Z",
      totalTasks: 24,
      completedTasks: 15,
      completionPercent: 62.5,
    },
    myMetrics: {
      tasks: {
        totalAssigned: 7,
        todo: 1,
        inProgress: 2,
        inReview: 1,
        done: 3,
        blocked: 0,
        completionPercent: 42.8,
        totalStoryPoints: 18,
        completedStoryPoints: 8,
      },
      commits: {
        totalCommits: 34,
        linkedCommits: 31,
        unlinkedCommits: 3,
        traceabilityPercent: 91.2,
        lastCommittedAt: "2026-09-20T13:39:50.962Z",
      },
    },
    myActiveTasks: [
      {
        id: "task_01",
        externalKey: "SAGA-45",
        title: "Thiết kế component DateRangePicker theo GMT+7",
        status: "IN_PROGRESS",
        priority: "HIGH",
        storyPoints: 3,
        dueDate: "2026-09-21T23:59:59.000Z",
        linkedCommitCount: 2,
        evidenceCommitCount: 1,
        hasAnomaly: false,
      },
    ],
    recentCommits: [
      {
        sha: "d46f6002c963f66afa6",
        shortSha: "d46f600",
        message: "feat: [FE][SAGA-45] Tich hop custom popover cho DatePicker",
        repositoryName: "saga-fe",
        committedAt: "2026-09-20T13:39:50.963Z",
        linkedTaskKeys: ["SAGA-45"],
      },
    ],
    weeklyCommits: [
      {
        startDate: "2026-09-14",
        endDate: "2026-09-20",
        commits: 12,
      },
    ],
    actionableAlerts: [
      {
        id: "alert_01",
        type: "MSR_ANOMALY",
        severity: "WARNING",
        title: "Nhiệm vụ DONE nhưng chưa có commit minh chứng",
        message: "SAGA-39 đã DONE nhưng chưa ghi nhận commit liên kết.",
        actionType: "VIEW_COMMITS",
        targetIds: {
          courseId: mockCourseId,
          taskId: "task_03",
        },
        remainingPeers: 0,
      },
    ],
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "20/09/2026",
      description: "GET /api/student/courses/{courseId}/dashboard tra ve day du dashboard data cho sinh vien",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockDashboardResponse });

      const res = await StudentDashboardService.getDashboard(mockCourseId);

      expect(getSpy).toHaveBeenCalledWith(`/api/student/courses/${mockCourseId}/dashboard`);
      expect(res.student.studentCode).toBe("HE170504");
      expect(res.course.courseId).toBe(mockCourseId);
      expect(res.team?.teamNo).toBe(1);
      expect(res.myMetrics.tasks.totalAssigned).toBe(7);
      expect(res.myActiveTasks).toHaveLength(1);
      expect(res.actionableAlerts).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "20/09/2026",
      description: "Xu ly hop le khi sinh vien chua co nhom (team = null) hoac chua co du an (projectId = null)",
    },
    async () => {
      const noTeamResponse: StudentDashboardResponse = {
        ...mockDashboardResponse,
        team: null,
        currentSprint: null,
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: noTeamResponse });

      const res = await StudentDashboardService.getDashboard(mockCourseId);

      expect(res.team).toBeNull();
      expect(res.currentSprint).toBeNull();
      expect(res.student.studentCode).toBe("HE170504");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "20/09/2026",
      description: "Throw ValidationException khi courseId bi rong hoac chi chua khoang trang",
    },
    async () => {
      await expect(StudentDashboardService.getDashboard("")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
      await expect(StudentDashboardService.getDashboard("   ")).rejects.toThrow(
        "Throw ValidationException: Course ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "20/09/2026",
      description: "Khong nuot loi 403 FORBIDDEN khi sinh vien khong thuoc lop hoc phan",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Không thuộc lớp này", "STUDENT_COURSE_FORBIDDEN", 403)
      );

      await expect(StudentDashboardService.getDashboard(mockCourseId)).rejects.toMatchObject({
        code: "STUDENT_COURSE_FORBIDDEN",
        status: 403,
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "20/09/2026",
      description: "Khong nuot loi 500 khi server gap su co he thong",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lỗi cơ sở dữ liệu", "DATABASE_ERROR", 500)
      );

      await expect(StudentDashboardService.getDashboard(mockCourseId)).rejects.toMatchObject({
        code: "DATABASE_ERROR",
        status: 500,
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "20/09/2026",
      description: "Xu ly bien voi danh sach rong (myActiveTasks=[], weeklyCommits=[], actionableAlerts=[])",
    },
    async () => {
      const boundaryResponse: StudentDashboardResponse = {
        ...mockDashboardResponse,
        myActiveTasks: [],
        recentCommits: [],
        weeklyCommits: [],
        actionableAlerts: [],
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: boundaryResponse });

      const res = await StudentDashboardService.getDashboard(mockCourseId);

      expect(res.myActiveTasks).toEqual([]);
      expect(res.recentCommits).toEqual([]);
      expect(res.weeklyCommits).toEqual([]);
      expect(res.actionableAlerts).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "24/09/2026",
      description: "Truyen sprintId hop le thi gui kem query params sprintId",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockDashboardResponse });
      const mockSprintId = "sprint_uuid_101";

      const res = await StudentDashboardService.getDashboard(mockCourseId, mockSprintId);

      expect(getSpy).toHaveBeenCalledWith(
        `/api/student/courses/${mockCourseId}/dashboard`,
        { params: { sprintId: mockSprintId } }
      );
      expect(res.currentSprint?.id).toBe("sprint_01");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "24/09/2026",
      description: "Truyen sprintId rong hoac chi chua khoang trang thi khong gui kem query params",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockDashboardResponse });

      await StudentDashboardService.getDashboard(mockCourseId, "   ");

      expect(getSpy).toHaveBeenCalledWith(`/api/student/courses/${mockCourseId}/dashboard`);
    }
  );
});
