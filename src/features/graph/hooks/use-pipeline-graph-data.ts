"use client";

import { useMemo } from "react";
import { normalizeProjectProgress } from "@/features/progress/lib/progress-format";
import type { StudentTeamMember } from "@/features/student/courses/types/student-course";
import { useProjectIntegrations } from "@/features/student/project/hooks/useProjectIntegrations";
import {
  useProjectCommits,
  useProjectProgress,
  useTaskCommits,
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
  const taskCommitsQuery = useTaskCommits(commitsPlan.taskCommitsProjectId, commitsPlan.taskCommitsTaskId, {
    enabled: commitsPlan.taskCommitsEnabled,
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
  const sanitizedFilter = useMemo(
    () => sanitizePipelineFilter(filter, members, sprints),
    [filter, members, sprints]
  );
  const branchTaskKeys = useMemo(() => {
    if (!sanitizedFilter.branchName || sanitizedFilter.branchName === "ALL" || !commitsQuery.data) {
      return undefined;
    }
    const keys = new Set<string>();
    const targetBranch = sanitizedFilter.branchName.trim().toLowerCase();
    for (const c of commitsQuery.data) {
      if (c.headRef && c.headRef.trim().toLowerCase() === targetBranch) {
        const matches = c.message.match(/([A-Za-z][A-Za-z0-9_]+-[0-9]+)/g);
        if (matches) {
          matches.forEach((k) => keys.add(k.toUpperCase()));
        }
      }
    }
    return keys;
  }, [commitsQuery.data, sanitizedFilter.branchName]);

  const filteredTasks = useMemo(
    () => filterPipelineTasks(tasks, sanitizedFilter, members, branchTaskKeys),
    [branchTaskKeys, members, sanitizedFilter, tasks]
  );
  const lanes = useMemo(
    () => groupTasksIntoLanes(filteredTasks, members),
    [filteredTasks, members]
  );
  const selectedCommits = useMemo(
    () => mapPipelineCommits(taskCommitsQuery.data || [], members),
    [members, taskCommitsQuery.data]
  );
  const stats = useMemo(
    () =>
      computePipelineStats(
        members,
        tasks,
        commitsQuery.isSuccess ? (commitsQuery.data || []).length : null
      ),
    [commitsQuery.data, commitsQuery.isSuccess, members, tasks]
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
    (commitsQuery.data || []).length === 0;

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
    sanitizedFilter,
    effectiveTaskId,
    stats,
    selectedCommits,
    isLoadingMain:
      plan.pipelineReady &&
      (tasksQuery.isLoading ||
        (progressQuery.isLoading && !progressForbidden) ||
        (integrationsQuery.isLoading && !(tasksQuery.data || []).length)),
    isLoadingCommits: commitsQuery.isFetching && !commitsQuery.isSuccess,
    isLoadingTaskCommits: taskCommitsQuery.isFetching && !taskCommitsQuery.isSuccess,
    isTasksError: tasksQuery.isError,
    tasksErrorMessage: tasksQuery.isError
      ? getApiErrorMessage(tasksQuery.error, "Không tải được danh sách Task.")
      : null,
    isCommitsError: commitsQuery.isError,
    commitsErrorMessage: commitsQuery.isError
      ? getApiErrorMessage(commitsQuery.error, "Không tải được tổng số Commit.")
      : null,
    isTaskCommitsError: taskCommitsQuery.isError,
    taskCommitsErrorMessage: taskCommitsQuery.isError
      ? getApiErrorMessage(taskCommitsQuery.error, "Không tải được Commit liên kết của Task.")
      : null,
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
    refetchTaskCommits: taskCommitsQuery.refetch,
    realtimeStatus: realtime.status,
    queryPlan: commitsPlan,
    allCommits: commitsQuery.data || [],
    progressData: progressQuery.data || null,
    integrationsData: integrationsQuery.data || null,
  };
}
