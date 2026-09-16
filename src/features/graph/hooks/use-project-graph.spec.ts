import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProjectGraph, getProjectGraphQueryKey } from "./use-project-graph";
import { ProjectGraphService } from "../api/project-graph-service";
import type { GraphSubgraphFilterParams } from "../types/graph";

vi.mock("../api/project-graph-service", () => ({
  ProjectGraphService: {
    getProjectOverviewGraph: vi.fn(),
    getStudentContributionGraph: vi.fn(),
    getSprintActivityGraph: vi.fn(),
    getProjectAttributionGraph: vi.fn(),
    getSprintPeerReviewGraph: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function ProviderWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("useProjectGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTCID01 - [N] Normal: Overview goi dung ProjectGraphService.getProjectOverviewGraph", async () => {
    const mockData = { nodes: [], edges: [] };
    vi.mocked(ProjectGraphService.getProjectOverviewGraph).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "OVERVIEW",
          sprintId: "sp-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProjectGraphService.getProjectOverviewGraph).toHaveBeenCalledWith(
      "p-1",
      "sp-1",
      expect.any(AbortSignal)
    );
    expect(result.current.data).toEqual(mockData);
  });

  it("UTCID02 - [A] Abnormal: Activity khong duoc enabled khi thieu sprintId", async () => {
    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "ACTIVITY",
          sprintId: null,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(ProjectGraphService.getSprintActivityGraph).not.toHaveBeenCalled();
  });

  it("UTCID03 - [A] Abnormal: Peer Review khong duoc enabled khi thieu sprintId", async () => {
    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "PEER_REVIEW",
          sprintId: "",
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(ProjectGraphService.getSprintPeerReviewGraph).not.toHaveBeenCalled();
  });

  it("UTCID04 - [A] Abnormal: Contribution khong duoc enabled khi thieu studentId", async () => {
    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "CONTRIBUTION",
          studentId: null,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(ProjectGraphService.getStudentContributionGraph).not.toHaveBeenCalled();
  });

  it("UTCID05 - [N] Normal: Contribution goi voi studentProfileId sau khi strip prefix", async () => {
    const mockData = { nodes: [], edges: [] };
    vi.mocked(ProjectGraphService.getStudentContributionGraph).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "CONTRIBUTION",
          studentId: "student:stu-99",
          sprintId: "sp-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProjectGraphService.getStudentContributionGraph).toHaveBeenCalledWith(
      "p-1",
      "stu-99",
      "sp-1",
      expect.any(AbortSignal)
    );
  });

  it("UTCID06 - [B] Boundary: Query key canonical tach biet theo cac tham so", () => {
    const key1 = getProjectGraphQueryKey("p-1", "OVERVIEW", null, null);
    const key2 = getProjectGraphQueryKey("p-1", "OVERVIEW", "sp-1", null);
    const key3 = getProjectGraphQueryKey("p-1", "CONTRIBUTION", "sp-1", "stu-1");

    expect(key1).toEqual(["project-graph", "p-1", "OVERVIEW", null, null]);
    expect(key2).toEqual(["project-graph", "p-1", "OVERVIEW", "sp-1", null]);
    expect(key3).toEqual(["project-graph", "p-1", "CONTRIBUTION", "sp-1", "stu-1"]);
    expect(key1).not.toEqual(key2);
  });

  it("UTCID07 - [B] Boundary: Hook bi disable khi option enabled = false", async () => {
    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "OVERVIEW",
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(ProjectGraphService.getProjectOverviewGraph).not.toHaveBeenCalled();
  });

  it("UTCID08 - [N] Normal: Hook truyen subgraphParams vao ProjectGraphService va tao query key chua subgraphParams", async () => {
    const mockData = {
      nodes: [],
      edges: [],
      meta: {
        revision: "5",
        totalNodes: 100,
        totalEdges: 200,
        returnedNodes: 50,
        returnedEdges: 80,
        truncated: true,
      },
    };
    vi.mocked(ProjectGraphService.getProjectOverviewGraph).mockResolvedValueOnce(mockData);

    const subgraphParams: GraphSubgraphFilterParams = {
      nodeTypes: ["STUDENT", "TASK"],
      anomaliesOnly: true,
    };

    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "OVERVIEW",
          sprintId: "sp-1",
          subgraphParams,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProjectGraphService.getProjectOverviewGraph).toHaveBeenCalledWith(
      "p-1",
      {
        nodeTypes: ["STUDENT", "TASK"],
        anomaliesOnly: true,
        sprintId: "sp-1",
      },
      expect.any(AbortSignal)
    );
    expect(result.current.data?.meta?.truncated).toBe(true);

    const key = getProjectGraphQueryKey("p-1", "OVERVIEW", "sp-1", null, subgraphParams);
    expect(key).toEqual(["project-graph", "p-1", "OVERVIEW", "sp-1", null, subgraphParams]);
  });

  it("UTCID09 - [N] Normal: Attribution goi dung voi subgraphParams anomaliesOnly=true", async () => {
    const mockData = { nodes: [], edges: [] };
    vi.mocked(ProjectGraphService.getProjectAttributionGraph).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "ATTRIBUTION",
          sprintId: "sp-2",
          subgraphParams: { anomaliesOnly: true },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProjectGraphService.getProjectAttributionGraph).toHaveBeenCalledWith(
      "p-1",
      {
        anomaliesOnly: true,
        sprintId: "sp-2",
      },
      expect.any(AbortSignal)
    );
  });

  it("UTCID10 - [N] Normal: Hook truyen includeCommits va focusNodeId vao ProjectGraphService.getProjectOverviewGraph", async () => {
    const mockData = { nodes: [], edges: [] };
    vi.mocked(ProjectGraphService.getProjectOverviewGraph).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () =>
        useProjectGraph({
          projectId: "p-1",
          graphType: "OVERVIEW",
          sprintId: "sp-1",
          subgraphParams: {
            includeCommits: true,
            focusNodeId: "task:abc-123",
            depth: 1,
          },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ProjectGraphService.getProjectOverviewGraph).toHaveBeenCalledWith(
      "p-1",
      {
        includeCommits: true,
        focusNodeId: "task:abc-123",
        depth: 1,
        sprintId: "sp-1",
      },
      expect.any(AbortSignal)
    );
  });
});

