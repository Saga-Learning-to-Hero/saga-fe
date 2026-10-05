import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCommitsTab } from "@/features/student/sprint-progress/components/task-commits-tab";
import { useTaskCommits } from "@/features/student/project/hooks/useProjectSync";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/features/student/project/hooks/useProjectSync", () => ({
  useTaskCommits: vi.fn(),
}));

vi.mock("@/features/student/commits/components/commit-detail-modal", () => ({
  CommitDetailModal: ({
    isOpen,
    gitCommitId,
  }: {
    isOpen: boolean;
    gitCommitId?: string | null;
  }) => (isOpen ? <div data-testid="commit-detail-modal">Modal Commit: {gitCommitId}</div> : null),
}));

describe("TaskCommitsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCommits = [
    {
      id: "commit-1",
      repoId: "repo-1",
      repositoryFullName: "saga/web-app",
      sha: "c1234567890abcdef",
      message: "feat: [SAGA-200] trien khai task commits tab",
      committedAt: "2026-10-02T14:00:00Z",
      createdAt: "2026-10-02T14:00:00Z",
      isMerge: false,
    },
    {
      id: "commit-2",
      repoId: "repo-1",
      repositoryFullName: "saga/web-app",
      sha: "m9876543210fedcba",
      message: "Merge branch 'dev' into main",
      committedAt: "2026-10-02T15:00:00Z",
      createdAt: "2026-10-02T15:00:00Z",
      isMerge: true,
    },
  ];

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "03/10/2026",
      description: "Hien thi danh sach commits, khong con nut Bao gom Merge Commits, khong xin merge",
    },
    async () => {
      vi.mocked(useTaskCommits).mockReturnValue({
        data: {
          items: mockCommits,
          page: 0,
          size: 20,
          total: 2,
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useTaskCommits>);

      render(
        <TaskCommitsTab
          projectId="proj-1"
          taskId="task-1"
          issueKey="SAGA-200"
          linkedCommitCount={2}
        />
      );

      expect(screen.getByText(/Danh sách Commits liên kết \[SAGA-200\]/i)).toBeInTheDocument();
      expect(screen.getByText("2 commit")).toBeInTheDocument();
      expect(screen.getByText("c123456")).toBeInTheDocument();
      expect(screen.getByText("feat: [SAGA-200] trien khai task commits tab")).toBeInTheDocument();
      expect(screen.getByText("Merge")).toBeInTheDocument();
      expect(screen.getByText("Merge branch 'dev' into main")).toBeInTheDocument();

      // a merge commit never belongs to a task: no option to ask for merges
      expect(screen.queryByRole("button", { name: /Bao gồm Merge Commits/i })).not.toBeInTheDocument();
      expect(vi.mocked(useTaskCommits).mock.lastCall?.[2]).not.toHaveProperty("includeMerges");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "03/10/2026",
      description: "Click commit de mo modal xem chi tiet commit",
    },
    async () => {
      vi.mocked(useTaskCommits).mockReturnValue({
        data: {
          items: mockCommits,
          page: 0,
          size: 20,
          total: 2,
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useTaskCommits>);

      render(
        <TaskCommitsTab
          projectId="proj-1"
          taskId="task-1"
        />
      );

      const commitItem = screen.getByText("feat: [SAGA-200] trien khai task commits tab");
      fireEvent.click(commitItem);

      expect(screen.getByTestId("commit-detail-modal")).toHaveTextContent("Modal Commit: commit-1");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "03/10/2026",
      description: "Hien thi loi khi API lay danh sach commits that bai",
    },
    async () => {
      vi.mocked(useTaskCommits).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useTaskCommits>);

      render(
        <TaskCommitsTab
          projectId="proj-1"
          taskId="task-1"
        />
      );

      expect(
        screen.getByText("Không thể tải danh sách commits của nhiệm vụ này.")
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "03/10/2026",
      description: "Hien thi trang thai trong khi khong co commit nao",
    },
    async () => {
      vi.mocked(useTaskCommits).mockReturnValue({
        data: {
          items: [],
          page: 0,
          size: 20,
          total: 0,
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useTaskCommits>);

      render(
        <TaskCommitsTab
          projectId="proj-1"
          taskId="task-1"
        />
      );

      expect(
        screen.getByText("Chưa có commit nào được liên kết với nhiệm vụ này.")
      ).toBeInTheDocument();
    }
  );
});
