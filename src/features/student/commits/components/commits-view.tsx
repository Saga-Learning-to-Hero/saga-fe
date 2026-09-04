"use client";

import { useState, useMemo } from "react";
import {
  GitCommitIcon,
  FolderGit2Icon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  MOCK_REPOSITORIES,
  MOCK_BRANCHES,
  MOCK_COMMITS,
} from "../data/mock-commits-data";
import type { CommitStats } from "../types/commits";
import { CommitStatsCards } from "./commit-stats-cards";
import { CommitFilterBar } from "./commit-filter-bar";
import { CommitListTimeline } from "./commit-list-timeline";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";

export function CommitsView() {
  const authUser = useAuthStore((state) => state.user);
  const currentUserStudentCode = authUser?.studentCode || "HE170504";

  // Filter States
  const [selectedRepoId, setSelectedRepoId] = useState<string>("repo-01");
  const selectedRepo = MOCK_REPOSITORIES.find((r) => r.id === selectedRepoId) || MOCK_REPOSITORIES[0];

  const currentRepoBranches = useMemo(() => {
    return MOCK_BRANCHES[selectedRepo.name] || [
      { name: "main", isDefault: true, commitCount: 10, lastCommitDate: "2026-08-28T10:00:00Z" },
    ];
  }, [selectedRepo.name]);

  const [selectedBranchName, setSelectedBranchName] = useState<string>("develop");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyMyCommits, setOnlyMyCommits] = useState<boolean>(false);

  // Switch repo handler (auto reset branch to main/develop)
  const handleSelectRepo = (repoId: string) => {
    setSelectedRepoId(repoId);
    const targetRepo = MOCK_REPOSITORIES.find((r) => r.id === repoId);
    if (targetRepo) {
      const repoBranches = MOCK_BRANCHES[targetRepo.name];
      if (repoBranches && repoBranches.length > 0) {
        setSelectedBranchName(repoBranches[0].name);
      }
    }
  };

  // Filter Commits
  const filteredCommits = useMemo(() => {
    return MOCK_COMMITS.filter((commit) => {
      // Filter by Repo
      if (commit.repoName !== selectedRepo.name) {
        return false;
      }
      // Filter by Branch
      if (selectedBranchName && commit.branchName !== selectedBranchName) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMessage = commit.message.toLowerCase().includes(q);
        const matchHash = commit.shortHash.toLowerCase().includes(q) || commit.hash.toLowerCase().includes(q);
        const matchAuthor = commit.author.name.toLowerCase().includes(q) || commit.author.studentCode.toLowerCase().includes(q);
        const matchJira = commit.jiraKey?.toLowerCase().includes(q);

        if (!matchMessage && !matchHash && !matchAuthor && !matchJira) {
          return false;
        }
      }
      // Filter by Only My Commits
      if (onlyMyCommits && commit.author.studentCode !== currentUserStudentCode) {
        return false;
      }

      return true;
    });
  }, [selectedRepo.name, selectedBranchName, searchQuery, onlyMyCommits, currentUserStudentCode]);

  // Dynamic Stats
  const stats: CommitStats = useMemo(() => {
    const totalCommits = filteredCommits.length;
    const totalAdditions = filteredCommits.reduce((sum, c) => sum + c.additions, 0);
    const totalDeletions = filteredCommits.reduce((sum, c) => sum + c.deletions, 0);
    const netLines = totalAdditions - totalDeletions;

    return {
      totalCommits,
      totalAdditions,
      totalDeletions,
      netLines,
      activeBranches: currentRepoBranches.length,
      lastSyncedAt: "3 phút trước",
    };
  }, [filteredCommits, currentRepoBranches.length]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs font-bold">
            <GitCommitIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Lịch Sử Git Commits (GitHub)
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Theo dõi lịch sử commit, phân tích theo Repository & Branch đã kết nối với GitHub.
            </p>
          </div>
        </div>

        {/* GitHub Link Button */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://github.com/${selectedRepo.fullPath}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border-border"
            >
              <FolderGit2Icon className="w-4 h-4 text-primary" />
              <span>Mở trên GitHub</span>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-muted-foreground ml-1" />
            </Button>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <CommitStatsCards
        stats={stats}
        selectedRepoName={selectedRepo.fullPath}
        selectedBranchName={selectedBranchName}
      />

      {/* Filter Bar (Dropdown Repo & Branch) */}
      <CommitFilterBar
        repositories={MOCK_REPOSITORIES}
        selectedRepoId={selectedRepoId}
        onSelectRepo={handleSelectRepo}
        branches={currentRepoBranches}
        selectedBranchName={selectedBranchName}
        onSelectBranch={setSelectedBranchName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyMyCommits={onlyMyCommits}
        onToggleOnlyMyCommits={() => setOnlyMyCommits((prev) => !prev)}
      />

      {/* Timeline Commits List */}
      <CommitListTimeline
        commits={filteredCommits}
        selectedRepoName={selectedRepo.fullPath}
        selectedBranchName={selectedBranchName}
      />
    </div>
  );
}
