"use client";

import { useMemo } from "react";
import { normalizeProjectProgress } from "@/features/progress/lib/progress-format";
import type { StudentTeamMember } from "@/features/student/courses/types/student-course";
import { useProjectIntegrations } from "@/features/student/project/hooks/useProjectIntegrations";
import type { TaskLinkedCommitItem } from "@/features/student/project/types/student-project";
import {
  useProjectCommits,
  useProjectProgress,
  useProjectRepositoryBranches,
  useProjectTaskCommitLinks,
} from "@/features/student/project/hooks/useProjectSync";
import { useProjectRealtime } from "@/features/student/project/hooks/use-project-realtime";
import { useProjectTasksData } from "@/features/student/sprint-progress/hooks/use-project-tasks";
import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import {
  collectPipelineSprints,
  computePipelineStats,
  filterPipelineTasks,
  groupTasksIntoLanes,
  mapMembersFromProgress,
  mapMembersFromTeam,
  mapPipelineCommits,
  mapPipelineTasks,
  resolvePipelineQueryPlan,
  sanitizePipelineFilter,
} from "../lib/pipeline-mapper";
import type { PipelineFilterState } from "../types/pipeline";

interface UsePipelineGraphDataOptions {
  enabled: boolean;
  projectId: string | null;
  selectedTaskId: string | null;
  teamMembers: StudentTeamMember[];
  filter: PipelineFilterState;
}

