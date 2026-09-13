"use client";

import {
  FolderGit2Icon,
  GitBranchIcon,
  SearchIcon,
  UserIcon,
  XIcon,
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
    <div className="p-3 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-xs shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full sm:w-64">
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

          <div className="w-full sm:w-48">
            <CustomSelect
              value={selectedBranchName}
              onChange={onSelectBranch}
              options={branches.map((b) => ({
                value: b.name,
                label: b.name,
                subLabel: b.isDefault ? "(mặc định)" : undefined,
                icon: <GitBranchIcon className="w-3.5 h-3.5 text-purple-500" />,
              }))}
            />
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm Jira key (SAGA-xx), commit hash, message..."
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

        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleOnlyMyCommits}
            className={`h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border transition-all ${onlyMyCommits
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground"
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
