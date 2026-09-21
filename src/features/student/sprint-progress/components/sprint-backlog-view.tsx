"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckCircle2Icon,
  CalendarIcon,
  PlayIcon,
  Edit3Icon,
  LockIcon,
  LayersIcon,
  GitCommitIcon,
  GripVerticalIcon,
  NetworkIcon,
  GitBranchIcon,
  FlameIcon,
  AlertTriangleIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import type { Sprint, SprintIssue } from "../types/sprint-progress";
import { renderTypeIcon, renderPriorityIcon } from "./sprint-board-view";
import { groupSprintIssuesByParent } from "../lib/issue-collection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickCreateTask } from "./quick-create-task";
import { TaskDueDate } from "./task-due-date";
import { QuickStoryPointsEdit } from "./quick-story-points-edit";
import { QuickStatusEdit } from "./quick-status-edit";
import {
  QuickAssigneeEdit,
  type AssigneeMemberInfo,
  type JiraAssignableUserInfo,
} from "./quick-assignee-edit";
import type { IssueStatus } from "../types/sprint-progress";

interface SprintBacklogViewProps {
  sprints: Sprint[];
  issues: SprintIssue[];
  onIssueClick: (issue: SprintIssue) => void;
  onCreateIssueClick: (sprintId?: string) => void;
  onCreateSprintClick: () => void;
  onMoveTaskSprint: (issueId: string, newSprintId: string) => void;
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (sprintId: string) => void;
  onEditSprint: (sprint: Sprint) => void;
  onStatusChange?: (issueId: string, newStatus: IssueStatus) => Promise<void> | void;
  updatingSprintId?: string | null;
  isTeamLeader: boolean;
  currentUserStudentCode: string;
  courseId: string;
  projectId?: string | null;
  jiraIntegrationId?: string;
  teamMembers?: AssigneeMemberInfo[];
  assignableUsers?: JiraAssignableUserInfo[];
}

