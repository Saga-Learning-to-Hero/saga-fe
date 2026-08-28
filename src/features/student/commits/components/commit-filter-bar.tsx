"use client";

import {
  FolderGit2Icon,
  GitBranchIcon,
  SearchIcon,
  UserIcon,
  ChevronDownIcon,
  FilterIcon,
} from "lucide-react";
import type { Repository, Branch } from "../types/commits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
          <div className="space-y-1 min-w-[220px]">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <FolderGit2Icon className="w-3.5 h-3.5 text-blue-500" />
              Repository (Kho chứa):
            </label>
            <div className="relative">
              <select
                value={selectedRepoId}
                onChange={(e) => onSelectRepo(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs font-bold rounded-xl bg-card border border-border/80 focus:outline-hidden focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.fullPath}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Dropdown 2: Select Branch */}
          <div className="space-y-1 min-w-[200px]">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <GitBranchIcon className="w-3.5 h-3.5 text-purple-500" />
              Nhánh (Branch):
            </label>
            <div className="relative">
              <select
                value={selectedBranchName}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs font-bold rounded-xl bg-card border border-border/80 focus:outline-hidden focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} {b.isDefault ? "(default)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
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
            className={`h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border transition-all ${
              onlyMyCommits
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
