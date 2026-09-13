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
  FlameIcon,
  AlertTriangleIcon,
} from "lucide-react";
import Link from "next/link";
import type { Sprint, SprintIssue } from "../types/sprint-progress";
import { renderTypeIcon, renderPriorityIcon } from "./sprint-board-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  isTeamLeader: boolean;
  currentUserStudentCode: string;
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
  isTeamLeader,
  currentUserStudentCode,
}: SprintBacklogViewProps) {
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
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
  const isBacklogCollapsed = Boolean(collapsedSprints["product-backlog"]);
  const backlogTotalSP = productBacklogIssues.reduce((sum, i) => sum + i.storyPoints, 0);

  const renderTaskItem = (issue: SprintIssue) => {
    const canDrag = isTeamLeader || issue.assignee.studentCode === currentUserStudentCode;
    const isMsrAnomaly = issue.status === "DONE" && (issue.githubCommitCount ?? 0) === 0;

    return (
      <div
        key={issue.id}
        draggable={canDrag}
        onDragStart={(e) => handleDragStart(e, issue)}
        onClick={() => onIssueClick(issue)}
        className={`px-3.5 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between gap-3 group border-b border-border/40 last:border-b-0 ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer opacity-90"
          } ${isMsrAnomaly ? "bg-amber-500/5" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {canDrag ? (
            <GripVerticalIcon className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0 -ml-1" />
          ) : (
            <span title="Chỉ đọc (Task của thành viên khác)">
              <LockIcon className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            </span>
          )}

          <div className="shrink-0">{renderTypeIcon(issue.type)}</div>

          <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors shrink-0">
            {issue.key}
          </span>

          <span className="text-xs font-semibold text-foreground truncate">
            {issue.summary}
          </span>

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

        <div className="flex items-center gap-2.5 shrink-0 text-xs">
          {renderPriorityIcon(issue.priority)}

          <Badge
            variant="outline"
            className={
              issue.status === "DONE"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-[10px]"
                : issue.status === "IN_PROGRESS"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-bold text-[10px]"
                  : "text-[10px] font-medium"
            }
          >
            {issue.status}
          </Badge>

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
            href={`/student/graph?taskId=${issue.key}`}
            onClick={(e) => e.stopPropagation()}
            title="Xem minh chứng trên Đồ thị Neo4j"
            className="text-muted-foreground/60 hover:text-primary transition-colors p-0.5 rounded"
          >
            <NetworkIcon className="w-3 h-3" />
          </Link>

          <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5">
            {issue.storyPoints} SP
          </Badge>

          <Avatar className="w-5.5 h-5.5 border shrink-0">
            <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
            <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">
              {issue.assignee.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
              {productBacklogIssues.length} backlog tasks
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
          const isCollapsed = collapsedSprints[sprint.id];
          const completedSP = sprintIssues
            .filter((i) => i.status === "DONE")
            .reduce((sum, i) => sum + i.storyPoints, 0);
          const totalSP = sprintIssues.reduce((sum, i) => sum + i.storyPoints, 0);

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
                            ACTIVE SPRINT
                          </span>
                        )}
                        {sprint.status === "PLANNED" && (
                          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                            KẾ HOẠCH
                          </Badge>
                        )}

                        <Badge variant="secondary" className="text-[10px] font-mono font-semibold px-2">
                          {sprintIssues.length} tasks
                        </Badge>
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
                              onClick={() => onStartSprint(sprint.id)}
                              className="h-7.5 text-xs font-bold rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-2.5 shadow-2xs"
                            >
                              <PlayIcon className="w-3 h-3" />
                              <span>Bắt đầu</span>
                            </Button>
                          )}

                          {sprint.status === "ACTIVE" && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onCompleteSprint(sprint.id)}
                              className="h-7.5 text-xs font-bold rounded-xl gap-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer px-2.5 shadow-2xs"
                            >
                              <CheckCircle2Icon className="w-3 h-3" />
                              <span>Hoàn thành</span>
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onEditSprint(sprint)}
                            className="h-7.5 w-7.5 p-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer border-border/60"
                            title="Chỉnh sửa Sprint"
                          >
                            <Edit3Icon className="w-3 h-3" />
                          </Button>
                        </>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onCreateIssueClick(sprint.id)}
                        className="h-7.5 text-xs font-semibold rounded-xl gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40 px-2.5"
                      >
                        <PlusIcon className="w-3 h-3" />
                        <span>Thêm task</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {!isCollapsed && (
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar overscroll-contain">
                  {sprintIssues.length === 0 ? (
                    <div className="m-3 p-4 rounded-xl border border-dashed border-border/70 hover:border-primary/50 bg-muted/10 hover:bg-muted/20 transition-all flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>Kéo thả task từ Backlog vào đây để phân bổ cho Sprint này</span>
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
                    </div>
                  ) : (
                    sprintIssues.map(renderTaskItem)
                  )}
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
                    <span>Backlog tồn đọng (Product Backlog)</span>
                  </h3>

                  <Badge variant="outline" className="text-[10px] font-bold font-mono bg-background">
                    {productBacklogIssues.length} tasks
                  </Badge>

                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                    {backlogTotalSP} SP
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Các đầu việc chưa gắn vào Sprint. Kéo thả lên Sprint phía trên để đưa vào kế hoạch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCreateIssueClick("backlog")}
                className="h-7.5 text-xs font-semibold rounded-xl gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40 px-2.5"
              >
                <PlusIcon className="w-3 h-3" />
                <span>Thêm task vào Backlog</span>
              </Button>
            </div>
          </div>
        </div>

        {!isBacklogCollapsed && (
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar overscroll-contain">
            {productBacklogIssues.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Mục Backlog hiện tại đang trống. Tất cả tasks đã được phân bổ vào các Sprint.
              </div>
            ) : (
              productBacklogIssues.map(renderTaskItem)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
