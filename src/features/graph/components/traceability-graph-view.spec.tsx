import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";

const studentCourseMock = vi.fn();
const myTeamMock = vi.fn();
const graphQueryMock = vi.fn();

vi.mock("@/features/student/courses/hooks/use-student-course-context", () => ({
  useStudentCourseContext: () => studentCourseMock(),
}));

vi.mock("@/features/student/courses/hooks/use-student-courses", () => ({
  useStudentMyTeam: () => myTeamMock(),
}));

vi.mock("@/features/student/sprint-progress/hooks/use-project-sprints", () => ({
  useProjectSprints: () => ({
    data: [
      { id: "sp-1", name: "Sprint 1", state: "active" },
      { id: "sp-2", name: "Sprint 2", state: "future" },
    ],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../hooks/use-project-graph", () => ({
  PROJECT_GRAPH_QUERY_KEY: "project-graph",
  useProjectGraph: (...args: unknown[]) => graphQueryMock(...args),
}));

vi.mock("../hooks/use-pipeline-graph-data", () => ({
  usePipelineGraphData: () => ({
    members: [],
    tasks: [{ id: "t-1", externalKey: "SAGA-1", title: "Task 1", status: "TODO" }],
    sprints: [],
    repositories: [],
    branches: [],
    lanes: [],
    filteredTasks: [{ id: "t-1", externalKey: "SAGA-1", title: "Task 1", status: "TODO" }],
    selectedCommits: [],
    stats: { doneWithoutLinkedCommits: 0 },
    effectiveTaskId: null,
    isLoadingMain: false,
    isLoadingCommits: false,
    isLoadingTaskCommits: false,
    isLoadingBranches: false,
    sanitizedFilter: {
      studentId: "ALL",
      sprintId: "ALL",
      anomaliesOnly: false,
      repoId: "ALL",
      branchName: "ALL",
    },
    taskCommitLinksFilter: { branchResolution: "REACHABLE_AT_SYNC" },
  }),
}));

vi.mock("cytoscape", () => {
  return {
    default: vi.fn(() => ({
      destroy: vi.fn(),
      elements: vi.fn(() => ({
        remove: vi.fn(),
        filter: vi.fn(() => []),
        unselect: vi.fn(),
        map: vi.fn(() => []),
      })),
      nodes: vi.fn(() => []),
      edges: vi.fn(() => []),
      batch: vi.fn((fn: () => void) => fn()),
      add: vi.fn(),
      remove: vi.fn(),
      getElementById: vi.fn(() => ({
        length: 0,
        data: vi.fn(),
        select: vi.fn(),
      })),
      layout: vi.fn(() => ({ run: vi.fn() })),
      on: vi.fn(),
      zoom: vi.fn(() => 1),
      fit: vi.fn(),
    })),
    __esModule: true,
  };
});

import { TraceabilityGraphView } from "./traceability-graph-view";

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

describe("TraceabilityGraphView", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    studentCourseMock.mockReset();
    myTeamMock.mockReset();
    graphQueryMock.mockReset();

    studentCourseMock.mockReturnValue({
      courseId: "c-1",
      course: { id: "c-1" },
      isLoading: false,
      isInvalidCourse: false,
    });

    myTeamMock.mockReturnValue(
      idleQuery({
        isSuccess: true,
        data: {
          teamId: "t-1",
          teamNo: 1,
          teamName: "Super Team",
          projectId: "proj-1",
          members: [
            {
              teamMemberId: "m1",
              studentProfileId: "sp-uuid-1",
              studentCode: "SE1701",
              fullName: "Tran Van B",
              role: "LEADER",
            },
          ],
        },
      })
    );

    graphQueryMock.mockReturnValue(
      idleQuery({
        isSuccess: true,
        data: {
          nodes: [
            { data: { id: "student:sp-uuid-1", label: "Tran Van B", type: "STUDENT" } },
            { data: { id: "task:t1", label: "SAGA-201", type: "TASK" } },
          ],
          edges: [
            {
              data: {
                id: "e1",
                source: "student:sp-uuid-1",
                target: "task:t1",
                label: "ASSIGNED_TO",
              },
            },
          ],
        },
      })
    );
  });

  const renderView = () => {
    return render(
      <QueryClientProvider client={client}>
        <TraceabilityGraphView />
      </QueryClientProvider>
    );
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Mo Neo4j Graph mac dinh chi goi Overview va khong con badge demo minh hoa",
    },
    () => {
      renderView();
      expect(screen.getByText("Tổng quan nhóm")).toBeTruthy();
      expect(screen.queryByText(/Dữ liệu minh họa/i)).toBeNull();

      expect(graphQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          graphType: "OVERVIEW",
          enabled: true,
        })
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "15/09/2026",
      description: "Chuyen sang che do Hoat dong Sprint tu dong chon Sprint active va goi graph query",
    },
    () => {
      renderView();
      const activityBtn = screen.getByText("Hoạt động Sprint");
      fireEvent.click(activityBtn);

      expect(graphQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          graphType: "ACTIVITY",
          sprintId: "sp-1",
          enabled: true,
        })
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "15/09/2026",
      description: "Chuyen doi qua lai giua Neo4j Graph va Pipeline Flow",
    },
    () => {
      renderView();
      const pipelineBtn = screen.getByText("Pipeline Flow");
      fireEvent.click(pipelineBtn);

      expect(screen.getByText("Luồng liên kết (Flow)")).toBeTruthy();
      expect(screen.getByText("Ma trận đối soát (Audit matrix)")).toBeTruthy();

      const graphBtn = screen.getByText("Neo4j Graph");
      fireEvent.click(graphBtn);

      expect(screen.getByText("Tổng quan nhóm")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "15/09/2026",
      description: "Neo4j Graph khong hien thi bo loc Repository va Branch",
    },
    () => {
      renderView();
      expect(screen.queryByText("Repository:")).toBeNull();
      expect(screen.queryByText("Branch:")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "15/09/2026",
      description: "Hien thi dung Thong ke cau truc Graph tu du lieu that",
    },
    () => {
      renderView();
      expect(screen.getByText("Thống kê cấu trúc Graph")).toBeTruthy();
      expect(screen.getByText("2")).toBeTruthy();
      expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("0 bất thường")).toBeTruthy();
    }
  );
});
