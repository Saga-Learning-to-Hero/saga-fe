"use client";

import { useState } from "react";
import { MOCK_SPRINTS, MOCK_EPICS, MOCK_ISSUES } from "../data/mock-sprint-data";
import type { SprintIssue, Sprint, IssueStatus } from "../types/sprint-progress";
import { SprintHeader } from "./sprint-header";
import { SprintBoardView } from "./sprint-board-view";
import { SprintBacklogView } from "./sprint-backlog-view";
import { SprintTimelineView } from "./sprint-timeline-view";
import { IssueDetailsModal } from "./issue-details-modal";
import { SprintModal } from "./sprint-modal";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const TEAM_MEMBERS = [
  {
    id: "sv-01",
    studentCode: "HE170504",
    name: "Lê Hoàng Hải",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user",
  },
  {
    id: "sv-02",
    studentCode: "SE171234",
    name: "Nguyễn Đức Trung",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=trungnd",
  },
  {
    id: "sv-03",
    studentCode: "SE173456",
    name: "Phạm Phương Anh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anhpt",
  },
  {
    id: "sv-04",
    studentCode: "SE172345",
    name: "Vũ Tuấn Minh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minhvt",
  },
  {
    id: "sv-05",
    studentCode: "SE175678",
    name: "Đỗ Thùy Linh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linhdt",
  },
];

