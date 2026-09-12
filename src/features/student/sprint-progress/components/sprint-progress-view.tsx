"use client";

import { useState, useMemo } from "react";
import { MOCK_SPRINTS, MOCK_EPICS } from "../data/mock-sprint-data";
import type { SprintIssue, Sprint, IssueStatus } from "../types/sprint-progress";
import { SprintHeader } from "./sprint-header";
import { SprintBoardView } from "./sprint-board-view";
import { SprintBacklogView } from "./sprint-backlog-view";
import { SprintTimelineView } from "./sprint-timeline-view";
import { IssueDetailsModal } from "./issue-details-modal";
import { SprintModal } from "./sprint-modal";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useStudentMyTeam, useStudentCourses } from "@/features/student/courses/hooks/use-student-courses";
import { useProjectTasks } from "@/features/student/project/hooks/useProjectSync";
import { mapProjectTaskToSprintIssue } from "../lib/task-mapper";
import { Loader2Icon, AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useProjectSprints,
  useAssignTaskToSprint,
  usePatchSprint,
} from "../hooks/use-project-sprints";
import { useTransitionTask } from "../hooks/use-project-tasks";
import { useProjectIntegrations } from "@/features/student/project/hooks/useProjectIntegrations";
import { toast } from "sonner";

export function SprintProgressView() {
  const { user: authUser, selectedCourse } = useAuthStore();
  const { data: apiCourses = [] } = useStudentCourses({ enabled: authUser?.role === "STUDENT" && !selectedCourse });
  const effectiveCourse = selectedCourse || apiCourses[0];
  const courseId = effectiveCourse?.courseId || (effectiveCourse as unknown as { id?: string })?.id || "";

  const { data: team } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const projectId = team?.projectId || effectiveCourse?.projectId || "";

  const { data: projectIntegrations } = useProjectIntegrations(projectId, {
    enabled: Boolean(projectId),
  });
  const isJiraConnected = projectIntegrations?.jira?.status === "ACTIVE";

  const {
    data: projectTasks = [],
    isLoading: isLoadingTasks,
    isRefetching: isRefetchingTasks,
    refetch: refetchTasks,
  } = useProjectTasks(projectId, { enabled: Boolean(projectId) });

  const { data: apiSprints = [] } = useProjectSprints(projectId, {
    enabled: Boolean(projectId && isJiraConnected),
  });
  const transitionTaskMutation = useTransitionTask();
  const assignTaskToSprintMutation = useAssignTaskToSprint();
  const patchSprintMutation = usePatchSprint();

  const currentUserStudentCode = authUser?.studentCode || "";
  const isLeaderInGroup = effectiveCourse && "myGroup" in effectiveCourse && effectiveCourse.myGroup?.role === "LEADER";
  const actualIsLeader = team?.myRole === "LEADER" || Boolean(isLeaderInGroup);
  const [customLeaderOverride, setCustomLeaderOverride] = useState<boolean | null>(null);
  const isTeamLeader = customLeaderOverride !== null ? customLeaderOverride : actualIsLeader;

  const teamMembers = (team?.members || []).map((m) => ({
    id: m.studentCode,
    studentCode: m.studentCode,
    name: m.fullName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.fullName || m.studentCode)}`,
  }));

  const [userSelectedSprintId, setUserSelectedSprintId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"BOARD" | "BACKLOG" | "TIMELINE">("BOARD");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

  const [localTaskOverrides, setLocalTaskOverrides] = useState<Record<string, Partial<SprintIssue>>>({});
  const [localCustomIssues, setLocalCustomIssues] = useState<SprintIssue[]>([]);

  const rawIssues: SprintIssue[] = useMemo(() => {
    const fromApi = projectTasks.map((t) => {
      const mapped = mapProjectTaskToSprintIssue(t, teamMembers);
      const override = localTaskOverrides[t.id];
      return override ? { ...mapped, ...override } : mapped;
    });
    return [...fromApi, ...localCustomIssues];
  }, [projectTasks, teamMembers, localTaskOverrides, localCustomIssues]);

  const sprints: Sprint[] = useMemo(() => {
    if (!apiSprints || apiSprints.length === 0) {
      return MOCK_SPRINTS;
    }
    return apiSprints.map((s) => {
      const sId = String(s.id);
      const sprintIssues = rawIssues.filter((i) => i.sprintId === sId);
      const completedIssues = sprintIssues.filter((i) => i.status === "DONE");
      const totalPoints = sprintIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
      const completedPoints = completedIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
      return {
        id: sId,
        name: s.name,
        goal: s.goal || "",
        startDate: s.startDate ? s.startDate.split("T")[0] : "",
        endDate: s.endDate ? s.endDate.split("T")[0] : "",
        status: s.state === "active" ? "ACTIVE" : s.state === "closed" ? "COMPLETED" : "PLANNED",
        totalStoryPoints: totalPoints,
        completedStoryPoints: completedPoints,
      };
    });
  }, [apiSprints, rawIssues]);

  const selectedSprintId = useMemo(() => {
    if (userSelectedSprintId && sprints.some((s) => s.id === userSelectedSprintId)) {
      return userSelectedSprintId;
    }
    const active = sprints.find((s) => s.status === "ACTIVE") || sprints[0];
    return active ? active.id : sprints[0]?.id || "backlog";
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

  const filteredIssues = useMemo(() => {
    return rawIssues.filter((issue) => {
      if (activeView === "BOARD" && issue.sprintId !== selectedSprintId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!issue.key.toLowerCase().includes(q) && !issue.summary.toLowerCase().includes(q)) return false;
      }
      if (selectedAssigneeId && issue.assignee.id !== selectedAssigneeId) return false;
      return true;
    });
  }, [rawIssues, activeView, selectedSprintId, searchQuery, selectedAssigneeId]);

  const handleMoveTaskStatus = async (issueId: string, newStatus: IssueStatus) => {
    const previousOverride = localTaskOverrides[issueId];
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
    }
  };

  const handleMoveTaskSprint = async (issueId: string, newSprintId: string) => {
    setLocalTaskOverrides((prev) => ({ ...prev, [issueId]: { ...prev[issueId], sprintId: newSprintId } }));
    setLocalCustomIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, sprintId: newSprintId } : i)));

    if (!projectId) return;

    try {
      const targetSprint = newSprintId === "backlog" ? null : Number(newSprintId) || newSprintId;
      await assignTaskToSprintMutation.mutateAsync({
        projectId,
        taskId: issueId,
        sprintId: targetSprint,
      });
    } catch {
      toast.error("Không thể gán Task vào Sprint trên Jira.");
    }
  };

  const handleSaveIssue = (savedIssue: SprintIssue) => {
    setLocalCustomIssues((prev) => {
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

  const courseCode = effectiveCourse?.subjectCode || "SWP391";
  const projectName = team?.teamName || projectIntegrations?.jira?.projectKey || "SAGA Team";

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
        onToggleTeamLeader={() => setCustomLeaderOverride((prev) => (prev === null ? !actualIsLeader : !prev))}
        courseCode={courseCode}
        projectName={projectName}
        totalTasksCount={filteredIssues.length}
        onRefreshTasks={() => void refetchTasks()}
        isRefreshingTasks={isRefetchingTasks}
      />

      {isLoadingTasks && (
        <div className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
          <Loader2Icon className="w-4 h-4 animate-spin" />
          <span>Đang tải danh sách Jira tasks đã chiếu từ máy chủ...</span>
        </div>
      )}

      {!isLoadingTasks && !projectId && (
        <div className="p-6 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
          <AlertCircleIcon className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-foreground">Chưa xác định dự án nhóm</p>
          <p className="text-xs text-muted-foreground">Vui lòng vào menu Dự án để khởi tạo hoặc kiểm tra quyền phân nhóm.</p>
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
          <Link href="/student/project-info" prefetch={true} className="shrink-0">
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

      {activeView === "BOARD" && (
        <SprintBoardView
          issues={filteredIssues}
          onIssueClick={handleOpenIssueModal}
          onMoveTaskStatus={handleMoveTaskStatus}
          isTeamLeader={isTeamLeader}
          currentUserStudentCode={currentUserStudentCode}
        />
      )}

      {activeView === "BACKLOG" && (
        <SprintBacklogView
          sprints={sprints}
          issues={rawIssues}
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
          isTeamLeader={isTeamLeader}
          currentUserStudentCode={currentUserStudentCode}
        />
      )}

      {activeView === "TIMELINE" && (
        <SprintTimelineView
          sprints={sprints}
          epics={MOCK_EPICS}
          isTeamLeader={isTeamLeader}
          onCreateSprintClick={() => {
            setActiveSprintForModal(null);
            setIsSprintModalOpen(true);
          }}
        />
      )}

      <IssueDetailsModal
        isOpen={isIssueModalOpen}
        issue={activeIssueForModal}
        projectId={projectId}
        isJiraConnected={isJiraConnected}
        defaultSprintId={defaultSprintIdForModal}
        sprints={sprints}
        teamMembers={teamMembers}
        onClose={() => setIsIssueModalOpen(false)}
        onSave={handleSaveIssue}
        onDelete={handleDeleteIssue}
        isTeamLeader={isTeamLeader}
        currentUserStudentCode={currentUserStudentCode}
      />

      <SprintModal
        isOpen={isSprintModalOpen}
        sprint={activeSprintForModal}
        projectId={projectId}
        onClose={() => setIsSprintModalOpen(false)}
        onSave={() => {
          setIsSprintModalOpen(false);
        }}
      />
    </div>
  );
}
