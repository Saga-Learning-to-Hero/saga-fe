import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";

const syncProject = vi.fn();

vi.mock("@/features/student/project/api/project-projection-service", () => ({
  ProjectProjectionService: {
    syncProject: (...args: unknown[]) => syncProject(...args),
  },
}));

import {
  PROJECT_PROJECTION_QUERY_KEYS,
  useSyncProject,
} from "@/features/student/project/hooks/useProjectSync";

describe("useSyncProject", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    syncProject.mockResolvedValue({ jira: "QUEUED", github: "QUEUED" });
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "POST /sync thanh cong chi invalidate sync-status",
    },
    async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useSyncProject(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync("proj-sync-1");
      });

      await waitFor(() => expect(syncProject).toHaveBeenCalledWith("proj-sync-1"));
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus("proj-sync-1"),
      });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks("proj-sync-1"),
      });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits("proj-sync-1"),
      });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress("proj-sync-1"),
      });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.all,
      });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "29/09/2026",
      description: "POST /sync that bai khong invalidate cache",
    },
    async () => {
      syncProject.mockRejectedValueOnce(new Error("LECTURER_COURSE_FORBIDDEN"));
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useSyncProject(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync("proj-sync-2");
        })
      ).rejects.toThrow("LECTURER_COURSE_FORBIDDEN");

      expect(invalidateSpy).not.toHaveBeenCalled();
    }
  );
});