export function SprintProgressView() {
  const authUser = useAuthStore((state) => state.user);
  const currentUserStudentCode = authUser?.studentCode || "HE170504";

  // Team Leader state (Default true for testing)
  const [isTeamLeader, setIsTeamLeader] = useState<boolean>(true);

  const [sprints, setSprints] = useState<Sprint[]>(MOCK_SPRINTS);
  const [issues, setIssues] = useState<SprintIssue[]>(MOCK_ISSUES);
  const [selectedSprintId, setSelectedSprintId] = useState<string>("sprint-03");
  const [activeView, setActiveView] = useState<"BOARD" | "BACKLOG" | "TIMELINE">("BOARD");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

  // Modals state
  const [activeIssueForModal, setActiveIssueForModal] = useState<SprintIssue | null>(null);
  const [defaultSprintIdForModal, setDefaultSprintIdForModal] = useState<string | undefined>(undefined);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);

  const [activeSprintForModal, setActiveSprintForModal] = useState<Sprint | null>(null);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState<boolean>(false);

  // Filter Issues
  const filteredIssues = issues.filter((issue) => {
    // Sprint Filter (Only in Board view, Backlog shows all sprints)
    if (activeView === "BOARD" && issue.sprintId !== selectedSprintId) {
      return false;
    }
    // Search Query
    if (
      searchQuery.trim() &&
      !issue.key.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !issue.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Assignee Filter
    if (selectedAssigneeId && issue.assignee.id !== selectedAssigneeId) {
      return false;
    }
    return true;
  });

  // ── Drag & Drop Task Status Handler (Board) ────────────────────────
  const handleMoveTaskStatus = (issueId: string, newStatus: IssueStatus) => {
    // Check permission
    const targetIssue = issues.find((i) => i.id === issueId);
    if (!targetIssue) return;
    const canMove = isTeamLeader || targetIssue.assignee.studentCode === currentUserStudentCode;
    if (!canMove) return;

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
  };

  // ── Drag & Drop Task Sprint Handler (Backlog) ──────────────────────
  const handleMoveTaskSprint = (issueId: string, newSprintId: string) => {
    // Check permission
    const targetIssue = issues.find((i) => i.id === issueId);
    if (!targetIssue) return;
    const canMove = isTeamLeader || targetIssue.assignee.studentCode === currentUserStudentCode;
    if (!canMove) return;

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, sprintId: newSprintId } : issue
      )
    );
  };

  // ── Task CRUD ──────────────────────────────────────────────────────
  const handleSaveIssue = (savedIssue: SprintIssue) => {
    setIssues((prev) => {
      const exists = prev.some((i) => i.id === savedIssue.id);
      if (exists) {
        return prev.map((i) => (i.id === savedIssue.id ? savedIssue : i));
      }
      return [savedIssue, ...prev];
    });
  };

  const handleDeleteIssue = (issueId: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
  };

  // ── Sprint CRUD & Lifecycle (Leader Only) ───────────────────────────
  const handleSaveSprint = (savedSprint: Sprint) => {
    if (!isTeamLeader) return;
    setSprints((prev) => {
      const exists = prev.some((s) => s.id === savedSprint.id);
      if (exists) {
        return prev.map((s) => (s.id === savedSprint.id ? savedSprint : s));
      }
      return [...prev, savedSprint];
    });
  };

  const handleStartSprint = (sprintId: string) => {
    if (!isTeamLeader) return;
    setSprints((prev) =>
      prev.map((s) => (s.id === sprintId ? { ...s, status: "ACTIVE" } : s))
    );
    setSelectedSprintId(sprintId);
  };

  const handleCompleteSprint = (sprintId: string) => {
    if (!isTeamLeader) return;
    const nextSprint = sprints.find((s) => s.status === "PLANNED") || sprints[sprints.length - 1];

    setSprints((prev) =>
      prev.map((s) => (s.id === sprintId ? { ...s, status: "COMPLETED" } : s))
    );

    if (nextSprint && nextSprint.id !== sprintId) {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.sprintId === sprintId && issue.status !== "DONE"
            ? { ...issue, sprintId: nextSprint.id }
            : issue
        )
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header Toolbar */}
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
        teamMembers={TEAM_MEMBERS}
        isTeamLeader={isTeamLeader}
        onToggleTeamLeader={() => setIsTeamLeader((prev) => !prev)}
      />

      {/* Main Active View */}
      {activeView === "BOARD" && (
        <SprintBoardView
          issues={filteredIssues}
          onIssueClick={(issue) => {
            setActiveIssueForModal(issue);
            setDefaultSprintIdForModal(undefined);
            setIsIssueModalOpen(true);
          }}
          onMoveTaskStatus={handleMoveTaskStatus}
          isTeamLeader={isTeamLeader}
          currentUserStudentCode={currentUserStudentCode}
        />
      )}

      {activeView === "BACKLOG" && (
        <SprintBacklogView
          sprints={sprints}
          issues={filteredIssues}
          onIssueClick={(issue) => {
            setActiveIssueForModal(issue);
            setDefaultSprintIdForModal(undefined);
            setIsIssueModalOpen(true);
          }}
          onCreateIssueClick={(targetSprintId) => {
            setActiveIssueForModal(null);
            setDefaultSprintIdForModal(targetSprintId);
            setIsIssueModalOpen(true);
          }}
          onCreateSprintClick={() => {
            if (isTeamLeader) {
              setActiveSprintForModal(null);
              setIsSprintModalOpen(true);
            }
          }}
          onMoveTaskSprint={handleMoveTaskSprint}
          onStartSprint={handleStartSprint}
          onCompleteSprint={handleCompleteSprint}
          onEditSprint={(sprint) => {
            if (isTeamLeader) {
              setActiveSprintForModal(sprint);
              setIsSprintModalOpen(true);
            }
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
            if (isTeamLeader) {
              setActiveSprintForModal(null);
              setIsSprintModalOpen(true);
            }
          }}
        />
      )}

      {/* Issue Details & Create Modal */}
      <IssueDetailsModal
        isOpen={isIssueModalOpen}
        issue={activeIssueForModal}
        defaultSprintId={defaultSprintIdForModal}
        sprints={sprints}
        teamMembers={TEAM_MEMBERS}
        onClose={() => setIsIssueModalOpen(false)}
        onSave={handleSaveIssue}
        onDelete={handleDeleteIssue}
        isTeamLeader={isTeamLeader}
        currentUserStudentCode={currentUserStudentCode}
      />

      {/* Sprint Modal (Create & Edit) */}
      <SprintModal
        isOpen={isSprintModalOpen}
        sprint={activeSprintForModal}
        onClose={() => setIsSprintModalOpen(false)}
        onSave={handleSaveSprint}
      />
    </div>
  );
}
