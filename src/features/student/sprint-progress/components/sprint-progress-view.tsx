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
import { Loader2Icon, AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SprintProgressView() {
  const { user: authUser, selectedCourse } = useAuthStore();
  const { data: apiCourses = [] } = useStudentCourses({ enabled: authUser?.role === "STUDENT" && !selectedCourse });
  const effectiveCourse = selectedCourse || apiCourses[0];
  const courseId = effectiveCourse?.courseId || (effectiveCourse as unknown as { id?: string })?.id || "";

  const { data: team } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const projectId = team?.projectId || effectiveCourse?.projectId || "";

  const {
    data: projectTasks = [],
    isLoading: isLoadingTasks,
    isRefetching: isRefetchingTasks,
    refetch: refetchTasks,
  } = useProjectTasks(projectId, { enabled: Boolean(projectId) });

  const currentUserStudentCode = authUser?.studentCode || "";
  const isLeaderInGroup = effectiveCourse && "myGroup" in effectiveCourse && effectiveCourse.myGroup?.role === "LEADER";
  const isTeamLeader = team?.myRole === "LEADER" || Boolean(isLeaderInGroup) || true;

  const teamMembers = (team?.members || []).map((m) => ({
    id: m.studentCode,
    studentCode: m.studentCode,
    name: m.fullName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.fullName || m.studentCode)}`,
  }));

  const [sprints, setSprints] = useState<Sprint[]>(MOCK_SPRINTS);
  const [selectedSprintId, setSelectedSprintId] = useState<string>("sprint-03");
  const [activeView, setActiveView] = useState<"BOARD" | "BACKLOG" | "TIMELINE">("BOARD");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

  const [localTaskOverrides, setLocalTaskOverrides] = useState<Record<string, Partial<SprintIssue>>>({});
  const [localCustomIssues, setLocalCustomIssues] = useState<SprintIssue[]>([]);

  const issues: SprintIssue[] = useMemo(() => {
    const fromApi = projectTasks.map((t) => {
      const mapped = mapProjectTaskToSprintIssue(t, teamMembers, selectedSprintId);
      const override = localTaskOverrides[t.id];
      return override ? { ...mapped, ...override } : mapped;
    });
    return [...fromApi, ...localCustomIssues];
  }, [projectTasks, teamMembers, selectedSprintId, localTaskOverrides, localCustomIssues]);

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
    return issues.filter((issue) => {
      if (activeView === "BOARD" && issue.sprintId !== selectedSprintId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!issue.key.toLowerCase().includes(q) && !issue.summary.toLowerCase().includes(q)) return false;
      }
      if (selectedAssigneeId && issue.assignee.id !== selectedAssigneeId) return false;
      return true;
    });
  }, [issues, activeView, selectedSprintId, searchQuery, selectedAssigneeId]);

  const handleMoveTaskStatus = (issueId: string, newStatus: IssueStatus) => {
    setLocalTaskOverrides((prev) => ({ ...prev, [issueId]: { ...prev[issueId], status: newStatus } }));
    setLocalCustomIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
  };

  const handleMoveTaskSprint = (issueId: string, newSprintId: string) => {
    setLocalTaskOverrides((prev) => ({ ...prev, [issueId]: { ...prev[issueId], sprintId: newSprintId } }));
    setLocalCustomIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, sprintId: newSprintId } : i)));
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <SprintHeader
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        onSelectSprint={setSelectedSprintId}
        activeView={activeView}
        onSelectView={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssigneeId={selectedAssigneeId}
        onSelectAssignee={setSelectedAssigneeId}
        teamMembers={teamMembers}
        isTeamLeader={isTeamLeader}
        onToggleTeamLeader={() => {}}
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

      {activeView === "BOARD" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground font-mono">
              Tổng cộng: {filteredIssues.length} đầu việc Jira
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void refetchTasks()}
              disabled={isRefetchingTasks}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            >
              <RefreshCwIcon className={`w-3 h-3 ${isRefetchingTasks ? "animate-spin text-primary" : ""}`} />
              <span>Làm mới tasks</span>
            </Button>
          </div>
          <SprintBoardView
            issues={filteredIssues}
            onIssueClick={handleOpenIssueModal}
            onMoveTaskStatus={handleMoveTaskStatus}
            isTeamLeader={isTeamLeader}
            currentUserStudentCode={currentUserStudentCode}
          />
        </div>
      )}

      {activeView === "BACKLOG" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground font-mono">
              Backlog Jira Tasks: {filteredIssues.length} công việc
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void refetchTasks()}
              disabled={isRefetchingTasks}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            >
              <RefreshCwIcon className={`w-3 h-3 ${isRefetchingTasks ? "animate-spin text-primary" : ""}`} />
              <span>Làm mới Backlog</span>
            </Button>
          </div>
          <SprintBacklogView
            sprints={sprints}
            issues={filteredIssues}
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
            onStartSprint={(sprintId) => setSprints((p) => p.map((s) => (s.id === sprintId ? { ...s, status: "ACTIVE" } : s)))}
            onCompleteSprint={(sprintId) => setSprints((p) => p.map((s) => (s.id === sprintId ? { ...s, status: "COMPLETED" } : s)))}
            onEditSprint={(sprint) => {
              setActiveSprintForModal(sprint);
              setIsSprintModalOpen(true);
            }}
            isTeamLeader={isTeamLeader}
            currentUserStudentCode={currentUserStudentCode}
          />
        </div>
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
        onClose={() => setIsSprintModalOpen(false)}
        onSave={(saved) => setSprints((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))}
      />
    </div>
  );
}