export function usePipelineGraphData({
  enabled,
  projectId,
  selectedTaskId,
  teamMembers,
  filter,
}: UsePipelineGraphDataOptions) {
  const plan = resolvePipelineQueryPlan({
    pipelineOpen: enabled,
    projectId,
    selectedTaskId,
    tasksReady: false,
    progressLoading: false,
  });

  const progressQuery = useProjectProgress(plan.projectId, {
    enabled: plan.progressEnabled,
  });
  const tasksQuery = useProjectTasksData(plan.tasksProjectId);
  const tasks = useMemo(() => mapPipelineTasks(tasksQuery.data || []), [tasksQuery.data]);
  const effectiveTaskId =
    selectedTaskId && tasks.some((task) => task.id === selectedTaskId) ? selectedTaskId : null;
  const commitsPlan = resolvePipelineQueryPlan({
    pipelineOpen: enabled,
    projectId,
    selectedTaskId: effectiveTaskId,
    tasksReady: tasksQuery.isSuccess,
    progressLoading: progressQuery.isLoading,
  });
  const commitsQuery = useProjectCommits(commitsPlan.projectId, {
    enabled: commitsPlan.commitsEnabled,
  });
  const integrationsQuery = useProjectIntegrations(plan.projectId, {
    enabled: plan.pipelineReady,
  });
  const realtime = useProjectRealtime(plan.projectId, {
    enabled: commitsPlan.realtimeEnabled,
  });

  const members = useMemo(() => {
    const normalized = progressQuery.data ? normalizeProjectProgress(progressQuery.data) : null;
    if (normalized?.memberProgress?.length) {
      return mapMembersFromProgress(normalized.memberProgress);
    }
    return mapMembersFromTeam(teamMembers);
  }, [progressQuery.data, teamMembers]);

  const sprints = useMemo(() => collectPipelineSprints(tasks), [tasks]);
  const baseSanitizedFilter = useMemo(
    () => sanitizePipelineFilter(filter, members, sprints),
    [filter, members, sprints]
  );
  const repositories = useMemo(
    () =>
      (integrationsQuery.data?.github?.repositories || []).filter(
        (repository) => !repository.status || repository.status.toUpperCase() === "ACTIVE"
      ),
    [integrationsQuery.data]
  );
  const selectedRepoId =
    baseSanitizedFilter.repoId &&
      baseSanitizedFilter.repoId !== "ALL" &&
      repositories.some((repository) => repository.id === baseSanitizedFilter.repoId)
      ? baseSanitizedFilter.repoId
      : "ALL";
  const branchesQuery = useProjectRepositoryBranches(
    plan.projectId,
    selectedRepoId === "ALL" ? null : selectedRepoId,
    { enabled: plan.pipelineReady && selectedRepoId !== "ALL" }
  );
  const branches = useMemo(() => branchesQuery.data?.branches || [], [branchesQuery.data]);
  const selectedBranchName =
    selectedRepoId !== "ALL" &&
      baseSanitizedFilter.branchName &&
      baseSanitizedFilter.branchName !== "ALL" &&
      branches.some((branch) => branch.name === baseSanitizedFilter.branchName)
      ? baseSanitizedFilter.branchName
      : "ALL";
  const sanitizedFilter = useMemo(
    () => ({
      ...baseSanitizedFilter,
      repoId: selectedRepoId,
      branchName: selectedBranchName,
    }),
    [baseSanitizedFilter, selectedBranchName, selectedRepoId]
  );
  const taskCommitLinksQuery = useProjectTaskCommitLinks(
    commitsPlan.projectId,
    {
      repoId: selectedRepoId === "ALL" ? null : selectedRepoId,
      branchName: selectedBranchName === "ALL" ? null : selectedBranchName,
    },
    { enabled: commitsPlan.commitsEnabled }
  );
  const scopedLinkCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const link of taskCommitLinksQuery.data?.links || []) {
      counts.set(link.taskId, (counts.get(link.taskId) || 0) + 1);
    }
    return counts;
  }, [taskCommitLinksQuery.data]);
  const scopedTasks = useMemo(
    () =>
      taskCommitLinksQuery.isSuccess
        ? tasks.map((task) => ({
          ...task,
          linkedCommitCount: scopedLinkCounts.get(task.id) || 0,
        }))
        : tasks,
    [scopedLinkCounts, taskCommitLinksQuery.isSuccess, tasks]
  );
  const hasCommitScope = selectedRepoId !== "ALL" || selectedBranchName !== "ALL";
  const scopedTaskIds = useMemo(
    () =>
      hasCommitScope
        ? new Set((taskCommitLinksQuery.data?.links || []).map((link) => link.taskId))
        : undefined,
    [hasCommitScope, taskCommitLinksQuery.data]
  );

  const filteredTasks = useMemo(
    () => filterPipelineTasks(scopedTasks, sanitizedFilter, members, scopedTaskIds),
    [members, sanitizedFilter, scopedTaskIds, scopedTasks]
  );
  const lanes = useMemo(
    () => groupTasksIntoLanes(filteredTasks, members),
    [filteredTasks, members]
  );
  const rawCommits = useMemo((): TaskLinkedCommitItem[] => {
    if (!commitsQuery.data) return [];
    if (Array.isArray(commitsQuery.data)) return commitsQuery.data;
    return commitsQuery.data.items || [];
  }, [commitsQuery.data]);

  const selectedCommits = useMemo(() => {
    if (!effectiveTaskId) return [];
    const commitById = new Map<string, TaskLinkedCommitItem>(
      rawCommits.map((commit) => [commit.id, commit])
    );
    const commits: TaskLinkedCommitItem[] = (taskCommitLinksQuery.data?.links || [])
      .filter((link) => link.taskId === effectiveTaskId)
      .map((link) =>
        commitById.get(link.commitId) || {
          id: link.commitId,
          repoId: link.repoId || "",
          repositoryFullName: link.repositoryFullName || "Repository không xác định",
          sha: link.sha,
          message: link.message,
          headRef: link.headRef,
          committedAt: link.linkedAt,
          createdAt: link.linkedAt,
        }
      );
    return mapPipelineCommits(commits, members);
  }, [effectiveTaskId, members, rawCommits, taskCommitLinksQuery.data]);
  const stats = useMemo(
    () =>
      computePipelineStats(
        members,
        scopedTasks,
        commitsQuery.isSuccess ? rawCommits.length : null
      ),
    [commitsQuery.isSuccess, members, rawCommits.length, scopedTasks]
  );

  const progressForbidden =
    progressQuery.isError &&
    (getApiErrorStatus(progressQuery.error) === 403 ||
      getApiErrorCode(progressQuery.error) === "PROJECT_PROGRESS_FORBIDDEN");

  const jiraStatus = integrationsQuery.data?.jira?.status || null;
  const githubStatus = integrationsQuery.data?.github?.status || null;
  const isJiraActive = jiraStatus === "ACTIVE";
  const isGithubActive = githubStatus === "ACTIVE";
  const isBothActive = isJiraActive && isGithubActive;
  const isBothMissing = integrationsQuery.isSuccess && !isJiraActive && !isGithubActive;
  const isJiraMissingOnly = integrationsQuery.isSuccess && !isJiraActive && isGithubActive;
  const isGithubMissingOnly = integrationsQuery.isSuccess && isJiraActive && !isGithubActive;

  const isIntegrationsConnectedButUnsynced =
    integrationsQuery.isSuccess &&
    isBothActive &&
    tasks.length === 0 &&
    rawCommits.length === 0;

  const integrationsUnsynced =
    integrationsQuery.isSuccess &&
    !isBothActive &&
    tasks.length === 0;

  return {
    members,
    tasks,
    filteredTasks,
    lanes,
    sprints,
    repositories,
    branches,
    sanitizedFilter,
    effectiveTaskId,
    stats,
    selectedCommits,
    isLoadingMain:
      plan.pipelineReady &&
      (tasksQuery.isLoading ||
        (progressQuery.isLoading && !progressForbidden) ||
        (integrationsQuery.isLoading && !(tasksQuery.data || []).length) ||
        (hasCommitScope && taskCommitLinksQuery.isLoading)),
    isLoadingCommits: commitsQuery.isFetching && !commitsQuery.isSuccess,
    isLoadingBranches: branchesQuery.isFetching && !branchesQuery.isSuccess,
    isLoadingTaskCommits:
      taskCommitLinksQuery.isFetching && !taskCommitLinksQuery.isSuccess,
    isTasksError: tasksQuery.isError,
    tasksErrorMessage: tasksQuery.isError
      ? getApiErrorMessage(tasksQuery.error, "Không tải được danh sách Task.")
      : null,
    isCommitsError: commitsQuery.isError,
    commitsErrorMessage: commitsQuery.isError
      ? getApiErrorMessage(commitsQuery.error, "Không tải được tổng số Commit.")
      : null,
    isTaskCommitsError: taskCommitLinksQuery.isError,
    taskCommitsErrorMessage: taskCommitLinksQuery.isError
      ? getApiErrorMessage(taskCommitLinksQuery.error, "Không tải được liên kết Task–Commit canonical.")
      : null,
    taskCommitLinksFilter: taskCommitLinksQuery.data?.filter || null,
    progressForbidden,
    integrationsUnsynced,
    jiraStatus,
    githubStatus,
    isJiraActive,
    isGithubActive,
    isBothActive,
    isBothMissing,
    isJiraMissingOnly,
    isGithubMissingOnly,
    isIntegrationsConnectedButUnsynced,
    refetchTasks: tasksQuery.refetch,
    refetchCommits: commitsQuery.refetch,
    refetchTaskCommits: taskCommitLinksQuery.refetch,
    realtimeStatus: realtime.status,
    queryPlan: commitsPlan,
    allCommits: rawCommits,
    progressData: progressQuery.data || null,
    integrationsData: integrationsQuery.data || null,
  };
}
