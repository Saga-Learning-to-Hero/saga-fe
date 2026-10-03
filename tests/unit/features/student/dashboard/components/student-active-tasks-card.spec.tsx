import { describe, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudentActiveTasksCard } from "@/features/student/dashboard/components/student-active-tasks-card";
import type { StudentDashboardActiveTask } from "@/features/student/dashboard/types/student-dashboard-types";
import { fptTest } from "@/testing/fpt-test-helper";

// Mock CommitDetailModal
vi.mock("@/features/student/commits/components/commit-detail-modal", () => ({
  CommitDetailModal: ({
    isOpen,
    gitCommitId,
  }: {
    isOpen: boolean;
    gitCommitId?: string | null;
  }) => (isOpen ? <div data-testid="commit-detail-modal">Modal Commit: {gitCommitId}</div> : null),
}));

describe("StudentActiveTasksCard", () => {
  const mockTasks: StudentDashboardActiveTask[] = [
    {
      id: "task-1",
      externalKey: "SAGA-101",
      title: "Thiết kế giao diện Dashboard",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 5,
      dueDate: "2026-10-15T00:00:00Z",
      linkedCommitCount: 3,
      hasAnomaly: false,
      linkedCommits: [
        {
          id: "commit-1",
          sha: "a1b2c3d4e5f6g7h8",
          message: "feat: [SAGA-101] hoàn thiện dashboard",
          repositoryFullName: "saga/web-app",
          committedAt: "2026-10-02T10:00:00Z",
          authorStudentId: "stu-1",
          authorExternalId: "ext-1",
          isMerge: false,
        },
        {
          id: "commit-2",
          sha: "b2c3d4e5f6g7h8i9",
          message: "Merge pull request #12 from branch dev",
          repositoryFullName: "saga/web-app",
          committedAt: "2026-10-02T11:00:00Z",
          authorStudentId: "stu-1",
          authorExternalId: "ext-1",
          isMerge: true,
        },
      ],
    },
    {
      id: "task-2",
      externalKey: "SAGA-102",
      title: "Viết unit test cho service",
      status: "DONE",
      linkedCommitCount: 0,
      hasAnomaly: true,
    },
  ];

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "03/10/2026",
      description: "Hien thi danh sach task va toggle mo rong commits lien ket",
    },
    async () => {
      render(
        <StudentActiveTasksCard
          tasks={mockTasks}
          courseId="course-1"
          projectId="proj-1"
        />
      );

      expect(screen.getByText("SAGA-101")).toBeInTheDocument();
      expect(screen.getByText("Thiết kế giao diện Dashboard")).toBeInTheDocument();
      expect(screen.getByText("SAGA-102")).toBeInTheDocument();
      expect(screen.getByText("0 Commit linked")).toBeInTheDocument();

      // Click button commit count de mo rong
      const commitCountBtn = screen.getByTitle(/Bấm để xem 2 commit liên kết/i);
      fireEvent.click(commitCountBtn);

      // Xem noi dung commit
      expect(screen.getByText("a1b2c3d")).toBeInTheDocument();
      expect(screen.getByText("feat: [SAGA-101] hoàn thiện dashboard")).toBeInTheDocument();
      expect(screen.getByText("Merge")).toBeInTheDocument();
      expect(screen.getByText("Merge pull request #12 from branch dev")).toBeInTheDocument();

      // Click vao commit de mo modal chi tiet
      const commitItem = screen.getByText("feat: [SAGA-101] hoàn thiện dashboard");
      fireEvent.click(commitItem);

      expect(screen.getByTestId("commit-detail-modal")).toHaveTextContent("Modal Commit: commit-1");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "03/10/2026",
      description: "Hien thi giao dien trong khi mang tasks rong",
    },
    async () => {
      render(
        <StudentActiveTasksCard
          tasks={[]}
          courseId="course-1"
          projectId="proj-1"
        />
      );

      expect(
        screen.getByText("Bạn chưa có nhiệm vụ nào được phân công trong Sprint này.")
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "03/10/2026",
      description: "Hien thi thong bao toi da 20 commit khi tong so linkedCommitCount lon hon linkedCommits",
    },
    async () => {
      const taskWithManyCommits: StudentDashboardActiveTask = {
        id: "task-many",
        externalKey: "SAGA-999",
        title: "Task nhieu commit",
        status: "IN_PROGRESS",
        linkedCommitCount: 25,
        linkedCommits: mockTasks[0].linkedCommits,
      };

      render(
        <StudentActiveTasksCard
          tasks={[taskWithManyCommits]}
          courseId="course-1"
          projectId="proj-1"
        />
      );

      const commitCountBtn = screen.getByTitle(/Bấm để xem 2 commit liên kết/i);
      fireEvent.click(commitCountBtn);

      expect(screen.getByText(/Tối đa 20 commit mới nhất/i)).toBeInTheDocument();
      expect(screen.getByText(/Commits liên kết \(2 \/ 25\)/i)).toBeInTheDocument();
    }
  );
});
