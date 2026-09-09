"use client";

import { useState, useMemo } from "react";
import {
  GitCommitIcon,
  FolderGit2Icon,
  ExternalLinkIcon,
  RotateCwIcon,
  AlertCircleIcon,
} from "lucide-react";
import type { CommitStats, CommitItem } from "../types/commits";
import { CommitStatsCards } from "./commit-stats-cards";
import { CommitFilterBar } from "./commit-filter-bar";
import { CommitListTimeline } from "./commit-list-timeline";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { useStudentCourses, useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { useProjectCommits } from "@/features/student/project/hooks/useProjectSync";
import {
  mapProjectCommitToCommitItem,
  extractReposAndBranches,
} from "../lib/commit-mapper";

export function CommitsView() {
  const { user: authUser, selectedCourse } = useAuthStore();
  const { data: apiCourses = [] } = useStudentCourses({
    enabled: authUser?.role === "STUDENT" && !selectedCourse,
  });
  const effectiveCourse = selectedCourse || apiCourses[0];
  const courseId = effectiveCourse?.courseId || (effectiveCourse as unknown as { id?: string })?.id || "";

  const { data: team } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const projectId = team?.projectId || effectiveCourse?.projectId || "";

  const {
    data: rawCommits = [],
    isLoading: isLoadingCommits,
    isRefetching: isRefetchingCommits,
    refetch: refetchCommits,
  } = useProjectCommits(projectId, { enabled: Boolean(projectId) });

  const currentUserStudentCode = authUser?.studentCode ?? "";

  const teamMembers = useMemo(
    () =>
      (team?.members || []).map((m) => ({
        id: m.studentCode,
        studentCode: m.studentCode,
        fullName: m.fullName,
        name: m.fullName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.fullName || m.studentCode)}`,
      })),
    [team?.members]
  );

  const allCommits: CommitItem[] = useMemo(() => {
    return rawCommits.map((c) => mapProjectCommitToCommitItem(c, teamMembers));
  }, [rawCommits, teamMembers]);

  const { repositories, branches: repoBranchesMap } = useMemo(() => {
    const res = extractReposAndBranches(rawCommits);
    if (res.repositories.length === 0) {
      return {
        repositories: [
          {
            id: "all",
            name: "Tất cả Repository",
            fullPath: "Tất cả Repositories",
            isDefault: true,
            totalCommits: 0,
            activeBranchesCount: 0,
            defaultBranch: "main",
          },
        ],
        branches: {
          "Tất cả Repository": [{ name: "main", isDefault: true, commitCount: 0, lastCommitDate: "" }],
        },
      };
    }
    return res;
  }, [rawCommits]);

  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const selectedRepo = repositories.find((r) => r.id === selectedRepoId) || repositories[0];

  const currentRepoBranches = useMemo(() => {
    return repoBranchesMap[selectedRepo.name] || [
      { name: "main", isDefault: true, commitCount: 0, lastCommitDate: "" },
    ];
  }, [repoBranchesMap, selectedRepo.name]);

  const [selectedBranchName, setSelectedBranchName] = useState<string>("main");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyMyCommits, setOnlyMyCommits] = useState<boolean>(false);

  const handleSelectRepo = (repoId: string) => {
    setSelectedRepoId(repoId);
    const targetRepo = repositories.find((r) => r.id === repoId);
    if (targetRepo) {
      const branches = repoBranchesMap[targetRepo.name];
      if (branches && branches.length > 0) {
        setSelectedBranchName(branches[0].name);
      }
    }
  };

  const filteredCommits = useMemo(() => {
    return allCommits.filter((commit) => {
      if (repositories.length > 1 && selectedRepo.id !== "all" && commit.repoName !== selectedRepo.name) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMessage = commit.message.toLowerCase().includes(q);
        const matchHash = commit.shortHash.toLowerCase().includes(q) || commit.hash.toLowerCase().includes(q);
        const matchAuthor =
          commit.author.name.toLowerCase().includes(q) || commit.author.studentCode.toLowerCase().includes(q);
        const matchJira = commit.jiraKey?.toLowerCase().includes(q);
        if (!matchMessage && !matchHash && !matchAuthor && !matchJira) return false;
      }
      if (onlyMyCommits && currentUserStudentCode && commit.author.studentCode !== currentUserStudentCode) {
        return false;
      }
      return true;
    });
  }, [allCommits, repositories.length, selectedRepo.id, selectedRepo.name, searchQuery, onlyMyCommits, currentUserStudentCode]);

  const stats: CommitStats = useMemo(() => {
    const totalCommits = filteredCommits.length;
    const totalAdditions = filteredCommits.reduce((sum, c) => sum + c.additions, 0);
    const totalDeletions = filteredCommits.reduce((sum, c) => sum + c.deletions, 0);
    return {
      totalCommits,
      totalAdditions,
      totalDeletions,
      netLines: totalAdditions - totalDeletions,
      activeBranches: currentRepoBranches.length,
      lastSyncedAt: rawCommits.length > 0 ? "Vừa cập nhật" : "Chưa có dữ liệu",
    };
  }, [filteredCommits, currentRepoBranches.length, rawCommits.length]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs font-bold">
            <GitCommitIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Lịch Sử Git Commits (GitHub)
            </h1>
            <p className="text-xs text-muted-foreground">
              Nhật ký commits thực tế được chiếu tự động từ GitHub Repositories của dự án.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetchCommits()}
            disabled={isLoadingCommits || isRefetchingCommits}
            className="h-9 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer shadow-2xs border-border"
          >
            <RotateCwIcon className={`w-3.5 h-3.5 ${isRefetchingCommits ? "animate-spin text-primary" : ""}`} />
            <span>Làm mới</span>
          </Button>

          {selectedRepo.fullPath && !selectedRepo.fullPath.includes("Chưa kết nối") && (
            <a href={`https://github.com/${selectedRepo.fullPath}`} target="_blank" rel="noreferrer">
              <Button type="button" variant="outline" size="sm" className="h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border-border">
                <FolderGit2Icon className="w-4 h-4 text-primary" />
                <span>Mở GitHub</span>
                <ExternalLinkIcon className="w-3.5 h-3.5 text-muted-foreground ml-1" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {isLoadingCommits && (
        <div className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
          <RotateCwIcon className="w-4 h-4 animate-spin" />
          <span>Đang tải danh sách GitHub commits từ máy chủ...</span>
        </div>
      )}

      {!isLoadingCommits && !projectId && (
        <div className="p-6 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Chưa xác định dự án nhóm</p>
          <p className="text-xs text-muted-foreground">Vui lòng vào menu Dự án để khởi tạo hoặc kiểm tra quyền phân nhóm.</p>
        </div>
      )}

      <CommitStatsCards stats={stats} selectedRepoName={selectedRepo.fullPath} selectedBranchName={selectedBranchName} />

      <CommitFilterBar
        repositories={repositories}
        selectedRepoId={selectedRepo.id}
        onSelectRepo={handleSelectRepo}
        branches={currentRepoBranches}
        selectedBranchName={selectedBranchName}
        onSelectBranch={setSelectedBranchName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyMyCommits={onlyMyCommits}
        onToggleOnlyMyCommits={() => setOnlyMyCommits((prev) => !prev)}
      />

      <CommitListTimeline commits={filteredCommits} selectedRepoName={selectedRepo.fullPath} selectedBranchName={selectedBranchName} />
    </div>
  );
}
