import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { fptTest } from "@/testing/fpt-test-helper";
import { CommitFilterBar } from "@/features/student/commits/components/commit-filter-bar";
import type { Repository, Branch } from "@/features/student/commits/types/commits";
import type { CommitTeamMember } from "@/features/student/commits/lib/commit-mapper";

describe("CommitFilterBar - Team Member Filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRepositories: Repository[] = [
    {
      id: "repo-1",
      name: "saga-fe",
      fullPath: "Saga-Team/saga-fe",
      isDefault: true,
      totalCommits: 25,
      activeBranchesCount: 2,
      defaultBranch: "main",
    },
  ];

  const mockBranches: Branch[] = [
    { name: "main", isDefault: true, commitCount: 15, lastCommitDate: "" },
    { name: "develop", isDefault: false, commitCount: 10, lastCommitDate: "" },
  ];

  const VALID_PROFILE_ID_1 = "80ffd344-5190-4373-a2fb-10e74d64e55d";
  const VALID_PROFILE_ID_2 = "91aae455-6201-4484-b3ac-21e85e75f66e";

  const mockMembers: CommitTeamMember[] = [
    {
      id: "mem-1",
      studentProfileId: VALID_PROFILE_ID_1,
      studentCode: "SE170504",
      fullName: "Lê Hồng Phúc",
      name: "Lê Hồng Phúc",
    },
    {
      id: "mem-2",
      studentProfileId: VALID_PROFILE_ID_2,
      studentCode: "SE172095",
      fullName: "Huỳnh Phước Thiện",
      name: "Huỳnh Phước Thiện",
    },
  ];

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "02/10/2026",
      description: "Hien thi bo loc thanh vien nhom voi gia tri mac dinh la Tat ca thanh vien",
    },
    () => {
      render(
        <CommitFilterBar
          repositories={mockRepositories}
          selectedRepoId="repo-1"
          onSelectRepo={vi.fn()}
          branches={mockBranches}
          selectedBranchName="all"
          onSelectBranch={vi.fn()}
          members={mockMembers}
          selectedAuthorId="all"
          onSelectAuthor={vi.fn()}
          searchQuery=""
          onSearchChange={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: /Tất cả thành viên/i })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "02/10/2026",
      description: "Khi click chon mot thanh vien, kich hoat callback onSelectAuthor voi studentProfileId",
    },
    () => {
      const onSelectAuthorMock = vi.fn();
      render(
        <CommitFilterBar
          repositories={mockRepositories}
          selectedRepoId="repo-1"
          onSelectRepo={vi.fn()}
          branches={mockBranches}
          selectedBranchName="all"
          onSelectBranch={vi.fn()}
          members={mockMembers}
          selectedAuthorId="all"
          onSelectAuthor={onSelectAuthorMock}
          searchQuery=""
          onSearchChange={vi.fn()}
        />
      );

      const authorButton = screen.getByRole("button", { name: /Tất cả thành viên/i });
      fireEvent.click(authorButton);

      const memberOption = screen.getByText(/Huỳnh Phước Thiện/i);
      expect(memberOption).toBeInTheDocument();
      fireEvent.click(memberOption);

      expect(onSelectAuthorMock).toHaveBeenCalledWith(VALID_PROFILE_ID_2);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "02/10/2026",
      description: "Xu ly bien khi danh sach thanh vien rong (members = []), khong gay loi crash",
    },
    () => {
      render(
        <CommitFilterBar
          repositories={mockRepositories}
          selectedRepoId="repo-1"
          onSelectRepo={vi.fn()}
          branches={mockBranches}
          selectedBranchName="all"
          onSelectBranch={vi.fn()}
          members={[]}
          selectedAuthorId="all"
          onSelectAuthor={vi.fn()}
          searchQuery=""
          onSearchChange={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: /Tất cả thành viên/i })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "02/10/2026",
      description: "Hien thi ten thanh vien da chon tren nut dropdown khi selectedAuthorId la studentProfileId",
    },
    () => {
      render(
        <CommitFilterBar
          repositories={mockRepositories}
          selectedRepoId="repo-1"
          onSelectRepo={vi.fn()}
          branches={mockBranches}
          selectedBranchName="all"
          onSelectBranch={vi.fn()}
          members={mockMembers}
          selectedAuthorId={VALID_PROFILE_ID_1}
          onSelectAuthor={vi.fn()}
          searchQuery=""
          onSearchChange={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: /Lê Hồng Phúc/i })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "02/10/2026",
      description: "Render avatar hinh anh hoac initials cho tung thanh vien trong options cua dropdown",
    },
    () => {
      const membersWithAvatar: CommitTeamMember[] = [
        {
          id: "mem-1",
          studentProfileId: VALID_PROFILE_ID_1,
          studentCode: "SE170504",
          fullName: "Lê Hồng Phúc",
          avatarUrl: "https://github.com/phuc.png",
        },
        {
          id: "mem-2",
          studentProfileId: VALID_PROFILE_ID_2,
          studentCode: "SE172095",
          fullName: "Huỳnh Phước Thiện",
          avatarUrl: null,
        },
      ];

      render(
        <CommitFilterBar
          repositories={mockRepositories}
          selectedRepoId="repo-1"
          onSelectRepo={vi.fn()}
          branches={mockBranches}
          selectedBranchName="all"
          onSelectBranch={vi.fn()}
          members={membersWithAvatar}
          selectedAuthorId="all"
          onSelectAuthor={vi.fn()}
          searchQuery=""
          onSearchChange={vi.fn()}
        />
      );

      const authorButton = screen.getByRole("button", { name: /Tất cả thành viên/i });
      fireEvent.click(authorButton);

      // Thành viên 2 không có avatarUrl -> initials "HT" hiển thị trong AvatarFallback
      expect(screen.getByText("HT")).toBeInTheDocument();
    }
  );
});
