import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";

const progressMock = vi.fn();
const tasksMock = vi.fn();
const commitsMock = vi.fn();
const taskCommitLinksMock = vi.fn();
const branchesMock = vi.fn();
const realtimeMock = vi.fn();
const integrationsMock = vi.fn();

vi.mock("@/features/student/project/hooks/useProjectSync", () => ({
  useProjectProgress: (...args: unknown[]) => progressMock(...args),
  useProjectCommits: (...args: unknown[]) => commitsMock(...args),
  useProjectTaskCommitLinks: (...args: unknown[]) => taskCommitLinksMock(...args),
  useProjectRepositoryBranches: (...args: unknown[]) => branchesMock(...args),
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

import { usePipelineGraphData } from "@/features/graph/hooks/use-pipeline-graph-data";

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
    taskCommitLinksMock.mockReset();
    branchesMock.mockReset();
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
    taskCommitLinksMock.mockReturnValue(
      idleQuery({
        isSuccess: true,
        data: {
          projectId: "proj-1",
          filter: {
            repoId: null,
            repositoryId: null,
            repositoryFullName: null,
            branchName: null,
            branchResolution: "REACHABLE_AT_SYNC",
            resolvedAt: null,
          },
          links: [],
          page: 0,
          size: 200,
          total: 0,
        },
      })
    );
    branchesMock.mockReturnValue(idleQuery({ isSuccess: true, data: { branches: [] } }));
    realtimeMock.mockReturnValue({ status: "OPEN" });
    integrationsMock.mockReturnValue(idleQuery({ isSuccess: true, data: { jira: null, github: null } }));
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Mo Pipeline goi mot batch canonical thay vi query commit theo tung Task",
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
      expect(taskCommitLinksMock).toHaveBeenCalledWith(
        "proj-1",
        { repoId: null, branchName: null },
        { enabled: true }
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chon Task doc commit tu batch canonical da tai, khong phat sinh N+1",
    },
    () => {
      taskCommitLinksMock.mockReturnValue(
        idleQuery({
          isSuccess: true,
          data: {
            filter: { branchResolution: "REACHABLE_AT_SYNC" },
            links: [
              {
                taskId: "task-a",
                taskKey: "SAGA-A",
                commitId: "commit-1",
                sha: "abc1234",
                message: "manual link without Jira key",
                repoId: "repo-1",
                repositoryFullName: "org/repo",
                headRef: "main",
                branchNames: ["main", "develop"],
                linkedAt: "2026-09-15T10:00:00",
                linkSource: "MANUAL",
              },
            ],
          },
        })
      );
      const { result } = renderHook(
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
      expect(taskCommitLinksMock).toHaveBeenCalledTimes(1);
      expect(result.current.selectedCommits).toHaveLength(1);
      expect(result.current.selectedCommits[0].sha).toBe("abc1234");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "14/09/2026",
      description: "Repository va Branch duoc gui vao batch canonical; dong Pipeline tat query",
    },
    () => {
      integrationsMock.mockReturnValue(
        idleQuery({
          isSuccess: true,
          data: {
            jira: { status: "ACTIVE" },
            github: {
              status: "ACTIVE",
              repositories: [{ id: "repo-1", repositoryId: 123, fullName: "org/repo" }],
            },
          },
        })
      );
      branchesMock.mockReturnValue(
        idleQuery({ isSuccess: true, data: { branches: [{ name: "develop", isDefault: false }] } })
      );
      const { rerender } = renderHook(
        (props: { enabled: boolean }) =>
          usePipelineGraphData({
            enabled: props.enabled,
            projectId: "proj-1",
            selectedTaskId: "task-a",
            teamMembers: [],
            filter: {
              studentId: "ALL",
              sprintId: "ALL",
              repoId: "repo-1",
              branchName: "develop",
            },
          }),
        { wrapper, initialProps: { enabled: true } }
      );
      expect(taskCommitLinksMock).toHaveBeenLastCalledWith(
        "proj-1",
        { repoId: "repo-1", branchName: "develop" },
        { enabled: true }
      );
      rerender({ enabled: false });
      expect(taskCommitLinksMock).toHaveBeenLastCalledWith(
        "proj-1",
        { repoId: "repo-1", branchName: "develop" },
        { enabled: false }
      );
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
