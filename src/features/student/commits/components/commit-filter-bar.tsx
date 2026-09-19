"use client";

import {
  FolderGit2Icon,
  GitBranchIcon,
  SearchIcon,
  XIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
} from "lucide-react";
import type { Repository, Branch } from "../types/commits";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";

export type CommitMergeFilter = "all" | "exclude_merge" | "only_merge";

interface CommitFilterBarProps {
  repositories: Repository[];
  selectedRepoId: string;
  onSelectRepo: (repoId: string) => void;
  branches: Branch[];
  selectedBranchName: string;
  onSelectBranch: (branchName: string) => void;
  mergeFilter?: CommitMergeFilter;
  onMergeFilterChange?: (filter: CommitMergeFilter) => void;
  mergeCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function CommitFilterBar({
  repositories,
  selectedRepoId,
  onSelectRepo,
  branches,
  selectedBranchName,
  onSelectBranch,
  mergeFilter = "all",
  onMergeFilterChange,
  mergeCount = 0,
  searchQuery,
  onSearchChange,
}: CommitFilterBarProps) {
  return (
    <div className="relative z-30 p-3 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-xs shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative z-40 w-full md:w-60">
          <CustomSelect
            value={selectedRepoId}
            onChange={onSelectRepo}
            options={repositories.map((repo) => ({
              value: repo.id,
              label: repo.fullPath,
              icon: <FolderGit2Icon className="w-3.5 h-3.5 text-blue-500" />,
            }))}
          />
        </div>

        <div className="relative z-40 w-full md:w-52">
          <CustomSelect
            value={selectedBranchName}
            onChange={onSelectBranch}
            options={[
              {
                value: "all",
                label: "Tất cả các nhánh",
                subLabel: branches.length > 0 ? `(${branches.length} nhánh)` : undefined,
                icon: <GitBranchIcon className="w-3.5 h-3.5 text-muted-foreground" />,
              },
              ...branches.map((b) => ({
                value: b.name,
                label: b.name,
                subLabel: b.isDefault ? "(mặc định)" : undefined,
                icon: <GitBranchIcon className="w-3.5 h-3.5 text-purple-500" />,
              })),
            ]}
          />
        </div>

        {onMergeFilterChange && (
          <div className="relative z-40 w-full md:w-56">
            <CustomSelect
              value={mergeFilter}
              onChange={(val) => onMergeFilterChange(val as CommitMergeFilter)}
              options={[
                {
                  value: "all",
                  label: "Tất cả commit",
                  subLabel: mergeCount > 0 ? `(${mergeCount} merge)` : undefined,
                  icon: <GitCommitIcon className="w-3.5 h-3.5 text-blue-500" />,
                },
                {
                  value: "exclude_merge",
                  label: "Loại bỏ commit Merge",
                  subLabel: "Chỉ commit code",
                  icon: <GitPullRequestIcon className="w-3.5 h-3.5 text-emerald-500" />,
                },
                {
                  value: "only_merge",
                  label: "Chỉ commit Merge",
                  subLabel: "Gộp nhánh PR",
                  icon: <GitMergeIcon className="w-3.5 h-3.5 text-purple-500" />,
                },
              ]}
            />
          </div>
        )}

        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm Jira key (SAGA-xx), commit hash, message, tác giả..."
            className="pl-8.5 pr-8 h-9 text-xs rounded-xl bg-card border-border/80 font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

