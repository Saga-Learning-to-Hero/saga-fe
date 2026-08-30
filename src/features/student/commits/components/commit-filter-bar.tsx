"use client";

import {
  FolderGit2Icon,
  GitBranchIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import type { Repository, Branch } from "../types/commits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";

interface CommitFilterBarProps {
  repositories: Repository[];
  selectedRepoId: string;
  onSelectRepo: (repoId: string) => void;
  branches: Branch[];
  selectedBranchName: string;
  onSelectBranch: (branchName: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyMyCommits: boolean;
  onToggleOnlyMyCommits: () => void;
}

export function CommitFilterBar({
  repositories,
  selectedRepoId,
  onSelectRepo,
  branches,
  selectedBranchName,
  onSelectBranch,
  searchQuery,
  onSearchChange,
  onlyMyCommits,
  onToggleOnlyMyCommits,
}: CommitFilterBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Dropdowns Group: Repo & Branch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown 1: Select Repository */}
          <div className="space-y-1 min-w-[240px]">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <FolderGit2Icon className="w-3.5 h-3.5 text-blue-500" />
              Repository (Kho chứa):
            </label>
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

          {/* Dropdown 2: Select Branch */}
          <div className="space-y-1 min-w-[220px]">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <GitBranchIcon className="w-3.5 h-3.5 text-purple-500" />
              Nhánh (Branch):
            </label>
            <CustomSelect
              value={selectedBranchName}
              onChange={onSelectBranch}
              options={branches.map((b) => ({
                value: b.name,
                label: b.name,
                subLabel: b.isDefault ? "(default)" : undefined,
                icon: <GitBranchIcon className="w-3.5 h-3.5 text-purple-500" />,
              }))}
            />
          </div>
        </div>

        {/* Right side: Search Box & My Commits Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo Jira key (SAGA-xxx), commit hash, message..."
              className="pl-8 h-9 text-xs rounded-xl bg-card border-border/80"
            />
          </div>

          {/* Toggle Filter: Only My Commits */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleOnlyMyCommits}
            className={`h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border transition-all ${onlyMyCommits
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Chỉ commit của tôi</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
