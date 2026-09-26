"use client";

import { showSuccessToast, showErrorToast, getApiErrorMessage } from "@/lib/api-error";
import { useState, useMemo } from "react";
import type { SprintIssue, Sprint, IssueStatus, Epic } from "../types/sprint-progress";
import { SprintHeader } from "./sprint-header";
import { SprintBoardView } from "./sprint-board-view";
import { SprintBacklogView } from "./sprint-backlog-view";
import { SprintTimelineView } from "./sprint-timeline-view";
import { IssueDetailsModal } from "./issue-details-modal";
import { SprintModal } from "./sprint-modal";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import {
  studentCoursePath,
  useStudentCourseContext,
} from "@/features/student/courses/hooks/use-student-course-context";
import { mapProjectTaskToSprintIssue } from "../lib/task-mapper";
import {
  getTopLevelSprintIssues,
  mergeProjectedAndLocalIssues,
} from "../lib/issue-collection";
import { Loader2Icon, AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useProjectSprints,
  useAssignTaskToSprint,
  usePatchSprint,
} from "../hooks/use-project-sprints";
import { useProjectTasksData, useTransitionTask, useTaskOptions } from "../hooks/use-project-tasks";
import { useProjectJiraSourceSelection } from "@/features/student/project/hooks/use-project-jira-source-selection";
import { useProjectRealtime } from "@/features/student/project/hooks/use-project-realtime";
import { useProjectSyncStatus, useSyncProject } from "@/features/student/project/hooks/useProjectSync";
import {
  moveLocalIssueToSprint,
  restoreLocalSprintOverride,
  setLocalSprintOverride,
} from "../lib/optimistic-sprint-state";
import { ActivityHeatmapGrid, SprintBurndownChart } from "@/features/analytics";
import {
  scopeIssuesToJiraSource,
  scopeSprintsToJiraSource,
} from "../lib/jira-source-scope";
import { JiraSourceSwitcher } from "@/features/student/project/components/jira-source-switcher";

