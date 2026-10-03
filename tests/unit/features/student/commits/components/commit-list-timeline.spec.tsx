import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { CommitListTimeline } from "@/features/student/commits/components/commit-list-timeline";
import type { CommitItem } from "@/features/student/commits/types/commits";

describe("CommitListTimeline Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

  const renderWithClient = (ui: React.ReactElement) => {
    const client = createTestQueryClient();
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  };

  const mockCommits: CommitItem[] = [
    {
      id: "c1",
      hash: "d46f6001234567890abcdef",
      shortHash: "d46f600",
      message: "feat: [FE][SAGA-31] Cap nhat bo loc commits",
      author: {
        name: "Lê Hồng Phúc",
        username: "phucle",
        studentCode: "SE170504",
        avatar: "",
      },
      createdAt: new Date().toISOString(),
      relativeTime: "1 giờ trước",
      repoName: "Saga-Team/saga-fe",
      branchName: "dev",
      additions: 25,
      deletions: 5,
      filesChanged: 3,
      isMerge: false,
      jiraKey: "SAGA-31",
      isSyncedToJira: true,
    },
  ];

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "03/10/2026",
      description: "Khi isLoading = true, hien thi Skeleton loader va KHONG hien thi Khong tim thay commit nao",
    },
    () => {
      renderWithClient(
        <CommitListTimeline
          commits={[]}
          selectedRepoName="saga-fe"
          selectedBranchName="dev"
          courseId="course-1"
          isLoading={true}
        />
      );

      // Phải có skeleton loading
      expect(screen.getByTestId("commit-timeline-skeleton")).toBeInTheDocument();
      // Tuyệt đối không được xuất hiện thông báo "Không tìm thấy Commit nào"
      expect(screen.queryByText(/Không tìm thấy Commit nào/i)).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "03/10/2026",
      description: "Khi isLoading = false va co commits, hien thi danh sach commit cards day du",
    },
    () => {
      renderWithClient(
        <CommitListTimeline
          commits={mockCommits}
          selectedRepoName="saga-fe"
          selectedBranchName="dev"
          courseId="course-1"
          isLoading={false}
        />
      );

      expect(screen.getByText("feat: [FE][SAGA-31] Cap nhat bo loc commits")).toBeInTheDocument();
      expect(screen.getByText("d46f600")).toBeInTheDocument();
      expect(screen.getByText("SAGA-31")).toBeInTheDocument();
      expect(screen.queryByTestId("commit-timeline-skeleton")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "03/10/2026",
      description: "Khi isLoading = false va commits rong, hien thi Empty State Khong tim thay Commit nao",
    },
    () => {
      renderWithClient(
        <CommitListTimeline
          commits={[]}
          selectedRepoName="saga-fe"
          selectedBranchName="dev"
          courseId="course-1"
          isLoading={false}
        />
      );

      expect(screen.getByText(/Không tìm thấy Commit nào/i)).toBeInTheDocument();
      expect(screen.queryByTestId("commit-timeline-skeleton")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "03/10/2026",
      description: "Khi click vao nut sao chep ma hash, hien thi phan hoi Da chep",
    },
    () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(),
        },
      });

      renderWithClient(
        <CommitListTimeline
          commits={mockCommits}
          selectedRepoName="saga-fe"
          selectedBranchName="dev"
          courseId="course-1"
          isLoading={false}
        />
      );

      const copyBtn = screen.getByTitle(/Sao chép mã hash commit/i);
      fireEvent.click(copyBtn);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("d46f600");
      expect(screen.getByText(/Đã chép/i)).toBeInTheDocument();
    }
  );
});
