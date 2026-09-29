import { describe, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { STUDENT_COURSE_QUERY_KEYS } from "@/features/student/courses/hooks/use-student-courses";
import { STUDENT_DASHBOARD_QUERY_KEYS } from "@/features/student/dashboard/hooks/use-student-dashboard";
import {
  isCachedStudentTeamLeader,
  shouldPrefetchTeamProgress,
  shouldRetryLeaderOnlyProjection,
} from "@/features/student/project/lib/student-team-role-cache";

describe("isCachedStudentTeamLeader", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Cache team myRole LEADER thi cho phep prefetch /progress",
    },
    () => {
      const queryClient = new QueryClient();
      queryClient.setQueryData(STUDENT_COURSE_QUERY_KEYS.studentMyTeam("course-1"), {
        teamId: "t1",
        teamNo: 1,
        teamName: "Nhom 1",
        myRole: "LEADER",
        projectId: "p1",
        members: [],
      });
      expect(isCachedStudentTeamLeader(queryClient, "course-1")).toBe(true);
      expect(shouldPrefetchTeamProgress(queryClient, { includeTeamProgress: true, courseId: "course-1" })).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "29/09/2026",
      description: "Cache team myRole MEMBER thi khong prefetch /progress",
    },
    () => {
      const queryClient = new QueryClient();
      queryClient.setQueryData(STUDENT_COURSE_QUERY_KEYS.studentMyTeam("course-1"), {
        teamId: "t1",
        teamNo: 1,
        teamName: "Nhom 1",
        myRole: "MEMBER",
        projectId: "p1",
        members: [],
      });
      expect(isCachedStudentTeamLeader(queryClient, "course-1")).toBe(false);
      expect(shouldPrefetchTeamProgress(queryClient, { includeTeamProgress: true, courseId: "course-1" })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Chua co cache role thi khong prefetch /progress",
    },
    () => {
      const queryClient = new QueryClient();
      expect(isCachedStudentTeamLeader(queryClient, "course-1")).toBe(false);
      expect(shouldPrefetchTeamProgress(queryClient, { includeTeamProgress: true, courseId: "course-1" })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "29/09/2026",
      description: "Dashboard teamRole LEADER duoc dung khi chua co team cache",
    },
    () => {
      const queryClient = new QueryClient();
      queryClient.setQueryData(STUDENT_DASHBOARD_QUERY_KEYS.byCourse("course-1", null), {
        student: { teamRole: "LEADER" },
      });
      expect(isCachedStudentTeamLeader(queryClient, "course-1")).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "29/09/2026",
      description: "includeTeamProgress mac dinh false ke ca khi cache LEADER",
    },
    () => {
      const queryClient = new QueryClient();
      queryClient.setQueryData(STUDENT_COURSE_QUERY_KEYS.studentMyTeam("course-1"), {
        myRole: "LEADER",
      });
      expect(shouldPrefetchTeamProgress(queryClient, { courseId: "course-1" })).toBe(false);
      expect(shouldPrefetchTeamProgress(queryClient, undefined)).toBe(false);
    }
  );
});

describe("shouldRetryLeaderOnlyProjection", () => {
  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "29/09/2026",
      description: "403 ACCESS_DENIED tren /progress khong retry",
    },
    () => {
      expect(shouldRetryLeaderOnlyProjection(0, { status: 403, code: "ACCESS_DENIED" })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "29/09/2026",
      description: "500 van retry mot lan",
    },
    () => {
      expect(shouldRetryLeaderOnlyProjection(0, { status: 500 })).toBe(true);
    }
  );
});
