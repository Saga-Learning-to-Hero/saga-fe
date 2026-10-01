import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import type { ProjectTaskResponse } from "@/features/student/sprint-progress/types/jira-task-types";

const getTaskTransitions = vi.fn();
const transitionTask = vi.fn();

vi.mock("@/features/student/sprint-progress/api/project-task-service", () => ({
  ProjectTaskService: {
    getTaskTransitions: (...args: unknown[]) => getTaskTransitions(...args),
    transitionTask: (...args: unknown[]) => transitionTask(...args),
  },
}));

vi.mock("@/lib/api-error", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-error")>();
  return {
    ...actual,
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
    showWarningToast: vi.fn(),
  };
});

import { useTransitionTask } from "@/features/student/sprint-progress/hooks/use-project-tasks";

function task(status: string): ProjectTaskResponse {
  return {
    id: "task-1",
    externalId: "jira-1",
    externalKey: "SAGA-1",
    title: "Task",
    status,
    jiraStatusName: status === "IN_PROGRESS" ? "In Progress" : "To Do",
    issueTypeName: "Task",
    issueTypeLevel: "STANDARD",
    linkedCommitCount: 0,
    createdAt: "2026-09-29T00:00:00.000Z",
    updatedAt: "2026-09-29T00:00:00.000Z",
  };
}

describe("useTransitionTask", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    getTaskTransitions.mockResolvedValue([{ id: "21", name: "Start Progress", toStatusName: "In Progress" }]);
    transitionTask.mockResolvedValue(task("IN_PROGRESS"));
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Transition thanh cong ghi ProjectTaskResponse vao cache, khong GET /tasks",
    },
    async () => {
      queryClient.setQueryData(JIRA_SPRINT_QUERY_KEYS.tasks("proj-1"), [task("TODO")]);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useTransitionTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId: "proj-1",
          taskId: "task-1",
          data: { targetStatus: "IN_PROGRESS" },
        });
      });

      await waitFor(() => expect(transitionTask).toHaveBeenCalled());
      const cached = queryClient.getQueryData<ProjectTaskResponse[]>(JIRA_SPRINT_QUERY_KEYS.tasks("proj-1"));
      expect(cached?.[0].status).toBe("IN_PROGRESS");
      expect(queryClient.getQueryData(JIRA_SPRINT_QUERY_KEYS.taskDetail("proj-1", "task-1"))).toEqual(
        task("IN_PROGRESS")
      );
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks("proj-1"),
      });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "29/09/2026",
      description: "Transition that bai khong ghi de list task",
    },
    async () => {
      queryClient.setQueryData(JIRA_SPRINT_QUERY_KEYS.tasks("proj-1"), [task("TODO")]);
      transitionTask.mockRejectedValueOnce(new Error("JIRA_TRANSITION_FAILED"));
      const { result } = renderHook(() => useTransitionTask(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            projectId: "proj-1",
            taskId: "task-1",
            data: { transitionId: "21" },
          });
        })
      ).rejects.toThrow("JIRA_TRANSITION_FAILED");

      const cached = queryClient.getQueryData<ProjectTaskResponse[]>(JIRA_SPRINT_QUERY_KEYS.tasks("proj-1"));
      expect(cached?.[0].status).toBe("TODO");
    }
  );
});
