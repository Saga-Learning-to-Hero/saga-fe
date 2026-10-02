"use client";

import { getApiErrorMessage } from "@/lib/api-error";
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
import { CommitFilterBar, type CommitMergeFilter } from "./commit-filter-bar";
import { CommitListTimeline } from "./commit-list-timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/common/table-pagination";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { ProjectRealtimeBadge } from "@/features/student/project/components/project-realtime-badge";
import { useProjectCommits, useProjectRepositoryBranches, useProjectProgress } from "@/features/student/project/hooks/useProjectSync";
import { useProjectIntegrations } from "@/features/student/project/hooks/useProjectIntegrations";
import { useProjectRealtime } from "@/features/student/project/hooks/use-project-realtime";
import {
  mapProjectCommitToCommitItem,
  extractReposAndBranches,
  type CommitTeamMember,
} from "../lib/commit-mapper";
import { isGitHubRepoActive } from "../lib/github-commit-connection";
import { useUserIdentities } from "@/features/integrations/hooks/useUserIntegrations";
import { PersonalIntegrationRequiredModal } from "@/features/integrations/components/personal-integration-required-modal";
import { useProjectGraph } from "@/features/graph/hooks/use-project-graph";
import type { CytoscapeNodeData } from "@/features/graph/types/graph";
import {
  STUDENT_ROSTER_SUBGRAPH_PARAMS,
  parseStudentNodeProfileId,
  isStudentProfileUuid,
} from "@/features/graph/lib/student-profile-id";

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
  const isTeamLeader = team?.myRole === "LEADER";

  const { data: projectProgress } = useProjectProgress(projectId, {
    enabled: Boolean(projectId && isTeamLeader),
  });

  const { data: integrations } = useProjectIntegrations(projectId, {
    enabled: Boolean(projectId),
  });

  const { status: realtimeStatus } = useProjectRealtime(projectId, {
    enabled: Boolean(projectId && integrations?.github?.status === "ACTIVE"),
  });

  const studentRosterQuery = useProjectGraph({
    projectId: projectId || "",
    graphType: "OVERVIEW",
    sprintId: null,
    subgraphParams: STUDENT_ROSTER_SUBGRAPH_PARAMS,
    enabled: Boolean(projectId),
  });

  const {
    isJiraConnected: isUserJiraConnected,
    isGitHubConnected: isUserGitHubConnected,
    isLoading: isLoadingUserIdentities,
  } = useUserIdentities();

  const isPersonalIntegrationMissing = !isUserJiraConnected || !isUserGitHubConnected;

  const teamMembers = useMemo(() => {
    const progressMembers = projectProgress?.memberProgress || [];
    const teamMems = team?.members || [];
    const graphNodes = studentRosterQuery.data?.nodes || [];

    const memberMap = new Map<string, CommitTeamMember>();

    // 1. Nạp từ team.members
    teamMems.forEach((m) => {
      const code = m.studentCode?.trim().toLowerCase();
      let profileId =
        (m.studentProfileId || m.studentId || m.id || undefined) ?? undefined;
      if (!profileId && team?.myStudentCode && code === team.myStudentCode.trim().toLowerCase()) {
        if (team.myStudentId && isStudentProfileUuid(team.myStudentId)) {
          profileId = team.myStudentId;
        }
      }
      if (code) {
        memberMap.set(code, {
          id: profileId && isStudentProfileUuid(profileId) ? profileId : m.studentCode,
          studentProfileId: profileId && isStudentProfileUuid(profileId) ? profileId : undefined,
          studentCode: m.studentCode,
          fullName: m.fullName,
          name: m.fullName,
          avatar: m.avatar || m.avatarUrl || "",
          avatarUrl: m.avatarUrl ?? null,
        });
      }
    });

    // 2. Nạp/bổ sung từ Graph Neo4j nodes (nguồn chuẩn xác nhất chứa studentProfileId UUID)
    graphNodes.forEach((rawNode) => {
      const node = (
        "data" in rawNode && rawNode.data ? rawNode.data : rawNode
      ) as CytoscapeNodeData;
      if (node.type !== "STUDENT") return;
      const profileId = parseStudentNodeProfileId(node);
      if (!profileId) return;

      const subLabelCode = (node.subLabel || "").trim().toLowerCase();
      const labelCode = (node.label || "").trim().toLowerCase();

      let existingKey: string | undefined;
      if (subLabelCode && memberMap.has(subLabelCode)) {
        existingKey = subLabelCode;
      } else if (labelCode && memberMap.has(labelCode)) {
        existingKey = labelCode;
      } else {
        for (const [key, mem] of memberMap.entries()) {
          const memName = (mem.fullName || mem.name || "").trim().toLowerCase();
          if (
            (node.label && memName === node.label.trim().toLowerCase()) ||
            (subLabelCode && mem.studentCode?.trim().toLowerCase() === subLabelCode)
          ) {
            existingKey = key;
            break;
          }
        }
      }

      if (existingKey) {
        const existing = memberMap.get(existingKey)!;
        existing.studentProfileId = profileId;
        existing.id = profileId;
        if (!existing.avatar && node.avatar) {
          existing.avatar = node.avatar;
          existing.avatarUrl = node.avatar;
        }
      } else {
        const studentCode = node.subLabel || "";
        const key = (studentCode || profileId).toLowerCase();
        memberMap.set(key, {
          id: profileId,
          studentProfileId: profileId,
          studentCode: studentCode,
          fullName: node.label || studentCode,
          name: node.label || studentCode,
          avatar: node.avatar || "",
          avatarUrl: node.avatar || null,
        });
      }
    });

    // 3. Nạp bổ sung từ memberProgress nếu có
    progressMembers.forEach((pm) => {
      const studentCodeKey = pm.studentCode?.trim().toLowerCase();
      const existing = studentCodeKey ? memberMap.get(studentCodeKey) : undefined;
      const profileId =
        (pm.studentId && isStudentProfileUuid(pm.studentId) ? pm.studentId : undefined) ||
        existing?.studentProfileId;
      const fullItem: CommitTeamMember = {
        id: profileId || existing?.id || pm.studentId || pm.studentCode,
        studentProfileId: profileId,
        studentCode: pm.studentCode || existing?.studentCode,
        fullName: pm.fullName || existing?.fullName,
        name: pm.fullName || existing?.name,
        avatar: existing?.avatar || "",
        avatarUrl: existing?.avatarUrl || pm.avatarUrl || null,
      };
      if (studentCodeKey) {
        memberMap.set(studentCodeKey, fullItem);
      }
    });

    return Array.from(memberMap.values());
  }, [
    team,
    projectProgress?.memberProgress,
    studentRosterQuery.data?.nodes,
  ]);

  const uniqueTeamMembers = useMemo(() => {
    const seen = new Set<string>();
    const list: CommitTeamMember[] = [];
    for (const m of teamMembers) {
      const key = (m.studentCode || m.studentProfileId || m.id || m.fullName || "").toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(m);
    }
    return list;
  }, [teamMembers]);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("all");
  const [mergeFilter, setMergeFilter] = useState<CommitMergeFilter>("all");

  const effectiveAuthorStudentId = useMemo(() => {
    if (!selectedAuthorId || selectedAuthorId === "all") return undefined;
    const target = uniqueTeamMembers.find(
      (m) =>
        (m.studentProfileId && m.studentProfileId.toLowerCase() === selectedAuthorId.toLowerCase()) ||
        (m.id && m.id.toLowerCase() === selectedAuthorId.toLowerCase()) ||
        (m.studentCode && m.studentCode.toLowerCase() === selectedAuthorId.toLowerCase()) ||
        `unlinked:${(m.studentCode || m.fullName || "").toLowerCase()}` === selectedAuthorId.toLowerCase()
    );
    const candidate =
      (target?.studentProfileId && isStudentProfileUuid(target.studentProfileId)
        ? target.studentProfileId
        : null) ||
      (target?.id && isStudentProfileUuid(target.id) ? target.id : null) ||
      (isStudentProfileUuid(selectedAuthorId) ? selectedAuthorId : null);

    if (candidate) {
      return candidate;
    }
    // Nếu thành viên được chọn chưa có tài khoản GitHub liên kết (không có UUID),
    // trả về Nil UUID RFC 4122 để Backend lọc ra 0 commits một cách an toàn, không bị lỗi 400!
    return "00000000-0000-0000-0000-000000000000";
  }, [selectedAuthorId, uniqueTeamMembers]);

  const {
    data: commitsPage,
    isLoading: isLoadingCommits,
    isError: isCommitsError,
    error: commitsError,
    refetch: refetchCommits,
  } = useProjectCommits(projectId, {
    page: page - 1,
    size: pageSize,
    authorStudentId: effectiveAuthorStudentId,
    enabled: Boolean(projectId),
  });

  const rawCommits = useMemo(() => commitsPage?.items ?? [], [commitsPage?.items]);

  const allCommits: CommitItem[] = useMemo(() => {
    return rawCommits.map((c) => mapProjectCommitToCommitItem(c, teamMembers));
  }, [rawCommits, teamMembers]);

  const mergeCommitCount = useMemo(() => {
    return allCommits.filter((c) => c.isMerge).length;
  }, [allCommits]);

  const { repositories, branches: repoBranchesMap } = useMemo(() => {
    const res = extractReposAndBranches(rawCommits);
    const activeIntegrationRepos = integrations?.github?.repositories || [];

    const repoList = [...res.repositories];
    activeIntegrationRepos.forEach((ar) => {
      const existing = repoList.find(
        (r) => r.id === ar.id || r.fullPath.toLowerCase() === ar.fullName.toLowerCase()
      );
      const connectionStatus = (ar.status || "").toUpperCase() || "ACTIVE";
      if (existing) {
        existing.id = ar.id;
        existing.fullPath = ar.fullName;
        existing.name = ar.fullName.split("/").pop() || ar.fullName;
        existing.connectionStatus = connectionStatus;
      } else {
        repoList.push({
          id: ar.id,
          name: ar.fullName.split("/").pop() || ar.fullName,
          fullPath: ar.fullName,
          isDefault: repoList.length === 0,
          totalCommits: 0,
          activeBranchesCount: 1,
          defaultBranch: "main",
          connectionStatus,
        });
      }
    });

    repoList.forEach((repo) => {
      if (repo.connectionStatus) return;
      repo.connectionStatus = isGitHubRepoActive(repo, integrations)
        ? "ACTIVE"
        : "NOT_CONNECTED";
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
  }, [rawCommits, integrations]);

  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const selectedRepo =
    repositories.find((r) => r.id === selectedRepoId) || repositories[0];
  const selectedRepoFullPath = selectedRepo?.fullPath || "";

  const selectedRepoIsActive = isGitHubRepoActive(selectedRepo, integrations);
  const activeRepoId =
    selectedRepo && selectedRepo.id !== "all" && selectedRepoIsActive ? selectedRepo.id : null;

  const {
    data: liveBranchesData,
  } = useProjectRepositoryBranches(projectId, activeRepoId, {
    enabled: Boolean(projectId && activeRepoId && selectedRepoIsActive),
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
    setPage(1);
  };

  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setPage(1);
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
      if (mergeFilter === "exclude_merge" && commit.isMerge) {
        return false;
      }
      if (mergeFilter === "only_merge" && !commit.isMerge) {
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
    mergeFilter,
    searchQuery,
  ]);

  const liveBranchCount = liveBranchesData?.branchCount;

  const stats: CommitStats = useMemo(() => {
    const isAnyFilterActive =
      Boolean(searchQuery.trim()) ||
      effectiveSelectedBranchName !== "all" ||
      mergeFilter !== "all" ||
      (selectedRepo && selectedRepo.id !== "all");

    const totalCommits = isAnyFilterActive
      ? filteredCommits.length
      : (commitsPage?.total ?? filteredCommits.length);
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
    };
  }, [
    filteredCommits,
    liveBranchCount,
    currentRepoBranches.length,
    commitsPage?.total,
    effectiveSelectedBranchName,
    mergeFilter,
    searchQuery,
    selectedRepo,
  ]);

  const githubRepositoryUrl = useMemo(() => {
    const repositoryFullName = selectedRepoFullPath.trim();
    return repositoryFullName && /^[\w.-]+\/[\w.-]+$/.test(repositoryFullName)
      ? `https://github.com/${repositoryFullName}`
      : null;
  }, [selectedRepoFullPath]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <PersonalIntegrationRequiredModal
        isOpen={!isLoadingUserIdentities && isPersonalIntegrationMissing}
        isJiraConnected={isUserJiraConnected}
        isGitHubConnected={isUserGitHubConnected}
        courseId={courseId}
        moduleName="commit"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-card/60 p-4 rounded-xl border border-border/70 backdrop-blur-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 dark:from-slate-200 dark:to-slate-300 text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-sm border border-slate-700/50 dark:border-slate-300/50">
            <GitCommitIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Nhật Ký Git Commits
              </h1>
              {courseCode && (
                <Badge variant="outline" className="font-mono text-xs font-bold border-primary/30 bg-primary/10 text-primary">
                  {courseCode}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Nhật ký commits được đồng bộ tự động từ GitHub Repositories của dự án
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {realtimeStatus && (
            <ProjectRealtimeBadge
              status={realtimeStatus}
            />
          )}

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
        <div className="flex items-center justify-center gap-2 p-6 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
          <RotateCwIcon className="w-4 h-4 animate-spin" />
          <span>Đang tải danh sách GitHub commits từ máy chủ...</span>
        </div>
      )}

      {isCoursesLoading && (
        <div className="h-36 animate-pulse rounded-xl bg-muted/60" />
      )}

      {isInvalidCourse && (
        <div className="p-6 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Lớp học phần không còn khả dụng</p>
          <p className="text-xs text-muted-foreground">Hãy chọn lại lớp học phần trước khi xem lịch sử commit.</p>
        </div>
      )}

      {!isCoursesLoading && !isInvalidCourse && !isLoadingCommits && !projectId && (
        <div className="p-6 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Chưa xác định dự án nhóm</p>
          <p className="text-xs text-muted-foreground">Vui lòng vào menu Dự án để khởi tạo hoặc kiểm tra quyền phân nhóm.</p>
        </div>
      )}

      {!isLoadingCommits && Boolean(projectId) && isCommitsError && (
        <div className="p-6 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 text-center space-y-3">
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

      <PersonalIntegrationRequiredModal
        isOpen={!isLoadingUserIdentities && isPersonalIntegrationMissing}
        isJiraConnected={isUserJiraConnected}
        isGitHubConnected={isUserGitHubConnected}
        courseId={courseId}
        moduleName="commit"
      />

      {!isCommitsError && !isInvalidCourse && (
        <>
          <CommitStatsCards
            stats={stats}
            selectedRepoName={selectedRepo.fullPath}
            selectedBranchName={effectiveSelectedBranchName}
            isTeamLeader={isTeamLeader}
          />

          <CommitFilterBar
            repositories={repositories}
            selectedRepoId={selectedRepo.id}
            onSelectRepo={handleSelectRepo}
            branches={currentRepoBranches}
            selectedBranchName={effectiveSelectedBranchName}
            onSelectBranch={(branch) => {
              setSelectedBranchName(branch);
              setPage(1);
            }}
            members={uniqueTeamMembers}
            selectedAuthorId={selectedAuthorId}
            onSelectAuthor={handleSelectAuthor}
            mergeFilter={mergeFilter}
            onMergeFilterChange={(filter) => {
              setMergeFilter(filter);
              setPage(1);
            }}
            mergeCount={mergeCommitCount}
            searchQuery={searchQuery}
            onSearchChange={(query) => {
              setSearchQuery(query);
              setPage(1);
            }}
          />

          <CommitListTimeline
            commits={filteredCommits}
            selectedRepoName={selectedRepo.fullPath}
            selectedBranchName={effectiveSelectedBranchName}
            courseId={courseId}
            projectId={projectId}
          />

          {commitsPage && commitsPage.total > 0 && (
            <div className="pt-2">
              <TablePagination
                page={page}
                pageSize={pageSize}
                totalItems={commitsPage.total}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                pageSizeOptions={[20, 50, 100]}
                itemLabel="commit"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
