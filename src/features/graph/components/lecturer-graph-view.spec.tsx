import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";

const teamsMock = vi.fn();
const progressMock = vi.fn();
const tasksMock = vi.fn();
const commitsMock = vi.fn();
const taskCommitsMock = vi.fn();
const branchesMock = vi.fn();
const realtimeMock = vi.fn();
const integrationsMock = vi.fn();
const graphQueryMock = vi.fn();

vi.mock("@/features/lecturer/teams/hooks/use-lecturer-teams", () => ({
  useLecturerTeams: (...args: unknown[]) => teamsMock(...args),
}));

vi.mock("@/features/student/project/hooks/useProjectSync", () => ({
  useProjectProgress: (...args: unknown[]) => progressMock(...args),
  useProjectCommits: (...args: unknown[]) => commitsMock(...args),
  useProjectTaskCommitLinks: (...args: unknown[]) => taskCommitsMock(...args),
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

import { LecturerGraphView } from "./lecturer-graph-view";

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

const mockTeamsData = {
  courseId: "course-123",
  teams: [
    {
      teamId: "team-with-project",
      teamNo: 1,
      teamName: "SAGA Realtime",
      projectId: "proj-1",
      members: [
        {
          teamMemberId: "m1",
          courseEnrollmentId: "e1",
          studentProfileId: "sp1",
          studentCode: "SE1701",
          fullName: "Nguyen Van A",
          email: "a@fpt.edu.vn",
          role: "LEADER",
        },
      ],
    },
    {
      teamId: "team-no-project",
      teamNo: 2,
      teamName: "Chua Co Du An",
      projectId: null,
      members: [],
    },
  ],
};

const mockTasksData = [
  {
    id: "task-101",
    externalId: "ext-101",
    externalKey: "SAGA-101",
    title: "Thiet ke schema Neo4j",
    status: "DONE",
    issueTypeName: "Task",
    linkedCommitCount: 2,
    assigneeStudentId: "SE1701",
    assigneeDisplayName: "Nguyen Van A",
    sprint: { id: "sp-1", name: "Sprint 1" },
    createdAt: "2026-09-14T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
  {
    id: "task-102",
    externalId: "ext-102",
    externalKey: "SAGA-102",
    title: "Viet API endpoint",
    status: "DONE",
    issueTypeName: "Story",
    linkedCommitCount: 0,
    assigneeStudentId: "SE1701",
    assigneeDisplayName: "Nguyen Van A",
    sprint: { id: "sp-1", name: "Sprint 1" },
    createdAt: "2026-09-14T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
];

const mockProgressData = {
  projectId: "proj-1",
  teamId: "team-with-project",
  teamNo: 1,
  teamName: "SAGA Realtime",
  taskSummary: {
    total: 2,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 2,
    blocked: 0,
    completionPercent: 100,
  },
  currentSprint: {
    id: "sp-1",
    externalSprintId: "sp-1",
    name: "Sprint 1",
    state: "ACTIVE",
    startDate: "2026-09-01",
    endDate: "2026-09-14",
    totalTasks: 2,
    completedTasks: 2,
  },
  commitSummary: {
    total: 5,
    linked: 2,
    lastCommitAt: "2026-09-14T10:00:00Z",
  },
  evidenceSummary: {
    workSessions: 1,
    files: 2,
    webLinks: 1,
    confirmations: 2,
  },
  memberProgress: [
    {
      studentId: "SE1701",
      userId: "u1",
      fullName: "Nguyen Van A",
      studentCode: "SE1701",
      teamRole: "LEADER",
      tasks: {
        assigned: 2,
        assignedTotal: 2,
        completed: 2,
        incomplete: 0,
        inProgress: 0,
        blocked: 0,
      },
      commits: {
        total: 5,
        linkedToTasks: 2,
        tasksWithLinkedCommits: 1,
        lastCommitAt: "2026-09-14T10:00:00Z",
        lastCommittedAt: "2026-09-14T10:00:00Z",
      },
      evidenceConfirmations: 2,
    },
  ],
  sync: {
    jiraStatus: "ACTIVE",
    jiraLastSyncedAt: "2026-09-14T10:00:00Z",
    githubStatus: "ACTIVE",
    githubLastSyncedAt: "2026-09-14T10:00:00Z",
  },
  lastActivityAt: "2026-09-14T10:00:00Z",
};

describe("LecturerGraphView", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    teamsMock.mockReset();
    progressMock.mockReset();
    tasksMock.mockReset();
    commitsMock.mockReset();
    taskCommitsMock.mockReset();
    branchesMock.mockReset();
    realtimeMock.mockReset();
    integrationsMock.mockReset();
    graphQueryMock.mockReset();

    teamsMock.mockReturnValue(idleQuery({ isSuccess: true, data: mockTeamsData }));
    progressMock.mockReturnValue(idleQuery({ isSuccess: true, data: mockProgressData }));
    tasksMock.mockReturnValue(idleQuery({ isSuccess: true, data: mockTasksData }));
    commitsMock.mockReturnValue(idleQuery({ isSuccess: true, data: [] }));
    taskCommitsMock.mockReturnValue(
      idleQuery({
        isSuccess: true,
        data: {
          filter: { branchResolution: "REACHABLE_AT_SYNC" },
          links: [],
          total: 0,
        },
      })
    );
    branchesMock.mockReturnValue(idleQuery({ isSuccess: true, data: { branches: [] } }));
    realtimeMock.mockReturnValue({ status: "OPEN" });
    integrationsMock.mockReturnValue(
      idleQuery({
        isSuccess: true,
        data: { jira: { status: "ACTIVE" }, github: { status: "ACTIVE" } },
      })
    );

    graphQueryMock.mockReturnValue(
      idleQuery({
        isSuccess: true,
        data: {
          nodes: [
            { data: { id: "student:80ffd344-5190-4373-a2fb-10e74d64e55d", label: "Nguyen Van A", type: "STUDENT", subLabel: "SE1701" } },
            { data: { id: "task:t1", label: "SAGA-101", type: "TASK" } },
          ],
          edges: [
            { data: { id: "e1", source: "student:80ffd344-5190-4373-a2fb-10e74d64e55d", target: "task:t1", label: "ASSIGNED_TO" } },
          ],
        },
      })
    );
  });

  const renderView = (
    props: {
      courseId?: string;
      initialTeamId?: string;
      initialViewMode?: "GRAPH" | "PIPELINE";
    } = {}
  ) => {
    return render(
      <QueryClientProvider client={client}>
        <LecturerGraphView initialViewMode={props.initialViewMode || "PIPELINE"} {...props} />
      </QueryClientProvider>
    );
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chon team co projectId se goi progress, tasks, commits va hien thi du lieu that",
    },
    () => {
      renderView({ courseId: "course-123", initialTeamId: "team-with-project" });
      expect(screen.getByText(/Đồ thị & Đối soát nguồn gốc/i)).toBeTruthy();
      expect(screen.getByText("SAGA-101")).toBeTruthy();
      expect(screen.getByText("SAGA-102")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "14/09/2026",
      description: "Team khong co projectId hien thi empty state va khong goi API project",
    },
    () => {
      renderView({ courseId: "course-123", initialTeamId: "team-no-project" });
      expect(screen.getByText(/chưa khởi tạo dự án/i)).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "14/09/2026",
      description: "Click task cap nhat Inspector tu batch canonical, khong tao N+1",
    },
    () => {
      taskCommitsMock.mockReturnValue(
        idleQuery({
          isSuccess: true,
          data: {
            filter: { branchResolution: "REACHABLE_AT_SYNC" },
            links: [
              {
                taskId: "task-101",
                taskKey: "SAGA-101",
                commitId: "c1",
                repoId: "r1",
                repositoryFullName: "org/repo",
                sha: "abcdef1234567890",
                message: "feat: [SAGA-101] implement schema",
                headRef: "main",
                branchNames: ["main"],
                linkedAt: "2026-09-14T08:00:00Z",
                linkSource: "COMMIT_MESSAGE",
              },
            ],
            total: 1,
          },
        })
      );

      renderView({ courseId: "course-123", initialTeamId: "team-with-project" });
      const taskCard = screen.getByText("SAGA-101");
      fireEvent.click(taskCard);

      expect(screen.getAllByText("SAGA-101").length).toBeGreaterThan(1);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "14/09/2026",
      description: "Task khong co linked commit hien thi thong bao ro rang",
    },
    () => {
      taskCommitsMock.mockReturnValue(
        idleQuery({
          isSuccess: true,
          data: { filter: { branchResolution: "REACHABLE_AT_SYNC" }, links: [], total: 0 },
        })
      );

      renderView({ courseId: "course-123", initialTeamId: "team-with-project" });
      const taskCard = screen.getByText("SAGA-102");
      fireEvent.click(taskCard);

      expect(screen.getByText(/Chưa có commit được liên kết với task này/i)).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chuyen che do Flow sang Matrix giu nguyen selected task",
    },
    () => {
      renderView({ courseId: "course-123", initialTeamId: "team-with-project" });
      const taskCard = screen.getByText("SAGA-101");
      fireEvent.click(taskCard);

      const matrixBtn = screen.getByText(/Audit Matrix/i);
      fireEvent.click(matrixBtn);

      expect(screen.getByText(/Bảng đối soát/i)).toBeTruthy();
      expect(screen.getAllByText("SAGA-101").length).toBeGreaterThan(1);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "14/09/2026",
      description: "Khi BE tra ve 403 Forbidden se hien thi thong bao truy cap bi tu choi",
    },
    () => {
      teamsMock.mockReturnValue(
        idleQuery({
          isError: true,
          error: {
            response: { status: 403, data: { code: "LECTURER_COURSE_FORBIDDEN" } },
          },
        })
      );

      renderView({ courseId: "course-403" });
      expect(screen.getByText(/Truy cập bị từ chối/i)).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "14/09/2026",
      description: "Man hinh giang vien la read-only, khong render bat ky mutation controls nao",
    },
    () => {
      renderView({ courseId: "course-123", initialTeamId: "team-with-project" });

      expect(screen.queryByText(/Tạo Task/i)).toBeNull();
      expect(screen.queryByText(/Tạo Sprint/i)).toBeNull();
      expect(screen.queryByText(/Chuyển trạng thái/i)).toBeNull();
      expect(screen.queryByText(/Đồng bộ ngay/i)).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "14/09/2026",
      description: "Repository va Branch filter hien thi dong nhat theo contract canonical",
    },
    () => {
      branchesMock.mockReturnValue(
        idleQuery({
          isSuccess: true,
          data: {
            branches: [
              { name: "main", isDefault: true },
              { name: "feat/neo4j", isDefault: false },
            ],
          },
        })
      );
      integrationsMock.mockReturnValue(
        idleQuery({
          isSuccess: true,
          data: {
            jira: null,
            github: { repositories: [{ id: "repo-1", fullName: "org/repo" }] },
          },
        })
      );

      renderView({ courseId: "course-123", initialTeamId: "team-with-project" });
      expect(screen.getByText("Repository")).toBeTruthy();
      expect(screen.getByText("Branch")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "15/09/2026",
      description: "Tab Neo4j Graph hien thi 4 che do va truyen dung projectId tu team duoc chon",
    },
    () => {
      renderView({
        courseId: "course-123",
        initialTeamId: "team-with-project",
        initialViewMode: "GRAPH",
      });

      expect(screen.getByText("Tổng quan nhóm")).toBeTruthy();
      expect(screen.getByText("Tiến độ Sprint")).toBeTruthy();
      expect(screen.getByText("Minh chứng đóng góp")).toBeTruthy();

      expect(graphQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          graphType: "OVERVIEW",
        })
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "N",
      executedDate: "15/09/2026",
      description: "Chuyen sang che do Hoat dong Sprint tu dong chon Sprint active va goi graph query",
    },
    () => {
      renderView({
        courseId: "course-123",
        initialTeamId: "team-with-project",
        initialViewMode: "GRAPH",
      });

      const activityTab = screen.getByText("Tiến độ Sprint");
      fireEvent.click(activityTab);

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
      id: "UTCID11",
      type: "N",
      executedDate: "17/09/2026",
      description: "Neo4j Graph drill-down dung StudentProfile UUID, khong gui studentCode SE1701",
    },
    async () => {
      const user = userEvent.setup();
      renderView({
        courseId: "course-123",
        initialTeamId: "team-with-project",
        initialViewMode: "GRAPH",
      });

      expect(graphQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          graphType: "OVERVIEW",
          sprintId: null,
          subgraphParams: { nodeTypes: ["STUDENT"] },
        })
      );

      await user.click(screen.getByRole("button", { name: /Tất cả thành viên/ }));
      await user.click(screen.getAllByText("Nguyen Van A")[0]);

      expect(graphQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "proj-1",
          graphType: "CONTRIBUTION",
          studentProfileId: "80ffd344-5190-4373-a2fb-10e74d64e55d",
        })
      );
      expect(graphQueryMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ studentProfileId: "SE1701" })
      );
      expect(graphQueryMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ studentId: "SE1701" })
      );
    }
  );
});
