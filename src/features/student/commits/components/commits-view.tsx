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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import {
  useProjectCommits,
  useProjectRepositoryBranches,
  useProjectSyncStatus,
  useSyncProject,
} from "@/features/student/project/hooks/useProjectSync";
import { useProjectIntegrations } from "@/features/student/project/hooks/useProjectIntegrations";
import { useProjectRealtime } from "@/features/student/project/hooks/use-project-realtime";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatVietnamDateTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  mapProjectCommitToCommitItem,
  extractReposAndBranches,
} from "../lib/commit-mapper";

export function CommitsView() {
  const {
    course: effectiveCourse,
    courseId,
    isLoading: isCoursesLoading,
    isInvalidCourse,
  } = useStudentCourseContext();
  const courseCode = effectiveCourse?.code || "";

  const { data: team } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const projectId = team?.projectId || effectiveCourse?.projectId || "";

  const { data: integrations, refetch: refetchIntegrations } = useProjectIntegrations(projectId, {
    enabled: Boolean(projectId),
  });

  useProjectRealtime(projectId, {
    enabled: Boolean(projectId && integrations?.github?.status === "ACTIVE"),
  });

  const {
    data: commitsPage,
    isLoading: isLoadingCommits,
    isError: isCommitsError,
    error: commitsError,
    isRefetching: isRefetchingCommits,
    refetch: refetchCommits,
  } = useProjectCommits(projectId, { enabled: Boolean(projectId) });

  const rawCommits = useMemo(() => commitsPage?.items ?? [], [commitsPage?.items]);

  const {
    data: syncStatuses = [],
    refetch: refetchSyncStatuses,
  } = useProjectSyncStatus(projectId, { enabled: Boolean(projectId) });
  const syncProjectMutation = useSyncProject();

  const githubSyncStatus = useMemo(() => {
    return syncStatuses
      .filter((status) => (status.provider || "").toUpperCase() === "GITHUB")
      .sort(
        (left, right) =>
          new Date(right.completedAt || right.startedAt || 0).getTime() -
          new Date(left.completedAt || left.startedAt || 0).getTime()
      )[0];
  }, [syncStatuses]);

  const hasActiveSync = useMemo(
    () =>
      syncStatuses.some((status) =>
        ["ENQUEUED", "IN_PROGRESS", "RUNNING", "SYNCING"].includes(
          (status.status || "").toUpperCase()
        )
      ),
    [syncStatuses]
  );
  const isGitHubSyncFailed = (githubSyncStatus?.status || "").toUpperCase() === "FAILED";
  const lastGitHubSyncedAt = githubSyncStatus?.completedAt || null;

  const teamMembers = useMemo(
    () =>
      (team?.members || []).map((m) => ({
        id: m.studentCode,
        studentCode: m.studentCode,
        fullName: m.fullName,
        name: m.fullName,
        avatar: m.avatar || "",
      })),
    [team?.members]
  );

  const allCommits: CommitItem[] = useMemo(() => {
    return rawCommits.map((c) => mapProjectCommitToCommitItem(c, teamMembers));
  }, [rawCommits, teamMembers]);

  const { repositories, branches: repoBranchesMap } = useMemo(() => {
    const res = extractReposAndBranches(rawCommits);
    const activeIntegrationRepos = integrations?.github?.repositories || [];

    const repoList = [...res.repositories];
    activeIntegrationRepos.forEach((ar) => {
      const existing = repoList.find(
        (r) => r.id === ar.id || r.fullPath.toLowerCase() === ar.fullName.toLowerCase()
      );
      if (existing) {
        existing.id = ar.id;
        existing.fullPath = ar.fullName;
        existing.name = ar.fullName.split("/").pop() || ar.fullName;
      } else {
        repoList.push({
          id: ar.id,
          name: ar.fullName.split("/").pop() || ar.fullName,
          fullPath: ar.fullName,
          isDefault: repoList.length === 0,
          totalCommits: 0,
          activeBranchesCount: 1,
          defaultBranch: "main",
        });
      }
    });

    if (repoList.length === 0) {
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
    return { repositories: repoList, branches: res.branches };
  }, [rawCommits, integrations?.github?.repositories]);

  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const selectedRepo =
    repositories.find((r) => r.id === selectedRepoId) || repositories[0];
  const selectedRepoFullPath = selectedRepo?.fullPath || "";

  const activeRepoId =
    selectedRepo && selectedRepo.id !== "all" ? selectedRepo.id : null;

  const {
    data: liveBranchesData,
    isLoading: isLoadingBranches,
    isRefetching: isRefetchingBranches,
    refetch: refetchBranches,
  } = useProjectRepositoryBranches(projectId, activeRepoId, {
    enabled: Boolean(projectId && activeRepoId),
  });

  const liveBranches = liveBranchesData?.branches;

  const currentRepoBranches = useMemo(() => {
    if (liveBranches && liveBranches.length > 0) {
      return liveBranches.map((b) => ({
        name: b.name,
        isDefault: b.isDefault,
        commitCount: allCommits.filter((c) => c.branchName === b.name).length,
        lastCommitDate: "",
      }));
    }
    return (
      repoBranchesMap[selectedRepo.name] || [
        { name: "main", isDefault: true, commitCount: 0, lastCommitDate: "" },
      ]
    );
  }, [liveBranches, allCommits, repoBranchesMap, selectedRepo.name]);

  const [selectedBranchName, setSelectedBranchName] = useState<string>("all");
  const effectiveSelectedBranchName =
    selectedBranchName === "all" ||
      currentRepoBranches.some((branch) => branch.name === selectedBranchName)
      ? selectedBranchName
      : "all";
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSelectRepo = (repoId: string) => {
    setSelectedRepoId(repoId);
    setSelectedBranchName("all");
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchCommits(),
      refetchBranches(),
      refetchSyncStatuses(),
      refetchIntegrations(),
    ]);
  };

  const handleSync = async () => {
    if (!projectId) return;

    try {
      const result = await syncProjectMutation.mutateAsync(projectId);
      toast.info("Đã gửi yêu cầu đồng bộ Jira & GitHub.", {
        description: `Hàng đợi: Jira [${result.jira}], GitHub [${result.github}]. Dữ liệu sẽ tự cập nhật khi hoàn tất.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể kích hoạt đồng bộ dự án.");
    }
  };

  const filteredCommits = useMemo(() => {
    return allCommits.filter((commit) => {
      if (
        repositories.length > 1 &&
        selectedRepo.id !== "all" &&
        commit.repoName !== selectedRepo.name &&
        commit.repoName !== selectedRepo.fullPath
      ) {
        return false;
      }
      if (
        effectiveSelectedBranchName !== "all" &&
        commit.branchName !== effectiveSelectedBranchName
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMessage = commit.message.toLowerCase().includes(q);
        const matchHash =
          commit.shortHash.toLowerCase().includes(q) ||
          commit.hash.toLowerCase().includes(q);
        const matchAuthor =
          commit.author.name.toLowerCase().includes(q) ||
          commit.author.studentCode.toLowerCase().includes(q);
        const matchJira = commit.jiraKey?.toLowerCase().includes(q);
        if (!matchMessage && !matchHash && !matchAuthor && !matchJira) return false;
      }
      return true;
    });
  }, [
    allCommits,
    repositories.length,
    selectedRepo.id,
    selectedRepo.name,
    selectedRepo.fullPath,
    effectiveSelectedBranchName,
    searchQuery,
  ]);

  const liveBranchCount = liveBranchesData?.branchCount;

  const stats: CommitStats = useMemo(() => {
    const totalCommits = filteredCommits.length;
    const hasDiffStats = filteredCommits.some(
      (commit) => commit.additions !== null && commit.deletions !== null
    );
    const totalAdditions = hasDiffStats
      ? filteredCommits.reduce((sum, commit) => sum + (commit.additions || 0), 0)
      : null;
    const totalDeletions = hasDiffStats
      ? filteredCommits.reduce((sum, commit) => sum + (commit.deletions || 0), 0)
      : null;
    const activeBranchesCount =
      liveBranchCount ?? currentRepoBranches.length;

    return {
      totalCommits,
      totalAdditions,
      totalDeletions,
      netLines:
        totalAdditions !== null && totalDeletions !== null
          ? totalAdditions - totalDeletions
          : null,
      activeBranches: activeBranchesCount,
      lastSyncedAt: lastGitHubSyncedAt
        ? formatVietnamDateTime(lastGitHubSyncedAt)
        : "Chưa có lượt đồng bộ",
    };
  }, [
    filteredCommits,
    liveBranchCount,
    currentRepoBranches.length,
    lastGitHubSyncedAt,
  ]);

  const githubRepositoryUrl = useMemo(() => {
    const repositoryFullName = selectedRepoFullPath.trim();
    return repositoryFullName && /^[\w.-]+\/[\w.-]+$/.test(repositoryFullName)
      ? `https://github.com/${repositoryFullName}`
      : null;
  }, [selectedRepoFullPath]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-card/60 p-4 rounded-3xl border border-border/70 backdrop-blur-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:from-slate-100 dark:to-slate-200 dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs font-bold">
            <GitCommitIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Nhật Ký Git Commits
              </h1>
              {courseCode && (
                <Badge variant="outline" className="font-mono text-[11px] font-bold border-primary/30 bg-primary/10 text-primary">
                  {courseCode}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Nhật ký commits được đồng bộ tự động từ GitHub Repositories của dự án
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSync()}
            disabled={!projectId || syncProjectMutation.isPending || hasActiveSync}
            className="h-8.5 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs bg-blue-600 text-white hover:bg-blue-700"
          >
            <RotateCwIcon className={`w-3.5 h-3.5 ${syncProjectMutation.isPending || hasActiveSync ? "animate-spin" : ""}`} />
            <span>
              {syncProjectMutation.isPending
                ? "Đang gửi..."
                : hasActiveSync
                  ? "Đang đồng bộ..."
                  : "Đồng bộ Jira & GitHub"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isLoadingCommits || isRefetchingCommits || isRefetchingBranches || isLoadingBranches}
            className="h-8.5 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border-border hover:bg-muted"
          >
            <RotateCwIcon className={`w-3.5 h-3.5 ${isRefetchingCommits || isRefetchingBranches ? "animate-spin text-primary" : ""}`} />
            <span>Tải lại</span>
          </Button>

          {githubRepositoryUrl && (
            <a href={githubRepositoryUrl} target="_blank" rel="noreferrer">
              <Button type="button" variant="outline" size="sm" className="h-8.5 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border-border hover:bg-muted">
                <FolderGit2Icon className="w-3.5 h-3.5 text-primary" />
                <span>Mở GitHub</span>
                <ExternalLinkIcon className="w-3 h-3 text-muted-foreground ml-0.5" />
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

      {isCoursesLoading && (
        <div className="h-36 animate-pulse rounded-2xl bg-muted/60" />
      )}

      {isInvalidCourse && (
        <div className="p-6 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Lớp học phần không còn khả dụng</p>
          <p className="text-xs text-muted-foreground">Hãy chọn lại lớp học phần trước khi xem lịch sử commit.</p>
        </div>
      )}

      {!isCoursesLoading && !isInvalidCourse && !isLoadingCommits && !projectId && (
        <div className="p-6 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Chưa xác định dự án nhóm</p>
          <p className="text-xs text-muted-foreground">Vui lòng vào menu Dự án để khởi tạo hoặc kiểm tra quyền phân nhóm.</p>
        </div>
      )}

      {!isLoadingCommits && Boolean(projectId) && isCommitsError && (
        <div className="p-6 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 text-center space-y-3">
          <AlertCircleIcon className="w-6 h-6 text-destructive mx-auto" />
          <div>
            <p className="text-sm font-bold text-foreground">Không tải được lịch sử commit</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getApiErrorMessage(commitsError, "Vui lòng thử lại hoặc kiểm tra kết nối GitHub của dự án.")}
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetchCommits()} className="cursor-pointer text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {!isCommitsError && !isInvalidCourse && (
        <>
          <CommitStatsCards
            stats={stats}
            selectedRepoName={selectedRepo.fullPath}
            selectedBranchName={effectiveSelectedBranchName}
            githubSyncStatus={githubSyncStatus?.status}
            isGitHubSyncing={syncProjectMutation.isPending || hasActiveSync}
            isGitHubSyncFailed={isGitHubSyncFailed}
          />

          <CommitFilterBar
            repositories={repositories}
            selectedRepoId={selectedRepo.id}
            onSelectRepo={handleSelectRepo}
            branches={currentRepoBranches}
            selectedBranchName={effectiveSelectedBranchName}
            onSelectBranch={setSelectedBranchName}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <CommitListTimeline
            commits={filteredCommits}
            selectedRepoName={selectedRepo.fullPath}
            selectedBranchName={effectiveSelectedBranchName}
            courseId={courseId}
            projectId={projectId}
          />
        </>
      )}
    </div>
  );
}
