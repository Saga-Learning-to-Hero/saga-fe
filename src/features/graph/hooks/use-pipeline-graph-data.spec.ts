import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";

const progressMock = vi.fn();
const tasksMock = vi.fn();
const commitsMock = vi.fn();
const taskCommitsMock = vi.fn();
const realtimeMock = vi.fn();
const integrationsMock = vi.fn();

vi.mock("@/features/student/project/hooks/useProjectSync", () => ({
  useProjectProgress: (...args: unknown[]) => progressMock(...args),
  useProjectCommits: (...args: unknown[]) => commitsMock(...args),
  useTaskCommits: (...args: unknown[]) => taskCommitsMock(...args),
}));

vi.mock("@/features/student/sprint-progress/hooks/use-project-tasks", () => ({
  useProjectTasksData: (...args: unknown[]) => tasksMock(...args),
}));

vi.mock("@/features/student/project/hooks/use-project-realtime", () => ({
  useProjectRealtime: (...args: unknown[]) => realtimeMock(...args),
}));

vi.mock("@/features/student/project/hooks/useProjectIntegrations", () => ({
  useProjectIntegrations: (...args: unknown[]) => integrationsMock(...args),
}));

import { usePipelineGraphData } from "./use-pipeline-graph-data";

function idleQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

describe("usePipelineGraphData", () => {
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client }, children);
    progressMock.mockReset();
    tasksMock.mockReset();
    commitsMock.mockReset();
    taskCommitsMock.mockReset();
    realtimeMock.mockReset();
    integrationsMock.mockReset();

    progressMock.mockReturnValue(idleQuery({ isSuccess: true, data: { memberProgress: [] } }));
    tasksMock.mockReturnValue(
      idleQuery({
        isSuccess: true,
        data: [
          {
            id: "task-a",
            externalId: "a",
            externalKey: "SAGA-A",
            title: "Task A",
            status: "IN_PROGRESS",
            issueTypeName: "Task",
            linkedCommitCount: 1,
            createdAt: "2026-09-14T00:00:00Z",
            updatedAt: "2026-09-14T00:00:00Z",
          },
          {
            id: "task-b",
            externalId: "b",
            externalKey: "SAGA-B",
            title: "Task B",
            status: "TODO",
            issueTypeName: "Task",
            linkedCommitCount: 0,
            createdAt: "2026-09-14T00:00:00Z",
            updatedAt: "2026-09-14T00:00:00Z",
          },
        ],
      })
    );
    commitsMock.mockReturnValue(idleQuery({ isSuccess: true, data: [] }));
    taskCommitsMock.mockReturnValue(idleQuery({ isSuccess: true, data: [] }));
    realtimeMock.mockReturnValue({ status: "OPEN" });
    integrationsMock.mockReturnValue(idleQuery({ isSuccess: true, data: { jira: null, github: null } }));
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Mo Pipeline khong goi task commits khi chua chon Task",
    },
    () => {
      renderHook(
        () =>
          usePipelineGraphData({
            enabled: true,
            projectId: "proj-1",
            selectedTaskId: null,
            teamMembers: [],
            filter: { studentId: "ALL", sprintId: "ALL", anomaliesOnly: false },
          }),
        { wrapper }
      );
      expect(taskCommitsMock).toHaveBeenCalledWith(null, null, { enabled: false });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chon mot Task chi bat mot query lien ket dung ID do",
    },
    () => {
      renderHook(
        () =>
          usePipelineGraphData({
            enabled: true,
            projectId: "proj-1",
            selectedTaskId: "task-a",
            teamMembers: [],
            filter: { studentId: "ALL", sprintId: "ALL", anomaliesOnly: false },
          }),
        { wrapper }
      );
      expect(taskCommitsMock).toHaveBeenCalledWith("proj-1", "task-a", { enabled: true });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "14/09/2026",
      description: "Doi Task dung ID moi, tab Neo4j tat toan bo query Pipeline",
    },
    () => {
      const { rerender } = renderHook(
        (props: { selectedTaskId: string | null; enabled: boolean }) =>
          usePipelineGraphData({
            enabled: props.enabled,
            projectId: "proj-1",
            selectedTaskId: props.selectedTaskId,
            teamMembers: [],
            filter: { studentId: "ALL", sprintId: "ALL", anomaliesOnly: false },
          }),
        { wrapper, initialProps: { selectedTaskId: "task-a", enabled: true } }
      );
      rerender({ selectedTaskId: "task-b", enabled: true });
      expect(taskCommitsMock).toHaveBeenLastCalledWith("proj-1", "task-b", { enabled: true });
      rerender({ selectedTaskId: "task-b", enabled: false });
      expect(taskCommitsMock).toHaveBeenLastCalledWith(null, null, { enabled: false });
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "14/09/2026",
      description: "Realtime chi bat khi Pipeline dang mo, khong reload trang",
    },
    () => {
      renderHook(
        () =>
          usePipelineGraphData({
            enabled: true,
            projectId: "proj-1",
            selectedTaskId: null,
            teamMembers: [],
            filter: { studentId: "ALL", sprintId: "ALL", anomaliesOnly: false },
          }),
        { wrapper }
      );
      expect(realtimeMock).toHaveBeenCalledWith("proj-1", { enabled: true });
    }
  );
});
