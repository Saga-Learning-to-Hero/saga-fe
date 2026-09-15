"use client";

import { FolderGit2Icon, GitBranchIcon } from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import type {
  ProjectGitBranchItem,
  ProjectGitHubRepositoryItem,
  ProjectTaskCommitLinkFilter,
} from "@/features/student/project/types/student-project";

interface PipelineRepositoryFiltersProps {
  repositories: ProjectGitHubRepositoryItem[];
  branches: ProjectGitBranchItem[];
  selectedRepoId: string;
  selectedBranchName: string;
  onSelectRepository: (repoId: string) => void;
  onSelectBranch: (branchName: string) => void;
  isLoadingBranches?: boolean;
  canonicalFilter?: ProjectTaskCommitLinkFilter | null;
  compact?: boolean;
  embedded?: boolean;
  idPrefix?: string;
}

export function PipelineRepositoryFilters({
  repositories,
  branches,
  selectedRepoId,
  selectedBranchName,
  onSelectRepository,
  onSelectBranch,
  isLoadingBranches = false,
  canonicalFilter,
  compact = false,
  embedded = false,
  idPrefix = "pipeline",
}: PipelineRepositoryFiltersProps) {
  const repositoryEmpty = repositories.length === 0;
  const branchUnavailable = selectedRepoId === "ALL" || isLoadingBranches || branches.length === 0;
  const repositoryOptions: CustomSelectOption[] = [
    { value: "ALL", label: repositoryEmpty ? "Chưa có repository" : "Tất cả repository" },
    ...repositories.map((repository) => ({
      value: repository.id,
      label: repository.fullName,
      subLabel: repository.role || undefined,
      icon: <FolderGit2Icon className="size-3.5 shrink-0 text-muted-foreground" />,
    })),
  ];
  const branchOptions: CustomSelectOption[] = [
    {
      value: "ALL",
      label:
        selectedRepoId === "ALL"
          ? "Chọn Repository trước"
          : isLoadingBranches
            ? "Đang tải danh sách nhánh..."
            : branches.length === 0
              ? "Không có nhánh"
              : "Tất cả nhánh",
    },
    ...branches.map((branch) => ({
      value: branch.name,
      label: branch.name,
      subLabel: branch.isDefault ? "Nhánh mặc định" : undefined,
      icon: <GitBranchIcon className="size-3.5 shrink-0 text-muted-foreground" />,
    })),
  ];

  return (
    <div
      className={
        embedded
          ? "contents"
          : compact
            ? "flex flex-wrap items-end gap-2"
            : "grid gap-3 sm:grid-cols-2"
      }
    >
      <div className={compact ? "w-64 space-y-1.5" : "space-y-1.5"}>
        <label
          htmlFor={`${idPrefix}-repository-filter`}
          className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground"
        >
          <FolderGit2Icon className="size-3.5 text-primary" />
          Repository
        </label>
        <CustomSelect
          id={`${idPrefix}-repository-filter`}
          value={selectedRepoId}
          onChange={(repoId) => {
            onSelectRepository(repoId);
            onSelectBranch("ALL");
          }}
          options={repositoryOptions}
          disabled={repositoryEmpty}
        />
      </div>

      <div className={compact ? "w-64 space-y-1.5" : "space-y-1.5"}>
        <label
          htmlFor={`${idPrefix}-branch-filter`}
          className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground"
        >
          <GitBranchIcon className="size-3.5 text-primary" />
          Branch
        </label>
        <CustomSelect
          id={`${idPrefix}-branch-filter`}
          value={selectedBranchName}
          onChange={onSelectBranch}
          options={branchOptions}
          disabled={branchUnavailable}
        />
      </div>

      {!compact && selectedBranchName !== "ALL" ? (
        <p className="col-span-full text-[11px] text-muted-foreground">
          Liên kết được lọc theo branch membership canonical
          {canonicalFilter?.branchResolution === "REACHABLE_AT_SYNC" ? " tại lần đồng bộ gần nhất" : ""}.
        </p>
      ) : null}
    </div>
  );
}