export function SprintBacklogView({
  sprints,
  issues,
  onIssueClick,
  onCreateIssueClick,
  onCreateSprintClick,
  onMoveTaskSprint,
  onStartSprint,
  onCompleteSprint,
  onEditSprint,
  onStatusChange,
  updatingSprintId,
  isTeamLeader,
  currentUserStudentCode,
  courseId,
  projectId,
  jiraIntegrationId,
  teamMembers,
  assignableUsers,
}: SprintBacklogViewProps) {
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
  const [expandedSubtaskParents, setExpandedSubtaskParents] = useState<Record<string, boolean>>({});
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const toggleSubtasks = (parentKey: string) => {
    setExpandedSubtaskParents((prev) => ({ ...prev, [parentKey]: !prev[parentKey] }));
  };

  const handleDragStart = (e: React.DragEvent, issue: SprintIssue) => {
    const canDrag = isTeamLeader || issue.assignee.studentCode === currentUserStudentCode;
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("issueId", issue.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedIssueId(issue.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetSprintId: string) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData("issueId") || draggedIssueId;
    if (issueId) {
      onMoveTaskSprint(issueId, targetSprintId);
    }
    setDraggedIssueId(null);
  };

  const backlogSprints = sprints.filter((s) => s.status !== "COMPLETED");

  const productBacklogIssues = issues.filter(
    (i) => !i.sprintId || i.sprintId === "backlog" || !sprints.some((s) => s.id === i.sprintId)
  );
  const productBacklogHierarchy = groupSprintIssuesByParent(productBacklogIssues);
  const isBacklogCollapsed = Boolean(collapsedSprints["product-backlog"]);
  const backlogTotalSP = productBacklogHierarchy.workItems.reduce((sum, i) => sum + i.storyPoints, 0);

  const renderTaskItem = (
    issue: SprintIssue,
    isNestedSubtask = false,
    subtaskCount = 0
  ) => {
    const canDrag = !isNestedSubtask && (isTeamLeader || issue.assignee.studentCode === currentUserStudentCode);
    const isMsrAnomaly = issue.status === "DONE" && (issue.githubCommitCount ?? 0) === 0;
    const areSubtasksExpanded = Boolean(expandedSubtaskParents[issue.key]);

    return (
      <div
        key={issue.id}
        draggable={canDrag}
        onDragStart={(e) => handleDragStart(e, issue)}
        onClick={() => onIssueClick(issue)}
        className={`px-3.5 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between gap-3 group border-b border-border/40 last:border-b-0 ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer opacity-90"
          } ${isMsrAnomaly ? "bg-amber-500/5" : ""} ${isNestedSubtask ? "pl-9 sm:pl-12 bg-cyan-500/[0.035]" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isNestedSubtask ? (
            <span title="Subtask của task cha">
              <GitBranchIcon className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            </span>
          ) : canDrag ? (
            <GripVerticalIcon className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0 -ml-1" />
          ) : (
            <span title="Chỉ đọc (Task của thành viên khác)">
              <LockIcon className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            </span>
          )}

          {!isNestedSubtask && subtaskCount > 0 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleSubtasks(issue.key);
              }}
              aria-expanded={areSubtasksExpanded}
              aria-label={`${areSubtasksExpanded ? "Thu gọn" : "Mở rộng"} ${subtaskCount} subtask của ${issue.key}`}
              title={`${areSubtasksExpanded ? "Thu gọn" : "Mở rộng"} ${subtaskCount} subtasks`}
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-cyan-600 hover:bg-cyan-500/10 dark:text-cyan-300"
            >
              {areSubtasksExpanded ? (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronRightIcon className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {!isNestedSubtask && <div className="shrink-0">{renderTypeIcon(issue.type)}</div>}

          <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors shrink-0">
            {issue.key}
          </span>

          {issue.superseded && (
            <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0 shrink-0">
              Lịch sử
            </Badge>
          )}

          {issue.migratedTo && (
            <span className="text-[10px] font-mono text-muted-foreground shrink-0 bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
              ➔ {issue.migratedTo.externalKey}
            </span>
          )}

          {issue.migratedFrom && (
            <span className="text-[10px] font-mono text-muted-foreground shrink-0 bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
              từ {issue.migratedFrom.externalKey}
            </span>
          )}

          <span className="text-xs font-semibold text-foreground truncate">
            {issue.summary}
          </span>

          {!isNestedSubtask && subtaskCount > 0 && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-cyan-500/25 bg-cyan-500/10 px-1.5 py-0.2 text-[10px] font-mono font-medium text-cyan-700 dark:text-cyan-300">
              {subtaskCount} subtask{subtaskCount > 1 ? "s" : ""}
            </span>
          )}

          {isNestedSubtask && (
            <Badge variant="outline" className="hidden sm:inline-flex border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[9px] font-semibold px-1.5 py-0">
              Subtask
            </Badge>
          )}

          {issue.labels && issue.labels.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {issue.labels.map((lbl, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[9px] font-mono px-1.5 py-0 bg-muted/80 text-muted-foreground border-border/40"
                >
                  #{lbl}
                </Badge>
              ))}
            </div>
          )}

          {issue.epic && (
            <Badge
              style={{ backgroundColor: `${issue.epic.color}15`, color: issue.epic.color }}
              className="border-0 text-[10px] font-bold px-2 py-0.2 shrink-0 hidden md:inline-flex"
            >
              {issue.epic.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          {renderPriorityIcon(issue.priority)}

          <TaskDueDate dueDate={issue.dueDate} status={issue.status} />

          {issue.githubCommitCount && issue.githubCommitCount > 0 ? (
            <span
              title={`Có ${issue.githubCommitCount} commit liên kết`}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold"
            >
              <GitCommitIcon className="w-3 h-3" />
              {issue.githubCommitCount}
            </span>
          ) : isMsrAnomaly ? (
            <span
              title="Cảnh báo MSR Anomaly: Task Done nhưng chưa có commit liên kết"
              className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-semibold"
            >
              <AlertTriangleIcon className="w-3 h-3" />
              0 commit
            </span>
          ) : null}

          <Link
            href={`/student/graph?courseId=${encodeURIComponent(courseId)}&taskId=${encodeURIComponent(issue.key)}`}
            onClick={(e) => e.stopPropagation()}
            title="Xem minh chứng trên Đồ thị Neo4j"
            className="text-muted-foreground/60 hover:text-primary transition-colors p-0.5 rounded"
          >
            <NetworkIcon className="w-3 h-3" />
          </Link>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-0.5"
          >
            <QuickStatusEdit
              issueId={issue.id}
              issueKey={issue.key}
              status={issue.status}
              isTeamLeader={isTeamLeader}
              isOwner={issue.assignee?.studentCode === currentUserStudentCode}
              onStatusChange={onStatusChange}
            />

            <QuickStoryPointsEdit
              issueId={issue.id}
              issueKey={issue.key}
              storyPoints={issue.storyPoints}
              projectId={projectId}
              isTeamLeader={isTeamLeader}
            />

            <QuickAssigneeEdit
              issueId={issue.id}
              issueKey={issue.key}
              currentAssignee={issue.assignee}
              teamMembers={teamMembers}
              assignableUsers={assignableUsers}
              projectId={projectId}
              isTeamLeader={isTeamLeader}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <LayersIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-foreground tracking-tight">
              Quản lý Sprints & Kế hoạch Backlog
            </h2>
            <p className="text-xs text-muted-foreground">
              Phân bổ đầu việc từ Backlog vào các Sprint thực thi
            </p>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Badge variant="secondary" className="text-[10px] font-mono font-semibold px-2 py-0.2">
              {backlogSprints.length} sprints
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono font-semibold px-2 py-0.2">
              {productBacklogHierarchy.workItems.length} backlog tasks
            </Badge>
          </div>
        </div>

        {isTeamLeader ? (
          <Button
            type="button"
            onClick={onCreateSprintClick}
            size="sm"
            className="h-8 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs px-3.5 shrink-0"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Tạo Sprint mới</span>
          </Button>
        ) : (
          <Badge variant="outline" className="text-muted-foreground border-border text-[11px] font-medium gap-1 py-1 px-2.5 shrink-0">
            <LockIcon className="w-3 h-3 text-amber-500" />
            Chỉ Trưởng nhóm mới có quyền quản lý Sprint
          </Badge>
        )}
      </div>

      {backlogSprints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-muted/20 space-y-2">
          <p className="text-sm font-bold text-foreground">Không có Sprint nào đang mở hoặc trong kế hoạch</p>
          <p className="text-xs text-muted-foreground">
            Các Sprint đã hoàn thành được lưu trữ tại mục Timeline Roadmap và Báo cáo Đóng góp.
          </p>
        </div>
      ) : (
        backlogSprints.map((sprint) => {
          const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
          const sprintHierarchy = groupSprintIssuesByParent(sprintIssues);
          const isCollapsed = collapsedSprints[sprint.id];
          const completedSP = sprintHierarchy.workItems
            .filter((i) => i.status === "DONE")
            .reduce((sum, i) => sum + i.storyPoints, 0);
          const totalSP = sprintHierarchy.workItems.reduce((sum, i) => sum + i.storyPoints, 0);

          return (
            <div
              key={sprint.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, sprint.id)}
              className="rounded-2xl border border-border/70 bg-card shadow-2xs overflow-hidden transition-all"
            >
              <div className="p-3.5 sm:px-4 bg-muted/30 border-b border-border/60">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSprint(sprint.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors shrink-0 mt-0.5 sm:mt-0"
                      aria-label="Thu gọn / Mở rộng Sprint"
                    >
                      {isCollapsed ? (
                        <ChevronRightIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">
                          {sprint.name}
                        </h3>

                        {sprint.status === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <FlameIcon className="w-3 h-3 text-emerald-500" />
                            Đang diễn ra
                          </span>
                        )}
                        {sprint.status === "PLANNED" && (
                          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                            KẾ HOẠCH
                          </Badge>
                        )}

                        <Badge variant="secondary" className="text-[10px] font-mono font-semibold px-2">
                          {sprintHierarchy.workItems.length} tasks
                        </Badge>
                        {sprintIssues.length > sprintHierarchy.workItems.length && (
                          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-semibold px-2">
                            {sprintIssues.length - sprintHierarchy.workItems.length} subtasks
                          </Badge>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <CalendarIcon className="w-3 h-3 text-muted-foreground/70" />
                          {sprint.startDate && sprint.endDate ? `${sprint.startDate} ~ ${sprint.endDate}` : "Chưa thiết lập lịch"}
                        </span>
                        {Boolean(sprint.goal?.trim()) && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="truncate max-w-md italic text-foreground/80">
                              {sprint.goal}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs font-mono">
                        <span className="text-muted-foreground text-[11px]">Tiến độ SP: </span>
                        <strong className="text-emerald-600 font-bold">{completedSP}</strong>
                        <span className="text-muted-foreground text-[11px]">/{totalSP} SP</span>
                      </div>
                      {totalSP > 0 && (
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden border border-border/40 hidden sm:block">
                          <div
                            className="h-full bg-emerald-500 transition-all rounded-full"
                            style={{ width: `${Math.min(100, Math.round((completedSP / totalSP) * 100))}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isTeamLeader && (
                        <>
                          {sprint.status === "PLANNED" && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(updatingSprintId)}
                              onClick={() => onStartSprint(sprint.id)}
                              className="h-7.5 text-xs font-bold rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-2.5 shadow-2xs disabled:opacity-60"
                            >
                              {updatingSprintId === sprint.id ? (
                                <>
                                  <Loader2Icon className="w-3 h-3 animate-spin" />
                                  <span>Đang đồng bộ...</span>
                                </>
                              ) : (
                                <>
                                  <PlayIcon className="w-3 h-3" />
                                  <span>Bắt đầu</span>
                                </>
                              )}
                            </Button>
                          )}

                          {sprint.status === "ACTIVE" && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(updatingSprintId)}
                              onClick={() => onCompleteSprint(sprint.id)}
                              className="h-7.5 text-xs font-bold rounded-xl gap-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer px-2.5 shadow-2xs disabled:opacity-60"
                            >
                              {updatingSprintId === sprint.id ? (
                                <>
                                  <Loader2Icon className="w-3 h-3 animate-spin" />
                                  <span>Đang hoàn thành...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2Icon className="w-3 h-3" />
                                  <span>Hoàn thành</span>
                                </>
                              )}
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={Boolean(updatingSprintId)}
                            onClick={() => onEditSprint(sprint)}
                            className="h-7.5 w-7.5 p-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer border-border/60 disabled:opacity-50"
                            title="Chỉnh sửa Sprint"
                          >
                            <Edit3Icon className="w-3 h-3" />
                          </Button>
                        </>
                      )}

                      {isTeamLeader && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onCreateIssueClick(sprint.id)}
                          title="Tạo với đầy đủ thông tin"
                          className="h-7.5 text-xs font-semibold rounded-xl gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40 px-2.5"
                        >
                          <PlusIcon className="w-3 h-3" />
                          <span>Thêm task</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!isCollapsed && (
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar overscroll-contain">
                  {sprintHierarchy.workItems.length === 0 ? (
                    <div className="m-3 p-4 rounded-xl border border-dashed border-border/70 hover:border-primary/50 bg-muted/10 hover:bg-muted/20 transition-all flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>Kéo thả task từ Backlog vào đây để phân bổ cho Sprint này</span>
                      {isTeamLeader && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onCreateIssueClick(sprint.id)}
                          className="h-7 text-xs font-semibold rounded-lg gap-1 cursor-pointer shrink-0"
                        >
                          <PlusIcon className="w-3 h-3" />
                          <span>Tạo task mới</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    sprintHierarchy.workItems.map((issue) => {
                      const subtasks = sprintHierarchy.subtasksByParentKey.get(issue.key) || [];
                      return (
                        <div key={issue.id}>
                          {renderTaskItem(issue, false, subtasks.length)}
                          {expandedSubtaskParents[issue.key] && subtasks.map((subtask) =>
                            renderTaskItem(subtask, true)
                          )}
                        </div>
                      );
                    })
                  )}

                  {sprintHierarchy.orphanSubtasks.length > 0 && (
                    <div className="border-t border-cyan-500/20 bg-cyan-500/[0.025]">
                      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-cyan-500/15">
                        <div className="flex items-center gap-2 min-w-0">
                          <GitBranchIcon className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="text-xs font-bold text-foreground">Subtasks chưa tìm thấy task cha</span>
                        </div>
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono text-[10px]">
                          {sprintHierarchy.orphanSubtasks.length}
                        </Badge>
                      </div>
                      <p className="px-3.5 pt-2 text-[10px] text-muted-foreground">
                        Jira có trả parent nhưng task cha chưa nằm trong Sprint hoặc chưa được đồng bộ về SAGA.
                      </p>
                      {sprintHierarchy.orphanSubtasks.map((subtask) => renderTaskItem(subtask, true))}
                    </div>
                  )}

                  <QuickCreateTask
                    projectId={projectId}
                    jiraIntegrationId={jiraIntegrationId}
                    sprintId={sprint.id}
                    sprintExternalId={sprint.externalSprintId != null ? String(sprint.externalSprintId) : undefined}
                    sprintName={sprint.name}
                    canCreate={isTeamLeader}
                    onOpenFullModal={() => onCreateIssueClick(sprint.id)}
                  />
                </div>
              )}
            </div>
          );
        })
      )}

      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "backlog")}
        className="rounded-2xl border border-border/70 bg-card shadow-2xs overflow-hidden transition-all"
      >
        <div className="p-3.5 sm:px-4 bg-muted/30 border-b border-border/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => toggleSprint("product-backlog")}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors shrink-0 mt-0.5 sm:mt-0"
                aria-label="Thu gọn / Mở rộng Backlog"
              >
                {isBacklogCollapsed ? (
                  <ChevronRightIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <LayersIcon className="w-4 h-4 text-primary" />
                    <span>Backlog</span>
                  </h3>

                  <Badge variant="outline" className="text-[10px] font-bold font-mono bg-background">
                    {productBacklogHierarchy.workItems.length} tasks
                  </Badge>

                  {productBacklogIssues.length > productBacklogHierarchy.workItems.length && (
                    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono">
                      {productBacklogIssues.length - productBacklogHierarchy.workItems.length} subtasks
                    </Badge>
                  )}

                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                    {backlogTotalSP} SP
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Các đầu việc chưa gắn vào Sprint. Kéo thả lên Sprint phía trên để đưa vào kế hoạch.
                </p>
              </div>
            </div>

            {isTeamLeader && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateIssueClick("backlog")}
                  title="Tạo với đầy đủ thông tin"
                  className="h-7.5 text-xs font-semibold rounded-xl gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40 px-2.5"
                >
                  <PlusIcon className="w-3 h-3" />
                  <span>Thêm task vào Backlog</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isBacklogCollapsed && (
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar overscroll-contain">
            {productBacklogHierarchy.workItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Mục Backlog hiện tại đang trống. Tất cả tasks đã được phân bổ vào các Sprint.
              </div>
            ) : (
              productBacklogHierarchy.workItems.map((issue) => {
                const subtasks = productBacklogHierarchy.subtasksByParentKey.get(issue.key) || [];
                return (
                  <div key={issue.id}>
                    {renderTaskItem(issue, false, subtasks.length)}
                    {expandedSubtaskParents[issue.key] && subtasks.map((subtask) =>
                      renderTaskItem(subtask, true)
                    )}
                  </div>
                );
              })
            )}

            {productBacklogHierarchy.orphanSubtasks.length > 0 && (
              <div className="border-t border-cyan-500/20 bg-cyan-500/[0.025]">
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-cyan-500/15">
                  <div className="flex items-center gap-2 min-w-0">
                    <GitBranchIcon className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="text-xs font-bold text-foreground">Subtasks chưa tìm thấy task cha</span>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono text-[10px]">
                    {productBacklogHierarchy.orphanSubtasks.length}
                  </Badge>
                </div>
                <p className="px-3.5 pt-2 text-[10px] text-muted-foreground">
                  Jira có trả parent nhưng task cha chưa nằm trong Backlog hoặc chưa được đồng bộ về SAGA.
                </p>
                {productBacklogHierarchy.orphanSubtasks.map((subtask) => renderTaskItem(subtask, true))}
              </div>
            )}

            <QuickCreateTask
              projectId={projectId}
              jiraIntegrationId={jiraIntegrationId}
              sprintId="backlog"
              sprintName="Backlog"
              canCreate={isTeamLeader}
              onOpenFullModal={() => onCreateIssueClick("backlog")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
