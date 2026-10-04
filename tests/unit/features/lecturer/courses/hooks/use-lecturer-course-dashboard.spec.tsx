import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { fptTest } from "@/testing/fpt-test-helper";
import { LecturerCourseService } from "@/features/lecturer/courses/api/lecturer-course-service";
import {
  LECTURER_COURSE_QUERY_KEYS,
  useLecturerCourseDashboard,
} from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import type {
  LecturerCourseDashboardResponse,
  LecturerDashboardSelection,
} from "@/features/lecturer/courses/types/lecturer-course-dashboard";

vi.mock("@/features/lecturer/courses/api/lecturer-course-service", () => ({
  LecturerCourseService: {
    getCourseDashboard: vi.fn(),
  },
}));

const date = "04/10/2026";
const courseId = "course-1";
const defaultSelection: LecturerDashboardSelection = { mode: "default" };
const siteSelection: LecturerDashboardSelection = {
  mode: "site",
  teamId: "team-1",
  jiraIntegrationId: "jira-1",
};
const sprintSelection: LecturerDashboardSelection = {
  mode: "sprint",
  teamId: "team-1",
  sprintId: "sprint-1",
};

function payload(mark: string): LecturerCourseDashboardResponse {
  return { generatedAt: mark } as LecturerCourseDashboardResponse;
}

describe("useLecturerCourseDashboard", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: date,
      description: "Moi selection co query key rieng va doi Site chi goi mot GET",
    },
    async () => {
      vi.mocked(LecturerCourseService.getCourseDashboard).mockImplementation(async (_id, selection) =>
        payload(selection?.mode ?? "default"),
      );
      const { result, rerender } = renderHook(
        ({ selection }: { selection: LecturerDashboardSelection }) =>
          useLecturerCourseDashboard(courseId, selection),
        {
          wrapper,
          initialProps: { selection: defaultSelection } as { selection: LecturerDashboardSelection },
        },
      );

      await waitFor(() => expect(result.current.data?.generatedAt).toBe("default"));
      rerender({ selection: siteSelection });
      await waitFor(() => expect(result.current.data?.generatedAt).toBe("site"));

      expect(LecturerCourseService.getCourseDashboard).toHaveBeenCalledTimes(2);
      expect(LecturerCourseService.getCourseDashboard).toHaveBeenLastCalledWith(courseId, siteSelection);
      expect(
        client.getQueryData(LECTURER_COURSE_QUERY_KEYS.lecturerDashboardView(courseId, defaultSelection)),
      ).toMatchObject({ generatedAt: "default" });
      expect(
        client.getQueryData(LECTURER_COURSE_QUERY_KEYS.lecturerDashboardView(courseId, siteSelection)),
      ).toMatchObject({ generatedAt: "site" });
    },
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: date,
      description: "Doi Sprint that bai khong tu goi lai",
    },
    async () => {
      vi.mocked(LecturerCourseService.getCourseDashboard).mockRejectedValueOnce(new Error("network"));
      const { result } = renderHook(() => useLecturerCourseDashboard(courseId, sprintSelection), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(LecturerCourseService.getCourseDashboard).toHaveBeenCalledTimes(1);
    },
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: date,
      description: "Doi Site giu response cu trong luc chi mot GET moi dang cho",
    },
    async () => {
      let releaseSite: (value: LecturerCourseDashboardResponse) => void = () => undefined;
      vi.mocked(LecturerCourseService.getCourseDashboard).mockImplementation((_id, selection) => {
        if (!selection || selection.mode === "default") return Promise.resolve(payload("default"));
        return new Promise((resolve) => {
          releaseSite = resolve;
        });
      });
      const { result, rerender } = renderHook(
        ({ selection }: { selection: LecturerDashboardSelection }) =>
          useLecturerCourseDashboard(courseId, selection),
        {
          wrapper,
          initialProps: { selection: defaultSelection } as { selection: LecturerDashboardSelection },
        },
      );

      await waitFor(() => expect(result.current.data?.generatedAt).toBe("default"));
      rerender({ selection: siteSelection });
      await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));

      expect(result.current.data?.generatedAt).toBe("default");
      expect(LecturerCourseService.getCourseDashboard).toHaveBeenCalledTimes(2);
      releaseSite(payload("site"));
      await waitFor(() => expect(result.current.data?.generatedAt).toBe("site"));
    },
  );
});
