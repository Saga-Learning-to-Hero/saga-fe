import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { STUDENT_COURSE_QUERY_KEYS } from "@/features/student/courses/hooks/use-student-courses";

const getProjectProgress = vi.fn();
const getProjectCommits = vi.fn();
const getDashboard = vi.fn();

vi.mock("@/features/student/project/api/project-projection-service", () => ({
  ProjectProjectionService: {
    getProjectProgress: (...args: unknown[]) => getProjectProgress(...args),
    getProjectCommits: (...args: unknown[]) => getProjectCommits(...args),
  },
}));

vi.mock("@/features/student/dashboard/api/student-dashboard-service", () => ({
  StudentDashboardService: {
    getDashboard: (...args: unknown[]) => getDashboard(...args),
  },
}));

import { usePrefetchProjectProjection } from "@/features/student/project/hooks/useProjectSync";

describe("usePrefetchProjectProjection", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    getProjectProgress.mockResolvedValue({ memberProgress: [] });
    getProjectCommits.mockResolvedValue({ items: [] });
    getDashboard.mockResolvedValue({ student: { teamRole: "MEMBER" } });
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Leader hover prefetch GET /progress",
    },
    async () => {
      queryClient.setQueryData(STUDENT_COURSE_QUERY_KEYS.studentMyTeam("course-1"), {
        myRole: "LEADER",
        projectId: "proj-1",
        teamId: "t1",
        teamNo: 1,
        teamName: "Nhom 1",
        members: [],
      });
      const { result } = renderHook(() => usePrefetchProjectProjection(), { wrapper });
      act(() => {
        result.current("proj-1", { includeTeamProgress: true, courseId: "course-1" });
      });
      await waitFor(() => expect(getProjectProgress).toHaveBeenCalledWith("proj-1"));
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "29/09/2026",
      description: "Member hover khong GET /progress, van prefetch dashboard BFF",
    },
    async () => {
      queryClient.setQueryData(STUDENT_COURSE_QUERY_KEYS.studentMyTeam("course-1"), {
        myRole: "MEMBER",
        projectId: "proj-1",
        teamId: "t1",
        teamNo: 1,
        teamName: "Nhom 1",
        members: [],
      });
      const { result } = renderHook(() => usePrefetchProjectProjection(), { wrapper });
      act(() => {
        result.current("proj-1", {
          includeTeamProgress: true,
          includeCommits: true,
          courseId: "course-1",
        });
      });
      await waitFor(() => expect(getDashboard).toHaveBeenCalledWith("course-1"));
      await waitFor(() => expect(getProjectCommits).toHaveBeenCalledWith("proj-1"));
      expect(getProjectProgress).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Khong co cache role thi khong GET /progress",
    },
    async () => {
      const { result } = renderHook(() => usePrefetchProjectProjection(), { wrapper });
      act(() => {
        result.current("proj-1", { includeTeamProgress: true, courseId: "course-1" });
      });
      await waitFor(() => expect(getDashboard).toHaveBeenCalledWith("course-1"));
      expect(getProjectProgress).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "29/09/2026",
      description: "includeTeamProgress mac dinh false khong prefetch /progress ke ca Leader",
    },
    async () => {
      queryClient.setQueryData(STUDENT_COURSE_QUERY_KEYS.studentMyTeam("course-1"), {
        myRole: "LEADER",
        projectId: "proj-1",
        teamId: "t1",
        teamNo: 1,
        teamName: "Nhom 1",
        members: [],
      });
      const { result } = renderHook(() => usePrefetchProjectProjection(), { wrapper });
      act(() => {
        result.current("proj-1", { courseId: "course-1" });
      });
      await waitFor(() => expect(getDashboard).toHaveBeenCalledWith("course-1"));
      expect(getProjectProgress).not.toHaveBeenCalled();
    }
  );
});