export function SprintProgressView() {
  const { user: authUser } = useAuthStore();
  const { course: effectiveCourse, courseId, isInvalidCourse } = useStudentCourseContext();

  const { data: team } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const projectId = team?.projectId || effectiveCourse?.projectId || "";

  const jiraSource = useProjectJiraSourceSelection(projectId);
  const projectIntegrations = jiraSource.integrationsQuery.data;
  const activeJiraSources = jiraSource.activeSources;
  const effectiveSourceId = jiraSource.effectiveSourceId;
  const isJiraConnected =
    activeJiraSources.length > 0 ||
    jiraSource.integrationsQuery.data?.jira?.status === "ACTIVE";

  const {
    data: projectTasks = [],
    isLoading: isLoadingTasks,
    isError: isTasksError,
    error: tasksError,
    refetch: refetchTasks,
  } = useProjectTasksData(projectId);

  const {
    data: apiSprints = [],
    isLoading: isLoadingSprints,
    isError: isSprintsError,
    error: sprintsError,
    refetch: refetchSprints,
  } = useProjectSprints(projectId, effectiveSourceId, {
    enabled: Boolean(projectId && isJiraConnected),
  });
  const { data: syncJobs = [] } = useProjectSyncStatus(projectId, {
    enabled: Boolean(projectId),
  });
  const { data: taskOptions } = useTaskOptions(projectId, {
    enabled: Boolean(projectId && isJiraConnected),
    jiraIntegrationId: effectiveSourceId,
  });
  const hasActiveSyncJob = useMemo(
    () =>
      syncJobs.some((job) =>
        ["ENQUEUED", "IN_PROGRESS", "RUNNING", "SYNCING"].includes(
          (job.status || "").toUpperCase()
        )
      ),
    [syncJobs]
  );
  const lastSyncedAt = useMemo(() => {
    return syncJobs
      .map((job) => job.completedAt)
      .filter((completedAt): completedAt is string => Boolean(completedAt))
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || null;
  }, [syncJobs]);
  const transitionTaskMutation = useTransitionTask();
  const assignTaskToSprintMutation = useAssignTaskToSprint();
  const patchSprintMutation = usePatchSprint();
  const syncProjectMutation = useSyncProject();

  const currentUserStudentCode = authUser?.studentCode || "";
  const isLeaderInGroup = effectiveCourse && "myGroup" in effectiveCourse && effectiveCourse.myGroup?.role === "LEADER";
  const isTeamLeader = team?.myRole === "LEADER" || Boolean(isLeaderInGroup);

  const teamMembers = useMemo(() => {
    const assignable = taskOptions?.assignableUsers || [];
    return (team?.members || []).map((m) => {
      const cleanMemberName = (m.fullName || "").toLowerCase().replace(/\s+/g, " ").trim();
      const matchedJiraUser = assignable.find((u) => {
        const cleanDisplayName = (u.displayName || "").toLowerCase().replace(/\s+/g, " ").trim();
        return (
          cleanDisplayName === cleanMemberName ||
          cleanDisplayName.includes(cleanMemberName) ||
          cleanMemberName.includes(cleanDisplayName) ||
          (m.studentCode && cleanDisplayName.includes(m.studentCode.toLowerCase()))
        );
      });
      return {
        id: m.studentCode,
        studentCode: m.studentCode,
        name: m.fullName,
        avatar: m.avatar || m.avatarUrl || "",
        accountId: matchedJiraUser?.accountId || null,
      };
    });
  }, [team?.members, taskOptions?.assignableUsers]);

  const [userSelectedSprintId, setUserSelectedSprintId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"BOARD" | "BACKLOG" | "TIMELINE" | "ANALYTICS">("BOARD");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

  const [localTaskOverrides, setLocalTaskOverrides] = useState<Record<string, Partial<SprintIssue>>>({});
  const [localCustomIssues, setLocalCustomIssues] = useState<SprintIssue[]>([]);
  const {
    status: realtimeStatus,
    lastEventTime,
    lastEvent,
    reconnect: reconnectRealtime,
  } = useProjectRealtime(projectId, {
    enabled: Boolean(
      projectId &&
      (isJiraConnected || projectIntegrations?.github?.status === "ACTIVE")
    ),
    onEvent: (event) => {
      if (event.type !== "TASKS_CHANGED" && event.type !== "SPRINTS_CHANGED") return;

      setLocalTaskOverrides((previous) => {
        if (event.entityId) {
          if (!(event.entityId in previous)) return previous;
          const remaining = { ...previous };
          delete remaining[event.entityId];
          return remaining;
        }
        return Object.keys(previous).length > 0 ? {} : previous;
      });
    },
  });

  const rawIssues: SprintIssue[] = useMemo(() => {
    const fromApi = projectTasks.map((t) => {
      const mapped = mapProjectTaskToSprintIssue(t, teamMembers);
      const override = localTaskOverrides[t.id];
      return override ? { ...mapped, ...override } : mapped;
    });
    return mergeProjectedAndLocalIssues(fromApi, localCustomIssues);
  }, [projectTasks, teamMembers, localTaskOverrides, localCustomIssues]);

  const scopedIssues = useMemo(() => {
    return scopeIssuesToJiraSource(
      rawIssues,
      effectiveSourceId,
      activeJiraSources.length
    );
  }, [rawIssues, effectiveSourceId, activeJiraSources.length]);

  const topLevelIssues = useMemo(() => getTopLevelSprintIssues(scopedIssues), [scopedIssues]);

  const sourceScopedApiSprints = useMemo(() => {
    if (!effectiveSourceId) return apiSprints;
    return scopeSprintsToJiraSource(apiSprints, taskOptions?.sprints, scopedIssues, effectiveSourceId);
  }, [apiSprints, effectiveSourceId, scopedIssues, taskOptions?.sprints]);

  const sprints: Sprint[] = useMemo(() => {
    if (!sourceScopedApiSprints || sourceScopedApiSprints.length === 0) {
      return [];
    }
    return sourceScopedApiSprints.map((s) => {
      const sId = String(s.id);
      const sprintIssues = topLevelIssues.filter((i) => i.sprintId === sId);
      const completedIssues = sprintIssues.filter((i) => i.status === "DONE");
      const totalPoints = sprintIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
      const completedPoints = completedIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
      return {
        id: sId,
        externalSprintId: s.externalSprintId,
        name: s.name,
        goal: s.goal || "",
        startDate: s.startDate ? s.startDate.split("T")[0] : "",
        endDate: s.endDate ? s.endDate.split("T")[0] : "",
        status: s.state === "active" ? "ACTIVE" : s.state === "closed" ? "COMPLETED" : "PLANNED",
        totalStoryPoints: totalPoints,
        completedStoryPoints: completedPoints,
      };
    });
  }, [sourceScopedApiSprints, topLevelIssues]);

  const epics: Epic[] = useMemo(() => {
    const epicMap = new Map<string, Epic>();
    for (const issue of scopedIssues) {
      if (issue.epic) {
        if (!epicMap.has(issue.epic.id)) {
          epicMap.set(issue.epic.id, {
            id: issue.epic.id,
            key: issue.epic.name,
            name: issue.epic.name,
            color: issue.epic.color || "#3B82F6",
            description: `Phân hệ ${issue.epic.name}`,
            progressPercent: 0,
          });
        }
      }
    }
    return Array.from(epicMap.values()).map((epic) => {
      const epicIssues = scopedIssues.filter((i) => i.epic?.id === epic.id);
      const doneCount = epicIssues.filter((i) => i.status === "DONE").length;
      const progressPercent =
        epicIssues.length > 0 ? Math.round((doneCount / epicIssues.length) * 100) : 0;
      return { ...epic, progressPercent };
    });
  }, [scopedIssues]);

  const productBacklogCount = useMemo(() => {
    return topLevelIssues.filter(
      (i) => !i.sprintId || i.sprintId === "backlog" || !sprints.some((s) => s.id === i.sprintId)
    ).length;
  }, [topLevelIssues, sprints]);

  const selectedSprintId = useMemo(() => {
    if (userSelectedSprintId) {
      if (userSelectedSprintId === "backlog" || sprints.some((s) => s.id === userSelectedSprintId)) {
        return userSelectedSprintId;
      }
    }
    const active = sprints.find((s) => s.status === "ACTIVE") || sprints[0];
    return active ? active.id : "backlog";
  }, [sprints, userSelectedSprintId]);

  const [activeIssueForModal, setActiveIssueForModal] = useState<SprintIssue | null>(null);
  const [defaultSprintIdForModal, setDefaultSprintIdForModal] = useState<string | undefined>(undefined);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [activeSprintForModal, setActiveSprintForModal] = useState<Sprint | null>(null);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState<boolean>(false);

  const handleOpenIssueModal = (issue: SprintIssue) => {
    setActiveIssueForModal(issue);
    setDefaultSprintIdForModal(undefined);
    setIsIssueModalOpen(true);
  };

  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>();
    const defaultLabels = [
      "saga:code",
      "saga:test",
      "saga:doc",
      "saga:research",
      "frontend",
      "backend",
      "ui/ux",
      "bugfix",
      "api",
      "database",
      "devops",
    ];
    defaultLabels.forEach((l) => labelSet.add(l));
    for (const t of rawIssues) {
      if (Array.isArray(t.labels)) {
        t.labels.forEach((l) => {
          if (l && l.trim()) labelSet.add(l.trim());
        });
      }
    }
    return Array.from(labelSet);
  }, [rawIssues]);

  const filteredIssues = useMemo(() => {
    return scopedIssues.filter((issue) => {
      if (activeView === "BOARD" && issue.sprintId !== selectedSprintId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!issue.key.toLowerCase().includes(q) && !issue.summary.toLowerCase().includes(q)) return false;
      }
      if (selectedAssigneeId) {
        const selectedMember = teamMembers.find((m) => m.id === selectedAssigneeId);
        const matchesAssignee =
          issue.assignee.id === selectedAssigneeId ||
          issue.assignee.studentCode === selectedAssigneeId ||
          Boolean(selectedMember?.accountId && (issue.assignee.accountId === selectedMember.accountId || issue.assignee.id === selectedMember.accountId)) ||
          Boolean(
            selectedMember &&
            issue.assignee.name &&
            (issue.assignee.name.toLowerCase().trim() === selectedMember.name.toLowerCase().trim() ||
              issue.assignee.name.toLowerCase().includes(selectedMember.name.toLowerCase().trim()) ||
              selectedMember.name.toLowerCase().includes(issue.assignee.name.toLowerCase().trim()))
          );
        if (!matchesAssignee) return false;
      }
      return true;
    });
  }, [scopedIssues, activeView, selectedSprintId, searchQuery, selectedAssigneeId, teamMembers]);

  const boardIssues = useMemo(() => getTopLevelSprintIssues(filteredIssues), [filteredIssues]);

  const handleMoveTaskStatus = async (issueId: string, newStatus: IssueStatus) => {
    const previousOverride = localTaskOverrides[issueId];
    const previousCustomIssues = localCustomIssues;
    setLocalTaskOverrides((prev) => ({ ...prev, [issueId]: { ...prev[issueId], status: newStatus } }));
    setLocalCustomIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));

    if (!projectId) return;

    try {
      await transitionTaskMutation.mutateAsync({
        projectId,
        taskId: issueId,
        data: { targetStatus: newStatus },
      });
    } catch {
      setLocalTaskOverrides((prev) => ({ ...prev, [issueId]: previousOverride || {} }));
      setLocalCustomIssues(previousCustomIssues);
      showErrorToast("Không thể cập nhật trạng thái Task trên Jira.");
    }
  };

  const handleMoveTaskSprint = async (issueId: string, newSprintId: string) => {
    const previousOverride = localTaskOverrides[issueId];
    const previousCustomIssues = localCustomIssues;
    setLocalTaskOverrides((prev) => setLocalSprintOverride(prev, issueId, newSprintId));
    setLocalCustomIssues((prev) => moveLocalIssueToSprint(prev, issueId, newSprintId));

    if (!projectId) return;

    try {
      const targetSprintObj = sprints.find((s) => s.id === newSprintId);
      const targetSprint =
        newSprintId === "backlog"
          ? null
          : targetSprintObj?.externalSprintId
            ? Number(targetSprintObj.externalSprintId)
            : Number(newSprintId) || newSprintId;
      await assignTaskToSprintMutation.mutateAsync({
        projectId,
        taskId: issueId,
        sprintId: targetSprint,
      });
    } catch {
      setLocalTaskOverrides((prev) => restoreLocalSprintOverride(prev, issueId, previousOverride));
      setLocalCustomIssues(previousCustomIssues);
      showErrorToast("Không thể gán Task vào Sprint trên Jira.");
    }
  };

  const handleSyncJira = async () => {
    if (!projectId) return;
    try {
      await syncProjectMutation.mutateAsync(projectId);
      showSuccessToast("Đã gửi yêu cầu đồng bộ Jira & GitHub. Dữ liệu sẽ tự động cập nhật.");
    } catch {
      showErrorToast("Không thể kích hoạt đồng bộ từ Jira.");
    }
  };

  const handleSaveIssue = (savedIssue: SprintIssue) => {
    const isProjectedTask = projectTasks.some((task) => task.id === savedIssue.id);
    setLocalCustomIssues((prev) => {
      if (isProjectedTask) {
        return prev.filter((issue) => issue.id !== savedIssue.id);
      }
      const idx = prev.findIndex((i) => i.id === savedIssue.id);
      if (idx >= 0) return prev.map((i) => (i.id === savedIssue.id ? savedIssue : i));
      return [savedIssue, ...prev];
    });
    setLocalTaskOverrides((prev) => ({ ...prev, [savedIssue.id]: savedIssue }));
  };

  const handleDeleteIssue = (issueId: string) => {
    setLocalCustomIssues((prev) => prev.filter((i) => i.id !== issueId));
    setLocalTaskOverrides((prev) => ({ ...prev, [issueId]: { ...prev[issueId], status: "DONE" } }));
  };

  const courseCode = effectiveCourse?.subjectCode || "Chưa chọn lớp";
  const projectName = team?.teamName || projectIntegrations?.jira?.projectKey || "Chưa xác định dự án";

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      <SprintHeader
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        onSelectSprint={setUserSelectedSprintId}
        activeView={activeView}
        onSelectView={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssigneeId={selectedAssigneeId}
        onSelectAssignee={setSelectedAssigneeId}
        teamMembers={teamMembers}
        isTeamLeader={isTeamLeader}
        courseCode={courseCode}
        projectName={projectName}
        totalTasksCount={activeView === "BOARD" ? boardIssues.length : filteredIssues.length}
        totalProjectTasksCount={topLevelIssues.length}
        productBacklogCount={productBacklogCount}
        onSyncJira={handleSyncJira}
        isSyncingJira={syncProjectMutation.isPending || hasActiveSyncJob}
        lastSyncedAt={lastSyncedAt}
        realtimeStatus={realtimeStatus}
        lastEventTime={lastEventTime}
        lastEvent={lastEvent}
        onReconnectRealtime={reconnectRealtime}
      />

      {activeJiraSources.length > 1 && (
        <JiraSourceSwitcher
          sources={activeJiraSources}
          value={effectiveSourceId}
          onChange={(val) => {
            jiraSource.selectSource(val);
            setUserSelectedSprintId(null);
            setActiveIssueForModal(null);
            setIsIssueModalOpen(false);
            setActiveSprintForModal(null);
            setIsSprintModalOpen(false);
          }}
        />
      )}

      {isLoadingTasks && (
        <div className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
          <Loader2Icon className="w-4 h-4 animate-spin" />
          <span>Đang tải danh sách Jira tasks đã chiếu từ máy chủ...</span>
        </div>
      )}

      {isInvalidCourse && (
        <div className="p-6 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Lớp học phần không còn khả dụng</p>
          <p className="text-xs text-muted-foreground">Hãy chọn lại lớp học phần trước khi quản lý Sprint.</p>
        </div>
      )}

      {!isInvalidCourse && !isLoadingTasks && !projectId && (
        <div className="p-6 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Chưa xác định dự án nhóm</p>
          <p className="text-xs text-muted-foreground">Vui lòng vào menu Dự án để khởi tạo hoặc kiểm tra quyền phân nhóm.</p>
        </div>
      )}

      {!isLoadingTasks && Boolean(projectId) && isTasksError && (
        <div className="p-6 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 text-center space-y-3">
          <AlertCircleIcon className="w-6 h-6 text-destructive mx-auto" />
          <div>
            <p className="text-sm font-bold text-foreground">Không tải được dữ liệu Sprint</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getApiErrorMessage(tasksError, "Vui lòng thử lại hoặc kiểm tra kết nối Jira của dự án.")}
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetchTasks()} className="cursor-pointer text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {!isLoadingSprints && Boolean(projectId) && isSprintsError && (
        <div className="p-6 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 text-center space-y-3">
          <AlertCircleIcon className="w-6 h-6 text-destructive mx-auto" />
          <div>
            <p className="text-sm font-bold text-foreground">Không tải được danh sách Sprint</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getApiErrorMessage(sprintsError, "Vui lòng thử lại hoặc kiểm tra kết nối Jira của dự án.")}
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetchSprints()} className="cursor-pointer text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {Boolean(projectId) && !isJiraConnected && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              Dự án nhóm chưa kết nối Jira Workspace hoặc liên kết Jira đã hết hạn. Các tác vụ Sprint & Backlog đang hoạt động trên dữ liệu chiếu cục bộ.
            </span>
          </div>
          <Link href={studentCoursePath("/student/project-info", courseId)} prefetch={true} className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-xl font-bold bg-card border-amber-500/40 text-amber-900 dark:text-amber-100 hover:bg-amber-500/20 cursor-pointer shadow-xs"
            >
              Kết nối Jira ngay
            </Button>
          </Link>
        </div>
      )}

      {hasActiveSyncJob && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-xs text-primary">
          <Loader2Icon className="size-4 animate-spin shrink-0" />
          <span>Dữ liệu Jira/GitHub đang được đồng bộ. Bảng tiến độ sẽ tự làm mới khi hoàn tất.</span>
        </div>
      )}

      {!isTasksError && !isSprintsError && activeView === "BOARD" && (
        <SprintBoardView
          issues={boardIssues}
          onIssueClick={handleOpenIssueModal}
          onMoveTaskStatus={handleMoveTaskStatus}
          isTeamLeader={isTeamLeader}
          currentUserStudentCode={currentUserStudentCode}
          onSwitchToBacklog={() => setActiveView("BACKLOG")}
          totalBacklogCount={productBacklogCount}
          isLoading={isLoadingSprints && sprints.length === 0}
          courseId={courseId}
        />
      )}

      {!isTasksError && !isSprintsError && activeView === "BACKLOG" && (
        <SprintBacklogView
          sprints={sprints}
          issues={filteredIssues}
          jiraIntegrationId={effectiveSourceId}
          onIssueClick={handleOpenIssueModal}
          onCreateIssueClick={(targetSprintId) => {
            setActiveIssueForModal(null);
            setDefaultSprintIdForModal(targetSprintId);
            setIsIssueModalOpen(true);
          }}
          onCreateSprintClick={() => {
            setActiveSprintForModal(null);
            setIsSprintModalOpen(true);
          }}
          onMoveTaskSprint={handleMoveTaskSprint}
          onStartSprint={async (sprintId) => {
            if (projectId) {
              await patchSprintMutation.mutateAsync({
                projectId,
                sprintId,
                data: { state: "active" },
              });
            }
          }}
          onCompleteSprint={async (sprintId) => {
            if (projectId) {
              await patchSprintMutation.mutateAsync({
                projectId,
                sprintId,
                data: { state: "closed" },
              });
            }
          }}
          onEditSprint={(sprint) => {
            setActiveSprintForModal(sprint);
            setIsSprintModalOpen(true);
          }}
          updatingSprintId={patchSprintMutation.isPending ? patchSprintMutation.variables?.sprintId : null}
          isTeamLeader={isTeamLeader}
          currentUserStudentCode={currentUserStudentCode}
          courseId={courseId}
          projectId={projectId}
          teamMembers={teamMembers}
          assignableUsers={taskOptions?.assignableUsers}
          onStatusChange={handleMoveTaskStatus}
        />
      )}

      {!isTasksError && !isSprintsError && activeView === "TIMELINE" && (
        <SprintTimelineView
          sprints={sprints}
          epics={epics}
          isTeamLeader={isTeamLeader}
          onCreateSprintClick={() => {
            setActiveSprintForModal(null);
            setIsSprintModalOpen(true);
          }}
        />
      )}

      {!isTasksError && !isSprintsError && activeView === "ANALYTICS" && courseId && team?.teamId && (
        <div className="space-y-6">
          <SprintBurndownChart
            courseId={courseId}
            teamId={team.teamId}
            sprints={sprints.map((s) => ({
              id: s.id,
              name: s.name,
              startDate: s.startDate,
              endDate: s.endDate,
              state: s.status,
            }))}
            initialSprintId={selectedSprintId === "backlog" ? undefined : selectedSprintId}
            onSelectSprint={setUserSelectedSprintId}
          />
          <ActivityHeatmapGrid
            courseId={courseId}
            teamId={team.teamId}
            sprints={sprints.map((s) => ({
              id: s.id,
              name: s.name,
              startDate: s.startDate,
              endDate: s.endDate,
            }))}
            students={teamMembers.map((m) => ({
              studentId: m.studentCode,
              fullName: m.name,
              studentCode: m.studentCode,
              avatar: m.avatar,
            }))}
            initialSprintId={selectedSprintId === "backlog" ? undefined : selectedSprintId}
          />
        </div>
      )}

      {isIssueModalOpen && (
        <IssueDetailsModal
          key={activeIssueForModal?.id || `new-${defaultSprintIdForModal || "default"}`}
          isOpen={isIssueModalOpen}
          issue={activeIssueForModal}
          projectId={projectId}
          isJiraConnected={isJiraConnected}
          defaultJiraIntegrationId={effectiveSourceId}
          defaultSprintId={defaultSprintIdForModal}
          sprints={sprints}
          teamMembers={teamMembers}
          availableLabels={availableLabels}
          onClose={() => setIsIssueModalOpen(false)}
          onSave={handleSaveIssue}
          onDelete={handleDeleteIssue}
          isTeamLeader={isTeamLeader}
          currentUserStudentCode={currentUserStudentCode}
        />
      )}

      {isSprintModalOpen && (
        <SprintModal
          key={activeSprintForModal?.id || "new-sprint"}
          isOpen={isSprintModalOpen}
          sprint={activeSprintForModal}
          projectId={projectId}
          jiraIntegrationId={effectiveSourceId}
          onClose={() => setIsSprintModalOpen(false)}
          onSave={() => {
            setIsSprintModalOpen(false);
          }}
        />
      )}
    </div>
  );
}